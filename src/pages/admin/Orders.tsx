import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OrderStatusTimeline } from "@/components/OrderStatusTimeline";

type OrderRow = {
  id: string; total: number; status: string; notes: string | null; created_at: string; user_id: string;
  order_items: { item_name: string; quantity: number; unit_price: number }[];
};
type Profile = { id: string; full_name: string | null; phone: string | null };

const STATUSES = ["pending", "preparing", "ready", "completed", "cancelled"];
const FILTERS = ["active", "all", "pending", "preparing", "ready", "completed", "cancelled"];

const statusVariant = (s: string) =>
  s === "pending" ? "secondary" : s === "completed" ? "default" : s === "cancelled" ? "destructive" : "default";

const OrdersAdmin = () => {
  const [list, setList] = useState<OrderRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [filter, setFilter] = useState<string>("active");

  const load = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(item_name, quantity, unit_price)")
      .order("created_at", { ascending: false });
    const orders = (data ?? []) as OrderRow[];
    setList(orders);

    const userIds = [...new Set(orders.map((o) => o.user_id))];
    if (userIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, phone").in("id", userIds);
      const map: Record<string, Profile> = {};
      (profs ?? []).forEach((p) => { map[p.id] = p as Profile; });
      setProfiles(map);
    }
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("admin-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
  };

  const filtered = list.filter((o) => {
    if (filter === "all") return true;
    if (filter === "active") return !["completed", "cancelled"].includes(o.status);
    return o.status === filter;
  });

  const counts = {
    active: list.filter((o) => !["completed", "cancelled"].includes(o.status)).length,
    pending: list.filter((o) => o.status === "pending").length,
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-2 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl mb-2">Orders</h1>
          <p className="text-muted-foreground">
            {counts.active} active · {counts.pending} new · live updates enabled
          </p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6 mt-6">
        <TabsList className="flex-wrap h-auto">
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f} className="capitalize">{f}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filtered.map((o) => {
          const customer = profiles[o.user_id];
          return (
            <div key={o.id} className="bg-card border border-border/60 p-5">
              <div className="flex justify-between items-start gap-4 mb-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">#{o.id.slice(0, 8)}</p>
                    <Badge variant={statusVariant(o.status) as any} className="capitalize">{o.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{format(new Date(o.created_at), "PPp")}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-primary" />
                      {customer?.full_name || "Guest"}
                    </span>
                    {customer?.phone && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {customer.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <p className="font-display text-2xl gold-text">€{Number(o.total).toFixed(2)}</p>
                </div>
              </div>

              <div className="mb-4">
                <OrderStatusTimeline status={o.status} />
              </div>

              <div className="text-sm text-muted-foreground border-t border-border pt-3 space-y-1">
                {o.order_items.map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{i.quantity}× {i.item_name}</span>
                    <span>€{(i.quantity * Number(i.unit_price)).toFixed(2)}</span>
                  </div>
                ))}
                {o.notes && <p className="mt-2 italic">Note: "{o.notes}"</p>}
              </div>

              <div className="flex justify-end items-center gap-2 mt-4 pt-3 border-t border-border">
                <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => remove(o.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="p-8 text-center text-muted-foreground text-sm bg-card border border-border/60">
            No orders in this view.
          </p>
        )}
      </div>
    </div>
  );
};
export default OrdersAdmin;

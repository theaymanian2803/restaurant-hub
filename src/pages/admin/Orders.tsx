import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type OrderRow = {
  id: string; total: number; status: string; notes: string | null; created_at: string;
  order_items: { item_name: string; quantity: number; unit_price: number }[];
};

const STATUSES = ["pending", "preparing", "ready", "completed", "cancelled"];

const OrdersAdmin = () => {
  const [list, setList] = useState<OrderRow[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(item_name, quantity, unit_price)")
      .order("created_at", { ascending: false });
    setList((data ?? []) as OrderRow[]);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this order?")) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Orders</h1>
      <p className="text-muted-foreground mb-8">Customer orders, newest first.</p>

      <div className="space-y-3">
        {list.map((o) => (
          <div key={o.id} className="bg-card border border-border/60 p-5">
            <div className="flex justify-between items-start gap-4 mb-3">
              <div>
                <p className="text-sm text-muted-foreground">{format(new Date(o.created_at), "PPp")}</p>
                <p className="font-display text-2xl gold-text mt-1">€{Number(o.total).toFixed(2)}</p>
              </div>
              <div className="flex gap-2 items-center">
                <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                  <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => remove(o.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground border-t border-border pt-3">
              {o.order_items.map((i, idx) => (
                <div key={idx} className="flex justify-between py-1">
                  <span>{i.quantity}× {i.item_name}</span>
                  <span>€{(i.quantity * Number(i.unit_price)).toFixed(2)}</span>
                </div>
              ))}
              {o.notes && <p className="mt-2 italic">Note: "{o.notes}"</p>}
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm bg-card border border-border/60">No orders yet.</p>}
      </div>
    </div>
  );
};
export default OrdersAdmin;

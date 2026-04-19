import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import { OrderStatusTimeline } from "@/components/OrderStatusTimeline";

type Reservation = { id: string; reservation_date: string; reservation_time: string; party_size: number; status: string; notes: string | null };
type OrderRow = {
  id: string; total: number; status: string; created_at: string; notes: string | null;
  order_items: { item_name: string; quantity: number; unit_price: number }[];
};

const Account = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  const loadOrders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(item_name, quantity, unit_price)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as OrderRow[]);
  };

  useEffect(() => {
    if (!user) return;
    supabase.from("reservations").select("*").eq("user_id", user.id).order("reservation_date", { ascending: false })
      .then(({ data }) => setReservations((data ?? []) as Reservation[]));
    loadOrders();

    // Realtime: subscribe to changes on this user's orders
    const channel = supabase
      .channel(`user-orders-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        () => loadOrders()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const activeOrders = orders.filter((o) => !["completed", "cancelled"].includes(o.status));
  const pastOrders = orders.filter((o) => ["completed", "cancelled"].includes(o.status));

  return (
    <div className="container-narrow py-20 max-w-4xl">
      <div className="flex justify-between items-start mb-12">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary mb-3">Welcome</p>
          <h1 className="font-display text-4xl md:text-5xl break-all">{user?.email}</h1>
        </div>
        <div className="flex gap-2 shrink-0">
          {isAdmin && <Link to="/admin"><Button variant="outline" className="border-primary/40">Admin</Button></Link>}
          <Button variant="ghost" onClick={signOut}><LogOut className="h-4 w-4 mr-2" />Sign out</Button>
        </div>
      </div>

      {activeOrders.length > 0 && (
        <section className="mb-16">
          <h2 className="font-display text-2xl mb-6 flex items-center gap-4">
            Active orders <span className="text-xs uppercase tracking-[0.3em] text-primary">live</span>
            <span className="flex-1 h-px bg-border" />
          </h2>
          <div className="space-y-6">
            {activeOrders.map((o) => (
              <div key={o.id} className="bg-card border border-primary/30 p-6 shadow-gold/20">
                <div className="flex justify-between items-start mb-6 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground mt-1">{format(new Date(o.created_at), "PPp")}</p>
                  </div>
                  <p className="font-display text-2xl gold-text">€{Number(o.total).toFixed(2)}</p>
                </div>

                <div className="mb-6">
                  <OrderStatusTimeline status={o.status} />
                </div>

                <div className="text-sm text-muted-foreground border-t border-border/60 pt-4 space-y-1">
                  {o.order_items.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{i.quantity}× {i.item_name}</span>
                      <span>€{(i.quantity * Number(i.unit_price)).toFixed(2)}</span>
                    </div>
                  ))}
                  {o.notes && <p className="mt-3 italic">Note: "{o.notes}"</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mb-16">
        <h2 className="font-display text-2xl mb-6 flex items-center gap-4">Reservations <span className="flex-1 h-px bg-border" /></h2>
        {reservations.length === 0 ? (
          <p className="text-muted-foreground text-sm">No reservations yet.</p>
        ) : (
          <div className="space-y-3">
            {reservations.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-card border border-border/60 p-5">
                <div>
                  <p className="font-display text-lg">{format(new Date(r.reservation_date), "EEEE, MMM d")} · {r.reservation_time}</p>
                  <p className="text-sm text-muted-foreground">Party of {r.party_size}{r.notes ? ` · ${r.notes}` : ""}</p>
                </div>
                <Badge variant={r.status === "confirmed" ? "default" : "secondary"}>{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl mb-6 flex items-center gap-4">Order history <span className="flex-1 h-px bg-border" /></h2>
        {pastOrders.length === 0 ? (
          <p className="text-muted-foreground text-sm">No past orders.</p>
        ) : (
          <div className="space-y-3">
            {pastOrders.map((o) => (
              <div key={o.id} className="bg-card border border-border/60 p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">#{o.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground mt-1">{format(new Date(o.created_at), "PPp")}</p>
                  </div>
                  <Badge variant={o.status === "completed" ? "default" : "secondary"}>{o.status}</Badge>
                </div>
                <p className="text-sm mb-2 text-muted-foreground">{o.order_items.map((i) => `${i.quantity}× ${i.item_name}`).join(" · ")}</p>
                <p className="text-primary font-medium">€{Number(o.total).toFixed(2)}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Account;

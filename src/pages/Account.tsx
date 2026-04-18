import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

type Reservation = { id: string; reservation_date: string; reservation_time: string; party_size: number; status: string; notes: string | null };
type OrderRow = { id: string; total: number; status: string; created_at: string; order_items: { item_name: string; quantity: number }[] };

const Account = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("reservations").select("*").eq("user_id", user.id).order("reservation_date", { ascending: false })
      .then(({ data }) => setReservations((data ?? []) as Reservation[]));
    supabase.from("orders").select("*, order_items(item_name, quantity)").eq("user_id", user.id).order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as OrderRow[]));
  }, [user]);

  return (
    <div className="container-narrow py-20 max-w-4xl">
      <div className="flex justify-between items-start mb-12">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary mb-3">Welcome</p>
          <h1 className="font-display text-4xl md:text-5xl">{user?.email}</h1>
        </div>
        <div className="flex gap-2">
          {isAdmin && <Link to="/admin"><Button variant="outline" className="border-primary/40">Admin</Button></Link>}
          <Button variant="ghost" onClick={signOut}><LogOut className="h-4 w-4 mr-2" />Sign out</Button>
        </div>
      </div>

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
        <h2 className="font-display text-2xl mb-6 flex items-center gap-4">Orders <span className="flex-1 h-px bg-border" /></h2>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-sm">No orders yet.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-card border border-border/60 p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-muted-foreground">{format(new Date(o.created_at), "PPp")}</p>
                  <Badge variant={o.status === "completed" ? "default" : "secondary"}>{o.status}</Badge>
                </div>
                <p className="text-sm mb-2">{o.order_items.map((i) => `${i.quantity}× ${i.item_name}`).join(" · ")}</p>
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

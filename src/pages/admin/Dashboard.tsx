import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UtensilsCrossed, CalendarCheck, ShoppingBag, ListTree } from "lucide-react";

const Stat = ({ icon: Icon, label, value }: { icon: any; label: string; value: number | string }) => (
  <div className="bg-card border border-border/60 p-6">
    <Icon className="h-5 w-5 text-primary mb-4" />
    <p className="text-3xl font-display gold-text">{value}</p>
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">{label}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ items: 0, categories: 0, reservations: 0, orders: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("menu_items").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]).then(([m, c, r, o]) => {
      setStats({
        items: m.count ?? 0,
        categories: c.count ?? 0,
        reservations: r.count ?? 0,
        orders: o.count ?? 0,
      });
    });
  }, []);

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-10">Today at Saveur.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat icon={ListTree} label="Categories" value={stats.categories} />
        <Stat icon={UtensilsCrossed} label="Menu items" value={stats.items} />
        <Stat icon={CalendarCheck} label="Pending bookings" value={stats.reservations} />
        <Stat icon={ShoppingBag} label="Pending orders" value={stats.orders} />
      </div>
    </div>
  );
};
export default Dashboard;

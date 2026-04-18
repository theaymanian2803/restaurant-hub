import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Reservation = {
  id: string; name: string; email: string; phone: string;
  party_size: number; reservation_date: string; reservation_time: string;
  notes: string | null; status: string; created_at: string;
};

const STATUSES = ["pending", "confirmed", "cancelled", "completed"];

const ReservationsAdmin = () => {
  const [list, setList] = useState<Reservation[]>([]);

  const load = async () => {
    const { data } = await supabase.from("reservations").select("*").order("reservation_date", { ascending: true });
    setList((data ?? []) as Reservation[]);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("reservations").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this reservation?")) return;
    const { error } = await supabase.from("reservations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <h1 className="font-display text-4xl mb-2">Reservations</h1>
      <p className="text-muted-foreground mb-8">All bookings, sorted by date.</p>

      <div className="bg-card border border-border/60 divide-y divide-border">
        {list.map((r) => (
          <div key={r.id} className="p-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
            <div>
              <p className="font-display text-lg">{r.name} · party of {r.party_size}</p>
              <p className="text-sm text-muted-foreground">{r.email} · {r.phone}</p>
              {r.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{r.notes}"</p>}
            </div>
            <div className="text-sm">
              <p className="font-medium">{format(new Date(r.reservation_date), "PPP")}</p>
              <p className="text-muted-foreground">{r.reservation_time}</p>
            </div>
            <Select value={r.status} onValueChange={(v) => updateStatus(r.id, v)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
          </div>
        ))}
        {list.length === 0 && <p className="p-8 text-center text-muted-foreground text-sm">No reservations yet.</p>}
      </div>
    </div>
  );
};
export default ReservationsAdmin;

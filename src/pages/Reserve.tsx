import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(2, "Required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(5, "Required").max(30),
  party_size: z.number({ message: "Required" }).int().min(1).max(20),
  reservation_date: z.date({ message: "Pick a date" }),
  reservation_time: z.string().min(1, "Pick a time"),
  notes: z.string().max(500).optional(),
});

type FormVals = z.infer<typeof schema>;

const TIMES = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"];

const Reserve = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: user?.email ?? "", phone: "", party_size: 2, reservation_time: "", notes: "" },
  });

  const onSubmit = async (values: FormVals) => {
    if (!user) {
      toast.error("Please sign in to reserve a table.");
      navigate("/auth?redirect=/reserve");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reservations").insert({
      user_id: user.id,
      name: values.name,
      email: values.email,
      phone: values.phone,
      party_size: values.party_size,
      reservation_date: format(values.reservation_date, "yyyy-MM-dd"),
      reservation_time: values.reservation_time,
      notes: values.notes || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't submit reservation", { description: error.message });
      return;
    }
    toast.success("Reservation requested", { description: "We'll confirm by email shortly." });
    navigate("/account");
  };

  return (
    <div className="container-narrow py-20 max-w-2xl">
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">
          <span className="hairline mr-4" />Reservations
        </p>
        <h1 className="font-display text-5xl md:text-6xl mb-4">Book a <em className="gold-text not-italic">table</em></h1>
        <p className="text-muted-foreground">Tell us when, and we'll set the candles.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card border border-border/60 p-8 shadow-elegant">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="party_size" render={({ field }) => (
              <FormItem>
                <FormLabel>Party size</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input type="tel" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="reservation_date" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant="outline" className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="reservation_time" render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Pick a time" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIMES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
              <FormLabel>Notes <span className="text-muted-foreground">(optional)</span></FormLabel>
              <FormControl><Textarea rows={3} placeholder="Allergies, occasion…" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Request reservation
          </Button>
          {!user && <p className="text-xs text-center text-muted-foreground">You'll be asked to sign in to confirm.</p>}
        </form>
      </Form>
    </div>
  );
};

export default Reserve;

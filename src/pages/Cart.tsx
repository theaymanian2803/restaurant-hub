import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Cart = () => {
  const { items, setQty, remove, total, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate("/auth?redirect=/cart");
      return;
    }
    if (items.length === 0) return;
    setSubmitting(true);
    const totalAmount = total();
    const { data: order, error } = await supabase
      .from("orders")
      .insert({ user_id: user.id, total: totalAmount, notes: notes || null })
      .select()
      .single();

    if (error || !order) {
      setSubmitting(false);
      toast.error("Couldn't place order", { description: error?.message });
      return;
    }

    const { error: itemsErr } = await supabase.from("order_items").insert(
      items.map((i) => ({
        order_id: order.id,
        menu_item_id: i.id,
        item_name: i.name,
        quantity: i.quantity,
        unit_price: i.price,
      }))
    );

    setSubmitting(false);
    if (itemsErr) {
      toast.error("Order saved partially", { description: itemsErr.message });
      return;
    }
    clear();
    toast.success("Order placed!", { description: "Pay at the restaurant on pickup." });
    navigate("/account");
  };

  return (
    <div className="container-narrow py-20 max-w-3xl">
      <h1 className="font-display text-5xl md:text-6xl mb-12 text-center">
        Your <em className="gold-text not-italic">order</em>
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16 border border-border/60 bg-card">
          <p className="text-muted-foreground mb-6">Your cart is empty.</p>
          <Link to="/menu">
            <Button variant="outline" className="border-primary/40">Browse menu</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.id} className="flex items-center gap-4 bg-card border border-border/60 p-5">
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg">{i.name}</h3>
                <p className="text-sm text-muted-foreground">€{i.price.toFixed(2)} each</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQty(i.id, i.quantity - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center">{i.quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setQty(i.id, i.quantity + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="w-20 text-right text-primary font-medium">€{(i.price * i.quantity).toFixed(2)}</div>
              <Button variant="ghost" size="icon" onClick={() => remove(i.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special requests, allergies..."
            rows={3}
            maxLength={500}
            className="mt-6"
          />

          <div className="flex justify-between items-baseline pt-6 border-t border-border">
            <span className="text-lg uppercase tracking-[0.2em] text-muted-foreground">Total</span>
            <span className="font-display text-3xl gold-text">€{total().toFixed(2)}</span>
          </div>

          <Button
            onClick={handleCheckout}
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold"
            size="lg"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Place order · Pay at restaurant
          </Button>
        </div>
      )}
    </div>
  );
};

export default Cart;

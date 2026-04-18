import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type Category = { id: string; name: string; sort_order: number };
type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  is_available: boolean;
};

const MenuPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const add = useCart((s) => s.add);

  useEffect(() => {
    Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("menu_items").select("*").eq("is_available", true).order("name"),
    ]).then(([c, m]) => {
      setCategories((c.data ?? []) as Category[]);
      setItems((m.data ?? []) as Item[]);
      setLoading(false);
    });
  }, []);

  const handleAdd = (item: Item) => {
    add({ id: item.id, name: item.name, price: Number(item.price) });
    toast.success(`${item.name} added`, { description: "Open your cart to checkout." });
  };

  return (
    <div className="container-narrow py-20">
      <div className="text-center mb-20">
        <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">
          <span className="hairline mr-4" />A la carte
        </p>
        <h1 className="font-display text-5xl md:text-7xl mb-6">
          Our <em className="gold-text not-italic">menu</em>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Built daily around what's at the market. Add items to your cart to place a pickup order.
        </p>
      </div>

      {loading && <p className="text-center text-muted-foreground">Loading…</p>}

      <div className="space-y-20">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category_id === cat.id);
          if (catItems.length === 0) return null;
          return (
            <motion.section
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-baseline gap-6 mb-10">
                <h2 className="font-display text-3xl md:text-4xl">{cat.name}</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                {catItems.map((item) => (
                  <article key={item.id} className="group flex gap-4 items-start">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        className="w-20 h-20 object-cover border border-border/60"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-3 mb-1">
                        <h3 className="font-display text-lg">{item.name}</h3>
                        <span className="flex-1 border-b border-dotted border-border" />
                        <span className="text-primary font-medium">€{Number(item.price).toFixed(2)}</span>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{item.description}</p>
                      )}
                      <button
                        onClick={() => handleAdd(item)}
                        className="text-xs uppercase tracking-[0.2em] text-primary hover:text-primary-glow transition-colors inline-flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" /> Add to order
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
};

export default MenuPage;

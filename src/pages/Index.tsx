import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-restaurant.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Item = { id: string; name: string; description: string | null; price: number; image_url: string | null };

const Index = () => {
  const [signature, setSignature] = useState<Item[]>([]);

  useEffect(() => {
    supabase
      .from("menu_items")
      .select("id, name, description, price, image_url")
      .eq("is_available", true)
      .limit(3)
      .then(({ data }) => setSignature((data ?? []) as Item[]));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[92vh] min-h-[640px] flex items-center">
        <img
          src={hero}
          alt="Candlelit dining room at Saveur"
          width={1920}
          height={1280}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-60" />

        <div className="relative container-narrow">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">
              <span className="hairline mr-4" />Est. 1998
            </p>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-8">
              A quiet kind of <em className="gold-text not-italic">elegance</em>.
            </h1>
            <p className="text-lg text-foreground/80 max-w-xl mb-10 leading-relaxed">
              Hand-rolled pasta, dry-aged steaks, and a cellar curated over a quarter century. An evening at Saveur is a slow conversation.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/reserve">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold">
                  Reserve a table
                </Button>
              </Link>
              <Link to="/menu">
                <Button size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10">
                  View the menu
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STORY */}
      <section className="container-narrow py-28 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">
            <span className="hairline mr-4" />Our story
          </p>
          <h2 className="font-display text-4xl md:text-5xl mb-8 leading-tight">
            Twenty-five years of <em className="gold-text not-italic">slow cooking</em>.
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Chef Elena Romano opened Saveur with a single conviction: that great food cannot be hurried. Every plate is built from a relationship — with a farmer, a fisherman, a vintner.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Tonight, that same quiet philosophy guides the kitchen and the cellar.
          </p>
        </div>
        <div className="aspect-[4/5] bg-card border border-border/60 shadow-elegant relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial-gold opacity-40" />
          <div className="absolute inset-8 border border-primary/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <p className="font-display italic text-2xl gold-text mb-3">"Cucina è tempo."</p>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">— Elena Romano</p>
            </div>
          </div>
        </div>
      </section>

      {/* SIGNATURE */}
      <section className="container-narrow pb-28">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">
            <span className="hairline mr-4" />Signature dishes
          </p>
          <h2 className="font-display text-4xl md:text-5xl">From the <em className="gold-text not-italic">kitchen</em></h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {signature.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group border border-border/60 p-8 bg-card hover:border-primary/40 transition-all hover:shadow-gold"
            >
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-display text-xl">{item.name}</h3>
                <span className="text-primary font-medium">€{item.price.toFixed(2)}</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/menu">
            <Button variant="outline" size="lg" className="border-primary/40 hover:bg-primary/10">
              See the full menu
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="border-y border-border/60 bg-card/50">
        <div className="container-narrow py-24 text-center">
          <h2 className="font-display text-4xl md:text-6xl mb-6">
            Tonight, <em className="gold-text not-italic">linger</em>.
          </h2>
          <p className="text-muted-foreground mb-10 max-w-md mx-auto">
            Reserve your table — we'll take care of the rest.
          </p>
          <Link to="/reserve">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold">
              Book a table
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;

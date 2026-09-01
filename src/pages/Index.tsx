import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import heroFallback from "@/assets/hero-restaurant.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLandingSection } from "@/hooks/useLandingSection";

type Item = { id: string; name: string; description: string | null; price: number; image_url: string | null };

function FeatureIcon({ name }: { name: string }) {
  const Cmp = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name] ?? Icons.Sparkles;
  return <Cmp className="h-6 w-6 text-primary" />;
}

const Index = () => {
  const [signature, setSignature] = useState<Item[]>([]);
  const { data: hero, loading: heroLoading } = useLandingSection("hero");
  const { data: features, loading: featuresLoading } = useLandingSection("features");
  const { data: gallery, loading: galleryLoading } = useLandingSection("gallery");
  const { data: testimonials, loading: testimonialsLoading } = useLandingSection("testimonials");

  useEffect(() => {
    supabase
      .from("menu_items")
      .select("id, name, description, price, image_url")
      .eq("is_available", true)
      .limit(3)
      .then(({ data }) => setSignature((data ?? []) as Item[]));
  }, []);

  const heroImage = hero.image || heroFallback;

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[92vh] min-h-[640px] flex items-center">
        <img
          src={heroImage}
          alt={hero.headline || "Candlelit dining room at Saveur"}
          width={1920}
          height={1280}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-dark" />
        <div className="absolute inset-0 bg-gradient-radial-gold opacity-60" />

        <div className="relative container-narrow">
          {heroLoading ? (
            <div className="max-w-2xl space-y-6">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-2/3" />
              <Skeleton className="h-11 w-44" />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">
                <span className="hairline mr-4" />{hero.eyebrow}
              </p>
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-8">{hero.headline}</h1>
              <p className="text-lg text-foreground/80 max-w-xl mb-10 leading-relaxed">{hero.subheadline}</p>
              <div className="flex flex-wrap gap-4">
                <Link to={hero.ctaUrl || "/reserve"}>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-gold">
                    {hero.ctaText}
                  </Button>
                </Link>
                <Link to="/menu">
                  <Button size="lg" variant="outline" className="border-primary/40 hover:bg-primary/10">
                    View the menu
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-narrow py-28">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">
            <span className="hairline mr-4" />{features.eyebrow}
          </p>
          <h2 className="font-display text-4xl md:text-5xl">{features.heading}</h2>
        </div>

        {featuresLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {features.items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="border border-border/60 bg-card hover:border-primary/40 transition-all hover:shadow-gold"
              >
                {item.image && (
                  <img src={item.image} alt={item.title} loading="lazy" className="w-full aspect-[4/3] object-cover" />
                )}
                <div className="p-8">
                  <FeatureIcon name={item.icon} />
                  <h3 className="font-display text-xl mt-4 mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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

      {/* GALLERY */}
      {(galleryLoading || gallery.images.length > 0) && (
        <section className="container-narrow pb-28">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">
              <span className="hairline mr-4" />{gallery.eyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-5xl">{gallery.heading}</h2>
          </div>
          {galleryLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="aspect-[4/3] w-full" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.alt || gallery.heading}
                  loading="lazy"
                  className="w-full aspect-[4/3] object-cover border border-border/60 hover:border-primary/40 transition-colors"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* TESTIMONIALS */}
      {(testimonialsLoading || testimonials.items.length > 0) && (
        <section className="container-narrow pb-28">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.4em] text-primary mb-6">
              <span className="hairline mr-4" />{testimonials.eyebrow}
            </p>
            <h2 className="font-display text-4xl md:text-5xl">{testimonials.heading}</h2>
          </div>
          {testimonialsLoading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.items.map((t) => (
                <figure key={t.id} className="border border-border/60 bg-card p-8">
                  <blockquote className="font-display italic text-lg leading-relaxed mb-6">"{t.quote}"</blockquote>
                  <figcaption className="flex items-center gap-4">
                    {t.avatar && (
                      <img src={t.avatar} alt={t.name} loading="lazy" className="h-12 w-12 rounded-full object-cover" />
                    )}
                    <div>
                      <p className="text-sm">{t.name}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.role}</p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      )}

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

import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useLandingSection } from "@/hooks/useLandingSection";

export function Footer() {
  const { data, loading } = useLandingSection("footer");

  return (
    <footer className="border-t border-border/40 mt-24">
      <div className="container-narrow py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <h3 className="font-display text-3xl gold-text mb-4">Saveur</h3>
          <p className="text-muted-foreground max-w-sm leading-relaxed">
            Refined Italian cuisine in an intimate dining room. Open Tuesday to Sunday.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Visit</h4>
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {data.address}
              <br />
              <a href={`tel:${data.phone}`} className="hover:text-primary transition-colors">{data.phone}</a>
              <br />
              <a href={`mailto:${data.email}`} className="hover:text-primary transition-colors">{data.email}</a>
            </p>
          )}
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Follow</h4>
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <ul className="text-sm text-muted-foreground leading-relaxed space-y-1">
              {data.socials.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="container-narrow py-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {data.copyright}</p>
          <Link to="/admin" className="hover:text-primary transition-colors">Staff</Link>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";

export function Footer() {
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
          <p className="text-sm text-muted-foreground leading-relaxed">
            12 Via Dante<br />Milan, IT 20121<br />+39 02 1234 5678
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] text-primary mb-4">Hours</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tue – Thu · 18 — 23<br />Fri – Sat · 18 — 24<br />Sun · 12 — 16
          </p>
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="container-narrow py-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Saveur. All rights reserved.</p>
          <Link to="/admin" className="hover:text-primary transition-colors">Staff</Link>
        </div>
      </div>
    </footer>
  );
}

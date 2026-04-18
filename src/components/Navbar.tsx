import { Link, NavLink as RouterNavLink } from "react-router-dom";
import { ShoppingBag, User, Menu as MenuIcon, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/reserve", label: "Reserve" },
  { to: "/about", label: "About" },
];

export function Navbar() {
  const { user, isAdmin } = useAuth();
  const count = useCart((s) => s.count());
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/70 border-b border-border/40">
      <div className="container-narrow flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-wider gold-text">Saveur</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <RouterNavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                cn(
                  "text-sm uppercase tracking-[0.18em] transition-colors",
                  isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
                )
              }
            >
              {l.label}
            </RouterNavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative inline-flex items-center justify-center h-10 w-10 rounded-sm hover:bg-muted transition-colors">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>
          {user ? (
            <Link to={isAdmin ? "/admin" : "/account"}>
              <Button variant="ghost" size="icon"><User className="h-5 w-5" /></Button>
            </Link>
          ) : (
            <Link to="/auth" className="hidden sm:block">
              <Button variant="outline" size="sm">Sign in</Button>
            </Link>
          )}
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border/40 bg-background">
          <div className="container-narrow flex flex-col py-4 gap-3">
            {links.map((l) => (
              <RouterNavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn("py-2 text-sm uppercase tracking-[0.18em]", isActive ? "text-primary" : "text-foreground/70")
                }
              >
                {l.label}
              </RouterNavLink>
            ))}
            {!user && (
              <Link to="/auth" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Sign in</Button>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}

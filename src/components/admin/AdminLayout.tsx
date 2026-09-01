import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, UtensilsCrossed, ListTree, CalendarCheck, ShoppingBag, LogOut, Home, Sparkles, LayoutTemplate, Images, Quote, PanelBottom } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/categories", label: "Categories", icon: ListTree, end: false },
  { to: "/admin/menu", label: "Menu items", icon: UtensilsCrossed, end: false },
  { to: "/admin/reservations", label: "Reservations", icon: CalendarCheck, end: false },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, end: false },
];

const landingLinks = [
  { to: "/admin/landing/hero", label: "Hero", icon: Sparkles },
  { to: "/admin/landing/features", label: "Features", icon: LayoutTemplate },
  { to: "/admin/landing/gallery", label: "Gallery", icon: Images },
  { to: "/admin/landing/testimonials", label: "Testimonials", icon: Quote },
  { to: "/admin/landing/footer", label: "Footer & contact", icon: PanelBottom },
];

export function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="font-display text-2xl gold-text">Saveur</Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1">Admin</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}

          <p className="px-3 pt-6 pb-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Landing page</p>
          {landingLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )
              }
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start"><Home className="h-4 w-4 mr-2" />Public site</Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />Sign out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

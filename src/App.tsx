import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PublicLayout } from "@/components/PublicLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

import Index from "./pages/Index";
import Menu from "./pages/Menu";
import Reserve from "./pages/Reserve";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Dashboard from "./pages/admin/Dashboard";
import Categories from "./pages/admin/Categories";
import MenuItems from "./pages/admin/MenuItems";
import Reservations from "./pages/admin/Reservations";
import Orders from "./pages/admin/Orders";
import LandingHero from "./pages/admin/LandingHero";
import LandingFeatures from "./pages/admin/LandingFeatures";
import LandingGallery from "./pages/admin/LandingGallery";
import LandingTestimonials from "./pages/admin/LandingTestimonials";
import LandingFooter from "./pages/admin/LandingFooter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/reserve" element={<Reserve />} />
            <Route path="/about" element={<About />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          </Route>
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="menu" element={<MenuItems />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="orders" element={<Orders />} />
            <Route path="landing/hero" element={<LandingHero />} />
            <Route path="landing/features" element={<LandingFeatures />} />
            <Route path="landing/gallery" element={<LandingGallery />} />
            <Route path="landing/testimonials" element={<LandingTestimonials />} />
            <Route path="landing/footer" element={<LandingFooter />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import RestaurantSetup from "./pages/RestaurantSetup";
import RestaurantEdit from "./pages/RestaurantEdit";
import MenuManage from "./pages/MenuManage";
import Menu from "./pages/Menu";
import CustomerMenu from "./pages/CustomerMenu";
import OrderSuccess from "./pages/OrderSuccess";
import AdminPanel from "./pages/AdminPanel";
import Demo3D from "./pages/Demo3D";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/restaurant/setup" element={<RestaurantSetup />} />
            <Route path="/restaurant/edit" element={<RestaurantEdit />} />
            <Route path="/menu/manage" element={<MenuManage />} />
            <Route path="/menu/:restaurantId" element={<Menu />} />
            <Route path="/order/:restaurantId" element={<CustomerMenu />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/demo-3d" element={<Demo3D />} />
            <Route path="/admin" element={<AdminPanel />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
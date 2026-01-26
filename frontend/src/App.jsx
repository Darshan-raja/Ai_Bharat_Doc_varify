import { Toaster } from "@/components/ui/toaster";
import VerifyPAN from "./pages/VerifyPAN";
import VerifyAadhaar from "./pages/VerifyAadhaar";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Verify from "./pages/Verify";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Index />} />
  <Route path="/login" element={<Login />} />

  {/* MARKSHEET (OLD, NICE VERIFY UI) */}
  <Route path="/verify" element={<Verify />} />
  <Route path="/verify/marksheet" element={<Verify />} />

  {/* PAN & AADHAAR (NEW SIMPLE PAGES) */}
  <Route path="/verify/pan" element={<VerifyPAN />} />
  <Route path="/verify/aadhaar" element={<VerifyAadhaar />} />

  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/admin" element={<AdminLogin />} />
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
  <Route path="/help" element={<Help />} />
  <Route path="/privacy" element={<Privacy />} />
  <Route path="/terms" element={<Terms />} />

  {/* CATCH ALL – MUST BE LAST */}
  <Route path="*" element={<NotFound />} />

          {/* <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/help" element={<Help />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />  
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

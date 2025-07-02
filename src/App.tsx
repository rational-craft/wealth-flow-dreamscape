import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
codex/wire-up-sidebar-layout-with-routing
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/layouts/AppShell";
import DashboardPage from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Income from "@/pages/Income";
import Settings from "@/pages/Settings";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DashboardPage from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import AppShell from "@/layouts/AppShell";
main

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
codex/wire-up-sidebar-layout-with-routing
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/income" element={<Income />} />
            <Route path="/settings" element={<Settings />} />
            {/* Legacy index route */}
            <Route path="/index" element={<Index />} />

            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/" element={<Index />} />
            <Route path="/income" element={<Index />} />
            <Route path="/settings" element={<Index />} />
main
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

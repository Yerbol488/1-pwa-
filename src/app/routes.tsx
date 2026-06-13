import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import { AppLayout } from "../components/layout/AppLayout";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { SalesPage } from "../pages/SalesPage";
import { ExpensesPage } from "../pages/ExpensesPage";
import { ProductionPage } from "../pages/ProductionPage";
import { StockPage } from "../pages/StockPage";
import { ItemsPage } from "../pages/ItemsPage";
import { ReportsPage } from "../pages/ReportsPage";
import { ActivityPage } from "../pages/ActivityPage";
import { SettingsPage } from "../pages/SettingsPage";
import { MorePage } from "../pages/MorePage";
import type { ReactNode } from "react";

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/more" element={<MorePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

import { Navigate, Route, Routes } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { AppLayout } from "../components/layout/AppLayout";
import { CompanySetupPage } from "../pages/CompanySetupPage";
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

export function AppRoutes() {
  const { currentBusinessId } = useAppData();

  // State-driven gate: before company setup, ONLY the setup screen renders —
  // no routed pages, no header, no bottom navigation.
  if (!currentBusinessId) {
    return <CompanySetupPage />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
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
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

import { Navigate, Route, Routes } from "react-router-dom";
import { useAppData } from "../context/AppDataContext";
import { AppLayout } from "../components/layout/AppLayout";
import { CompanySetupPage } from "../pages/CompanySetupPage";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { SalesPage } from "../pages/SalesPage";
import { ExpensesPage } from "../pages/ExpensesPage";
import { ProductionPage } from "../pages/ProductionPage";
import { StockPage } from "../pages/StockPage";
import { ItemsPage } from "../pages/ItemsPage";
import { ReportsPage } from "../pages/ReportsPage";
import { ActivityPage } from "../pages/ActivityPage";
import { SuppliersPage } from "../pages/SuppliersPage";
import { ClientsPage } from "../pages/ClientsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { MorePage } from "../pages/MorePage";

export function AppRoutes() {
  const { currentBusinessId, pinSet, unlocked } = useAppData();

  // State-driven gate: before company setup, ONLY the setup screen renders.
  if (!currentBusinessId) return <CompanySetupPage />;

  // Local access gate: if a PIN exists and the session is locked, require it.
  if (pinSet && !unlocked) return <LoginPage />;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/items" element={<ItemsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/suppliers" element={<SuppliersPage />} />
        <Route path="/contacts" element={<ClientsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/more" element={<MorePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

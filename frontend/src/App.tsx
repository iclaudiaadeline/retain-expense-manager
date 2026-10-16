import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AdminRoute } from "./components/routing/AdminRoute";
import { GuestRoute } from "./components/routing/GuestRoute";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { BudgetPage } from "./pages/BudgetPage";
import { AdminInsightsPage } from "./pages/admin/AdminInsightsPage";
import { AdminCategoriesPage } from "./pages/admin/AdminCategoriesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest only */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Signed-in users — wrapped in the app shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/budget" element={<BudgetPage />} />

            {/* Admin only */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminInsightsPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AdminRoute } from "./components/routing/AdminRoute";
import { GuestRoute } from "./components/routing/GuestRoute";
import { ProtectedRoute } from "./components/routing/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { RegisterPage } from "./pages/RegisterPage";

/** Every page of the app, each placed behind the guard that decides who may open it. */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Only for visitors who are not signed in */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Any signed-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
          <Route path="/expenses" element={<PlaceholderPage title="Expenses" />} />
          <Route path="/budget" element={<PlaceholderPage title="Budget" />} />
        </Route>

        {/* Admins only */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<PlaceholderPage title="Admin dashboard" />} />
          <Route path="/admin/categories" element={<PlaceholderPage title="Manage categories" />} />
        </Route>

        {/* The home address and any unknown address lead to the dashboard (or to login if signed out). */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../LoadingScreen";

/**
 * Guards the personal pages (dashboard, expenses, budget). Admins manage the platform rather than
 * their own spending, so they are sent to the admin dashboard instead.
 * Must sit inside ProtectedRoute, which already handles visitors who are not signed in.
 */
export function UserRoute() {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  return <Outlet />;
}

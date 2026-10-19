import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../LoadingScreen";

/**
 * Keeps admin users on the admin side of the app.
 * Regular users can access their dashboard, expenses, and budget pages.
 * This routes works with ProtectedRoute, which handles users who are not signed in at all.
 */
export function UserRoute() {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAdmin) return <Navigate to="/admin" replace />;

  return <Outlet />;
}

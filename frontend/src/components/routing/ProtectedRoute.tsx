import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../LoadingScreen";

/**
 * Guards pages that need a signed-in user.
 * Visitors are sent to /login, which remembers the page they wanted and returns them to it after signing in.
 */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}

import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../LoadingScreen";

/**
 * Guards admin pages. Visitors go to /login; signed-in users who are not admins go back to their dashboard.
 * This only hides admin screens: the backend checks the role again on every admin request.
 */
export function AdminRoute() {
  const { user, isAdmin, isLoading, signedOut } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!user) {
    // After a deliberate log out there is nothing to come back to, so no page is remembered.
    return <Navigate to="/login" replace state={signedOut ? undefined : { from: location.pathname }} />;
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

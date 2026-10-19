import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../LoadingScreen";

/**
* Makes sure only admins can access admin page.
* visitors are sent to the login page , while  other signed-in users are sent to their dashboard.
* The backend also checks admin permissions for every request, so this is just a convenience for the user experience.
 */
export function AdminRoute() {
  const { user, isAdmin, isLoading, signedOut } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!user) {
    // send signed-out  users to login without saving the page they left.
    return <Navigate to="/login" replace state={signedOut ? undefined : { from: location.pathname }} />;
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

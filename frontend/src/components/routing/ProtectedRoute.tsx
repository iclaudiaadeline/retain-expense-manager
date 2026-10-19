import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../LoadingScreen";

/**
 * Makes sure users are signed in before they can access the page.
 * if someone isn't signed in, they are sent to the login page.
 * After signing in, they are sent back to the page they were trying to access.
 * After a deliberate log out there is nothing to come back to, so no page is remembered.
 */
export function ProtectedRoute() {
  const { user, isLoading, signedOut } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (!user) {
    // don't save the previous page if the user chose to sign out.
    return <Navigate to="/login" replace state={signedOut ? undefined : { from: location.pathname }} />;
  }

  return <Outlet />;
}

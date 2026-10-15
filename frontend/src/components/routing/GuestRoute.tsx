import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../LoadingScreen";

/** Where ProtectedRoute or AdminRoute says the visitor was trying to go before being sent to sign in. */
interface LocationState {
  from?: string;
}

/**
 * For the sign-in and sign-up pages: someone already signed in has no reason to see them.
 * This is also what moves the user on right after signing in: back to the page they wanted, otherwise to their home page.
 */
export function GuestRoute() {
  const { user, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;
  if (user) {
    const from = (location.state as LocationState | null)?.from;
    return <Navigate to={from ?? (isAdmin ? "/admin" : "/dashboard")} replace />;
  }

  return <Outlet />;
}

import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../LoadingScreen";

// stores the page the user wanted to visit before signing in.
interface LocationState {
  from?: string;
}

/**
 * Handles access to the login and sign-up pages.
 * If the user is already signed in , they are sent to their dashboard or admin page. 
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

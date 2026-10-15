import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../LoadingScreen";

/** For the sign-in and sign-up pages: someone already signed in has no reason to see them, so they go to their home page. */
export function GuestRoute() {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (user) return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;

  return <Outlet />;
}

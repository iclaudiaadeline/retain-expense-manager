import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "../context/authContext";

/** Access the signed-in user and the login, register and logout actions from any component. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

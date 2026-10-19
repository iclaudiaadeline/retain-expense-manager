import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "../context/authContext";



/** These methods are available to be used from any component to access the signedIn user and to perform login, register and logout actions. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

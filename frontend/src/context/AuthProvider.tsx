import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "../api/client";
import type { AuthResponse, LoginInput, RegisterInput, User } from "../types/api";
import { AuthContext, type AuthContextValue } from "./authContext";


/**First of all, stores the user signed in, and offers sign up/service, sign in and sign out to the entire application. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  
  // Will only show "loading" at startup if there is a token that needs to be verified
  const [isLoading, setIsLoading] = useState<boolean>(() => getToken() !== null);
  const [signedOut, setSignedOut] = useState(false);

  /** Forgets the token and the user. */
  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  /** A deliberate sign out, from the "Log out" button. */
  const logout = useCallback(() => {
    clearSession();
    setSignedOut(true);
  }, [clearSession]);

  
 //  On initial load, convert a saved token back to a user, thus maintaining user's login after a page refresh.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;

    api
      .get<{ user: User }>("/auth/me")
      .then(({ user }) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
      
        
       // In case this token has expired or is invalid, the user sees the login screen and forgets it.
        if (!cancelled) setToken(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);


  
 // if any request later returns 401 (the token has expired), then end the session without setting it to sign out:
//  The page guard then "remembers" the current page, and when the user logs into the system again, he/she returns immediately to the previous page.
  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const startSession = useCallback(({ token, user }: AuthResponse): User => {
    setToken(token);
    setUser(user);
    setSignedOut(false);
    return user;
  }, []);

  const login = useCallback(
    async (input: LoginInput) => startSession(await api.post<AuthResponse>("/auth/login", input)),
    [startSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => startSession(await api.post<AuthResponse>("/auth/register", input)),
    [startSession],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAdmin: user?.role === "admin", isLoading, signedOut, login, register, logout }),
    [user, isLoading, signedOut, login, register, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

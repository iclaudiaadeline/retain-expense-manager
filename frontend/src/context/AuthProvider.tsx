import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "../api/client";
import type { AuthResponse, LoginInput, RegisterInput, User } from "../types/api";
import { AuthContext, type AuthContextValue } from "./authContext";

/** Holds the signed-in user and provides sign up, sign in and sign out to the whole app. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Only "loading" at startup if there is a saved token to check.
  const [isLoading, setIsLoading] = useState<boolean>(() => getToken() !== null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // On first load, turn a saved token back into a user, so a page refresh keeps you signed in.
  useEffect(() => {
    if (!getToken()) return;
    let cancelled = false;

    api
      .get<{ user: User }>("/auth/me")
      .then(({ user }) => {
        if (!cancelled) setUser(user);
      })
      .catch(() => {
        // Expired or invalid token: forget it, and the user simply sees the login page.
        if (!cancelled) setToken(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // If any request later answers 401 (for example the token expired), sign the user out.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const startSession = useCallback(({ token, user }: AuthResponse): User => {
    setToken(token);
    setUser(user);
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
    () => ({ user, isAdmin: user?.role === "admin", isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

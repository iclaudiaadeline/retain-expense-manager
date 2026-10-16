import { createContext } from "react";
import type { LoginInput, RegisterInput, User } from "../types/api";

/** Everything the auth context gives to the components inside it. */
export interface AuthContextValue {
  /** The signed-in user, or null when nobody is signed in. */
  user: User | null;
  isAdmin: boolean;
  /** True while a saved token is being checked at startup. Pages wait for it before deciding where to send the user. */
  isLoading: boolean;
  /**
   * True right after the user clicked "Log out". Page guards then send them to a clean login page
   * instead of remembering the page they left, which would send the next person to sign in there.
   */
  signedOut: boolean;
  /** Sign in. Resolves with the user, or rejects with an ApiError. */
  login: (input: LoginInput) => Promise<User>;
  /** Create an account and sign in. Resolves with the new user, or rejects with an ApiError. */
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
}

/** null outside an AuthProvider; useAuth() turns that into a clear error. */
export const AuthContext = createContext<AuthContextValue | null>(null);

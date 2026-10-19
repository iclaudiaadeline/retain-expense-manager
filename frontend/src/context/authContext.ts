import { createContext } from "react";
import type { LoginInput, RegisterInput, User } from "../types/api";


/** everything that the auth context passes to the components within. */
export interface AuthContextValue {
  
  /** the current user, or null when nobody is signed in  */
  user: User | null;
  isAdmin: boolean;
  
  /** When a token is saved and then is checked at start-up, this is true. On the other hand, Pages await it before determining where to direct the user.  */
  isLoading: boolean;
 
  /**
    /**
   * True right after the user clicks "Log out".
   * The page guards then send them to a plain login page, without remembering the page they were on.
   * If that page were remembered, the next person to sign in on this browser would be taken there
   * instead of to their own home page.
   */

  signedOut: boolean;
  
  /** Sign in. Solves with the user, or returns an ApiError. */
  login: (input: LoginInput) => Promise<User>;
  
  /**Create account and login to an account. Resolves to the new user, or raises an ApiError. */
  register: (input: RegisterInput) => Promise<User>;
  logout: () => void;
}


/** UseAuth() will throw a clear error if you have a null authProvider. */
export const AuthContext = createContext<AuthContextValue | null>(null);

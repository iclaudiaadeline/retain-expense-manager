import type { Request, RequestHandler } from "express";
import { prisma } from "../config/prisma";
import type { Role } from "../generated/prisma/client";
import { HttpError } from "../utils/HttpError";
import { verifyToken } from "../utils/jwt";

/** The logged-in user, as attached to each request by requireAuth. Never includes the password hash. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * validates Bearer token and fetches user from the database. attaches the user to req.user for use in later middleware and route handlers.
 * If the token is missing, invalid, or expired, or if the user no longer exists, throws a 401 error.
 */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) throw new HttpError(401, "Authentication required");

  const payload = verifyToken(token);
  if (!payload) throw new HttpError(401, "Invalid or expired token");

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new HttpError(401, "Invalid or expired token");

  req.user = user;
  next();
};

/** Requires a valid user with admin role. */
export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.user?.role !== "admin") throw new HttpError(403, "Admin access required");
  next();
};

/** Returns the current user, throwing an error if they are not authenticated. */
export function currentUser(req: Pick<Request, "user">): AuthUser {
  if (!req.user) throw new HttpError(401, "Authentication required");
  return req.user;
}

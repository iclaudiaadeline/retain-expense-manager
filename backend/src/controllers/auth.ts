import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { currentUser, type AuthUser } from "../middleware/auth";
import type { LoginInput, RegisterInput } from "../schemas/auth";
import { HttpError } from "../utils/HttpError";
import { signToken } from "../utils/jwt";

interface AuthResponse {
  token: string;
  user: AuthUser;
}

function authResponse(user: AuthUser): AuthResponse {
  return { token: signToken({ sub: user.id, role: user.role }), user };
}

/** POST /api/auth/register. Always creates an ordinary user; admins only come from the seed script. */
export async function register(req: Request<object, unknown, RegisterInput>, res: Response<AuthResponse>) {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, passwordHash } });

  res.status(201).json(authResponse(user));
}

/** POST /api/auth/login */
export async function login(req: Request<object, unknown, LoginInput>, res: Response<AuthResponse>) {
  const { email, password } = req.body;

  const found = await prisma.user.findUnique({ where: { email }, omit: { passwordHash: false } });
  // Same message for "no such user" and "wrong password", so nobody can probe which emails are registered.
  if (!found || !(await bcrypt.compare(password, found.passwordHash))) {
    throw new HttpError(401, "Invalid email or password");
  }

  const { passwordHash: _passwordHash, ...user } = found;
  res.json(authResponse(user));
}

/** GET /api/auth/me. Lets the frontend restore the session from a stored token. */
export function me(req: Request, res: Response<{ user: AuthUser }>) {
  res.json({ user: currentUser(req) });
}

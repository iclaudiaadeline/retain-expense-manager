import type { ErrorRequestHandler, RequestHandler } from "express";
import { Prisma } from "../generated/prisma/client";
import { HttpError } from "../utils/HttpError";

interface ErrorBody {
  message: string;
  errors?: Record<string, string>;
}

export const notFound: RequestHandler = (req) => {
  throw new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`);
};

/** Maps the Prisma error codes we expect to an HTTP status and a message safe to show users. */
function fromPrismaError(err: Prisma.PrismaClientKnownRequestError): { status: number; body: ErrorBody } | null {
  switch (err.code) {
    case "P2002":
      return { status: 409, body: { message: "That value is already in use" } };
    case "P2003":
      return { status: 400, body: { message: "A referenced record does not exist" } };
    case "P2025":
      return { status: 404, body: { message: "Record not found" } };
    default:
      return null;
  }
}

/** Turns every error thrown in a route into a consistent JSON response. */
export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  let status = 500;
  let body: ErrorBody = { message: "Something went wrong" };

  const known = err instanceof Prisma.PrismaClientKnownRequestError ? fromPrismaError(err) : null;

  if (err instanceof HttpError) {
    status = err.status;
    body = { message: err.message, errors: err.errors };
  } else if (known) {
    ({ status, body } = known);
  } else if (err instanceof SyntaxError && "body" in err) {
    status = 400;
    body = { message: "Request body is not valid JSON" };
  } else {
    console.error(err);
  }

  res.status(status).json(body);
};

import type { RequestHandler } from "express";
import type { z, ZodType } from "zod";
import { HttpError } from "../utils/HttpError";

/** Parses data with a Zod schema, or throws a 400 listing the first problem with each field. */
export function parseOrThrow<S extends ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path.join(".") || "body";
      errors[field] ??= issue.message;
    }
    throw new HttpError(400, "Validation failed", errors);
  }
  return result.data;
}

/**
 * Parses a query string. Empty values such as "?search=" are dropped first,
 * so a cleared filter on the frontend means "no filter" rather than a validation error.
 */
export function parseQuery<S extends ZodType>(schema: S, query: unknown): z.output<S> {
  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) => value !== ""),
  );
  return parseOrThrow(schema, cleaned);
}

/** Checks req.body against a Zod schema and replaces it with the parsed, typed result. */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    req.body = parseOrThrow(schema, req.body);
    next();
  };
}

import type { RequestHandler } from "express";
import type { z, ZodType } from "zod";
import { HttpError } from "../utils/HttpError";

/** validates data with a Zod schema, throwing a 400 error if it fails. */
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
 * cleans empty query parameters (like ?search=) before parsing so blank 
 * filters are treated as "no filter" instead of triggering validation errors. throws a 400 error if validation fails.
 */
export function parseQuery<S extends ZodType>(schema: S, query: unknown): z.output<S> {
  const cleaned = Object.fromEntries(
    Object.entries(query as Record<string, unknown>).filter(([, value]) => value !== ""),
  );
  return parseOrThrow(schema, cleaned);
}

/** validates req.body against a Zod schema and attaches the parsed output to req.body. */
export function validateBody(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    req.body = parseOrThrow(schema, req.body);
    next();
  };
}

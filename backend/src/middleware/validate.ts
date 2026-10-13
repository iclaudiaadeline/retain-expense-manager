import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import { HttpError } from "../utils/HttpError";

/** Checks req.body against a Zod schema and replaces it with the parsed, typed result. */
export function validateBody<T>(schema: ZodType<T>): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path.join(".") || "body";
        errors[field] ??= issue.message;
      }
      throw new HttpError(400, "Validation failed", errors);
    }
    req.body = result.data;
    next();
  };
}

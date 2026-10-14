import { z } from "zod";
import { MONTH_PATTERN } from "../constants";

export const monthSchema = z.string().regex(MONTH_PATTERN, "Use the format YYYY-MM");

export const dateSchema = z.iso.date("Use the format YYYY-MM-DD");

/** A positive amount of money, rounded to cents. */
export const moneySchema = z
  .number("Amount must be a number")
  .positive("Amount must be greater than 0")
  .max(9_999_999_999, "Amount is too large")
  .transform((value) => Math.round(value * 100) / 100);

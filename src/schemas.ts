import { z } from "zod";

export const transactionSchema = z.object({
  date: z.iso.date("Invalid date, expected yyyy-mm-dd."),
  recipient: z.string().min(1, "Recipient is required."),
  amount: z
    .number("Amount must be a number.")
    .int("Amount must be an integer.")
    .min(-9_999_999_999, "Amount is out of range.")
    .max(9_999_999_999, "Amount is out of range."),
});

export const CATEGORIES = [
  "Household",
  "Transport",
  "Food",
  "Entertainment",
  "Unknown",
] as const;

export const categorySchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z.enum(CATEGORIES, `Category must be one of: ${CATEGORIES.join(", ")}.`),
);

export const classificationSchema = z.object({
  //.trim() stops values like " ICA " from slipping in, which matters because recipient is UNIQUE
  recipient: z.string().trim().min(1, "Recipient is required."),
  category: categorySchema,
});

export const filterSchema = z.object({
  from: z.iso.date("Invalid or missing 'from' date, expected yyyy-mm-dd."),
  to: z.iso.date("Invalid or missing 'to' date, expected yyyy-mm-dd."),
});

export const idParamSchema = z.object({
  id: z.coerce
    .number("Invalid id.")
    .int("Invalid id.")
    .positive("Invalid id.")
    .max(2_147_483_647, "Invalid id."), // the largest value an INT column can hold
});

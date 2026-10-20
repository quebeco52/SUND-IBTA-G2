import { z } from "zod";

export const classificationEnum = z.enum([
  "Household",
  "Transport",
  "Food",
  "Entertainment",
  "Unknown",
]);

export type ClassificationCategory = z.infer<typeof classificationEnum>;

export const transactionSchema = z.object({
  date: z.iso.date("Invalid date, expected yyyy-mm-dd."),
  recipient: z.string().trim().min(1, "Recipient is required."),
  amount: z
    .number("Amount must be a number.")
    .int("Amount must be an integer.")
    .min(-9_999_999_999, "Amount is out of range.")
    .max(9_999_999_999, "Amount is out of range."),
  classification: classificationEnum.default("Unknown"),
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
    .max(2_147_483_647, "Invalid id."),
});

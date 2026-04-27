import { z } from "zod";

const moneyString = z
  .string()
  .min(1, "Required")
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(v.replace(/[$,\s]/g, "")), {
    message: "Enter a valid amount (e.g. 12.34)",
  });

const optionalEmail = z
  .string()
  .trim()
  .email("Invalid email")
  .optional()
  .or(z.literal("").transform(() => undefined));

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: optionalEmail,
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type CustomerInput = z.infer<typeof customerSchema>;

export const expenseSchema = z.object({
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date required"),
  vendor: z.string().trim().min(1, "Vendor is required").max(120),
  amount: moneyString,
  category: z
    .string()
    .trim()
    .max(60)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  notes: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;

export const invoiceLineItemSchema = z.object({
  description: z.string().trim().min(1, "Description required").max(200),
  quantity: z
    .string()
    .min(1, "Required")
    .refine((v) => !Number.isNaN(parseFloat(v)) && parseFloat(v) > 0, {
      message: "Must be > 0",
    }),
  unit_price: moneyString,
});
export type InvoiceLineItemInput = z.infer<typeof invoiceLineItemSchema>;

export const invoiceSchema = z.object({
  customer_id: z.string().uuid("Choose a customer"),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date required"),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date required")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  status: z.enum(["draft", "sent", "paid"]),
  notes: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  line_items: z.array(invoiceLineItemSchema).min(1, "Add at least one line item"),
});
export type InvoiceInput = z.infer<typeof invoiceSchema>;

export const invoiceStatusSchema = z.enum(["draft", "sent", "paid"]);

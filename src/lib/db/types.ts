export type Customer = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
};

export type InvoiceStatus = "draft" | "sent" | "paid";

export type Invoice = {
  id: string;
  user_id: string;
  customer_id: string;
  issue_date: string;
  due_date: string | null;
  status: InvoiceStatus;
  total_cents: number;
  notes: string | null;
  created_at: string;
};

export type InvoiceLineItem = {
  id: string;
  invoice_id: string;
  user_id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
  position: number;
  created_at: string;
};

export type Expense = {
  id: string;
  user_id: string;
  expense_date: string;
  vendor: string;
  amount_cents: number;
  category: string | null;
  notes: string | null;
  created_at: string;
};

export type InvoiceWithCustomer = Invoice & {
  customer: Pick<Customer, "id" | "name"> | null;
};

export type InvoiceWithDetails = Invoice & {
  customer: Pick<Customer, "id" | "name" | "email"> | null;
  line_items: InvoiceLineItem[];
};

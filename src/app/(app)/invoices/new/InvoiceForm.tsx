"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { formatMoney, parseDollars } from "@/lib/money";
import { createInvoiceAction } from "../actions";

type CustomerOption = { id: string; name: string };
type Line = { description: string; quantity: string; unit_price: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Create invoice"}
    </Button>
  );
}

const blankLine: Line = { description: "", quantity: "1", unit_price: "" };

export function InvoiceForm({ customers }: { customers: CustomerOption[] }) {
  const [state, formAction] = useFormState(createInvoiceAction, { error: null });
  const today = new Date().toISOString().slice(0, 10);
  const [lines, setLines] = useState<Line[]>([{ ...blankLine }]);

  const total = useMemo(() => {
    return lines.reduce((sum, line) => {
      const cents = parseDollars(line.unit_price) ?? 0;
      const qty = parseFloat(line.quantity);
      if (Number.isNaN(qty)) return sum;
      return sum + Math.round(cents * qty);
    }, 0);
  }, [lines]);

  function update(idx: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function add() {
    setLines((prev) => [...prev, { ...blankLine }]);
  }
  function remove(idx: number) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select name="customer_id" label="Customer" required defaultValue="">
          <option value="" disabled>
            Choose a customer…
          </option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select name="status" label="Status" defaultValue="draft">
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
        </Select>
        <Input name="issue_date" type="date" label="Issue date" defaultValue={today} required />
        <Input name="due_date" type="date" label="Due date" />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Line items</h3>
          <Button type="button" variant="secondary" size="sm" onClick={add}>
            + Add line
          </Button>
        </div>

        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 gap-3 rounded-md border border-slate-200 p-3 sm:grid-cols-12"
            >
              <div className="sm:col-span-6">
                <Input
                  name={`line_items.${idx}.description`}
                  label={idx === 0 ? "Description" : undefined}
                  value={line.description}
                  onChange={(e) => update(idx, { description: e.target.value })}
                  placeholder="Service or product"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  name={`line_items.${idx}.quantity`}
                  label={idx === 0 ? "Qty" : undefined}
                  inputMode="decimal"
                  value={line.quantity}
                  onChange={(e) => update(idx, { quantity: e.target.value })}
                  required
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  name={`line_items.${idx}.unit_price`}
                  label={idx === 0 ? "Unit price (USD)" : undefined}
                  inputMode="decimal"
                  placeholder="0.00"
                  value={line.unit_price}
                  onChange={(e) => update(idx, { unit_price: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-end justify-end sm:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(idx)}
                  disabled={lines.length === 1}
                  aria-label="Remove line"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
            <p className="text-2xl font-semibold tabular-nums text-slate-900">
              {formatMoney(total)}
            </p>
          </div>
        </div>
      </div>

      <Textarea name="notes" label="Notes" placeholder="Optional" />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end gap-2">
        <SubmitButton />
      </div>
    </form>
  );
}

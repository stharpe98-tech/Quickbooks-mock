"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  createCustomerAction,
  updateCustomerAction,
} from "./actions";

type Customer = { id: string; name: string; email: string | null; phone: string | null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function CustomerForm({ customer }: { customer?: Customer }) {
  const isEdit = Boolean(customer);
  const action = isEdit
    ? updateCustomerAction.bind(null, customer!.id)
    : createCustomerAction;
  const [state, formAction] = useFormState(action, { error: null });

  return (
    <form action={formAction} className="space-y-4">
      <Input
        name="name"
        label="Name"
        defaultValue={customer?.name ?? ""}
        required
        autoComplete="name"
      />
      <Input
        name="email"
        type="email"
        label="Email"
        defaultValue={customer?.email ?? ""}
        autoComplete="email"
      />
      <Input
        name="phone"
        label="Phone"
        defaultValue={customer?.phone ?? ""}
        autoComplete="tel"
      />
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex justify-end gap-2">
        <SubmitButton label={isEdit ? "Save changes" : "Create customer"} />
      </div>
    </form>
  );
}

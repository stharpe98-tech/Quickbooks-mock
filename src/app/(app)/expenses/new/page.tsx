import { ReceiptText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExpenseForm } from "./ExpenseForm";

export default function NewExpensePage() {
  return (
    <>
      <PageHeader
        title="New expense"
        description="Log money going out."
        section="expenses"
        icon={ReceiptText}
      />
      <Card>
        <ExpenseForm />
      </Card>
    </>
  );
}

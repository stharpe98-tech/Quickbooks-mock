import { UserPlus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomerForm } from "../CustomerForm";

export default function NewCustomerPage() {
  return (
    <>
      <PageHeader
        title="New customer"
        description="Add someone you'll be billing."
        section="customers"
        icon={UserPlus}
      />
      <Card>
        <CustomerForm />
      </Card>
    </>
  );
}

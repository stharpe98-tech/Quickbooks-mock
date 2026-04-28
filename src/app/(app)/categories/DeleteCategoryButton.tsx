"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteCategoryAction } from "./actions";

export function DeleteCategoryButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label={`Delete ${name}`}
      className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
      onClick={() => {
        if (!confirm(`Delete category "${name}"? Linked entries will become uncategorized.`)) return;
        start(() => deleteCategoryAction(id));
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

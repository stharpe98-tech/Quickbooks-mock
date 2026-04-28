"use client";

import { useTransition } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { seedDefaultCategoriesAction } from "./actions";

export function SeedCategoriesButton() {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => {
        start(async () => {
          const { created } = await seedDefaultCategoriesAction();
          if (created === 0) alert("All defaults already exist.");
        });
      }}
    >
      <Sparkles className="h-4 w-4" />
      {pending ? "Adding…" : "Seed defaults"}
    </Button>
  );
}

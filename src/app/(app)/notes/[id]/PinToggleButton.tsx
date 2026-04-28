"use client";

import { useTransition } from "react";
import { Pin, PinOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toggleNotePinnedAction } from "../actions";

export function PinToggleButton({ id, pinned }: { id: string; pinned: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="md"
      disabled={pending}
      onClick={() => start(() => toggleNotePinnedAction(id, !pinned))}
    >
      {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
      {pinned ? "Unpin" : "Pin"}
    </Button>
  );
}

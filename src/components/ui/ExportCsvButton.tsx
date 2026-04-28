"use client";

import { useSearchParams } from "next/navigation";
import { Download } from "lucide-react";
import { Button } from "./Button";

export function ExportCsvButton({
  href,
  /** Which URL params to forward to the CSV route. */
  forwardParams = ["q", "status"],
  label = "Export CSV",
}: {
  href: string;
  forwardParams?: string[];
  label?: string;
}) {
  const params = useSearchParams();
  const sp = new URLSearchParams();
  for (const key of forwardParams) {
    const v = params.get(key);
    if (v) sp.set(key, v);
  }
  const qs = sp.toString();
  const fullHref = qs ? `${href}?${qs}` : href;

  return (
    <a href={fullHref}>
      <Button variant="secondary">
        <Download className="h-4 w-4" />
        {label}
      </Button>
    </a>
  );
}

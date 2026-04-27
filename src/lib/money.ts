// Money is integer cents. Never use float for currency math.

export function centsToDollars(cents: number): number {
  return cents / 100;
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatMoney(cents: number): string {
  return formatter.format(centsToDollars(cents));
}

// Parses "12.34" / "12" / "$12.34" to integer cents. Returns null on invalid.
export function parseDollars(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, "");
  if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return dollarsToCents(parseFloat(cleaned));
}

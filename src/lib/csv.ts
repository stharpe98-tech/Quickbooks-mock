// Minimal RFC-4180 CSV serializer. Don't pull in a library for this.

type Cell = string | number | boolean | null | undefined;

export function toCsv(rows: Cell[][]): string {
  return rows.map((row) => row.map(escape).join(",")).join("\r\n") + "\r\n";
}

function escape(value: Cell): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  // Quote if it contains a delimiter, quote, or newline.
  if (/[",\r\n]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Build a Content-Disposition with a UTF-8 filename and an ASCII fallback. */
export function csvFilename(base: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${base}-${date}.csv`;
}

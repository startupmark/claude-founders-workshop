/** Format a number for display in the UI. */
export function fmt(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(value);
}

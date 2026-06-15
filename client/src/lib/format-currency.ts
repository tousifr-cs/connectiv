const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  BDT: "৳",
  EUR: "€",
  GBP: "£",
};

export function formatMoney(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const formatted = amount.toLocaleString();
  if (currency === "USD" || currency === "BDT") {
    return `${symbol}${formatted}`;
  }
  return `${formatted} ${currency}`;
}

export const JOB_CATEGORIES = [
  "Engineering",
  "Automation",
  "Design",
  "Marketing",
  "Video & Content",
  "Business",
  "Education",
  "Other",
] as const;

export const JOB_CURRENCIES = [
  { code: "USD", label: "USD ($)" },
  { code: "BDT", label: "BDT (৳)" },
  { code: "EUR", label: "EUR (€)" },
  { code: "GBP", label: "GBP (£)" },
] as const;

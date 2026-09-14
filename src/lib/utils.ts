export function formatEGP(n: number | null | undefined): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("ar-EG").format(n) + " جنيه";
}

export function calcDiscount(price: number, oldPrice?: number | null): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function slugify(input: string): string {
  return (
    input
      .toString()
      .trim()
      // keep arabic letters + latin + digits, replace spaces with dash
      .replace(/\s+/g, "-")
      .replace(/[^\u0600-\u06FFa-zA-Z0-9\-_]/g, "")
      .replace(/-+/g, "-") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export function availabilityLabel(a?: string): string {
  switch (a) {
    case "IN_STOCK":
      return "متوفر";
    case "OUT_OF_STOCK":
      return "غير متوفر";
    case "PREORDER":
      return "حجز مسبق";
    default:
      return "متوفر";
  }
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const orderStatuses = [
  "placed",
  "packing",
  "dispatched",
  "delivered",
  "return_requested",
  "returned",
  "refunded",
  "cancelled",
] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const orderStatusLabels: Record<OrderStatus, string> = {
  placed: "Placed",
  packing: "Packing",
  dispatched: "Dispatched",
  delivered: "Delivered",
  return_requested: "Return requested",
  returned: "Returned",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export const nonRevenueStatuses: OrderStatus[] = ["cancelled", "refunded", "returned"];

export type OrderItem = { name?: string; slug?: string; qty?: number; price?: number };

export function orderItemsOf(value: unknown): OrderItem[] {
  return Array.isArray(value) ? (value as OrderItem[]) : [];
}

export function initialsFrom(value: string | null | undefined) {
  return (
    (value ?? "?")
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("") || "?"
  );
}

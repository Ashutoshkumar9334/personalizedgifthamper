import { createServerFn } from "@tanstack/react-start";
import type { Hamper } from "@/data/hampers";
import { PRODUCT_COLUMNS, publicClient, toHamper, type ProductRow } from "./catalog.server";

export const listStoreProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) return [] as Hamper[];
  return (data as ProductRow[]).map(toHamper);
});

export const getStoreProduct = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 120) }))
  .handler(async ({ data }) => {
    const { data: row, error } = await publicClient()
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !row) return null;
    return toHamper(row as ProductRow);
  });

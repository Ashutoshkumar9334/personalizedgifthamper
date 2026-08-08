import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { CategorySlug, Hamper } from "@/data/hampers";

export const PRODUCT_COLUMNS =
  "slug, name, category, price, compare_at, image_url, blurb, contents, tags";

export function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type ProductRow = {
  slug: string;
  name: string;
  category: string;
  price: number | string;
  compare_at: number | string | null;
  image_url: string | null;
  blurb: string | null;
  contents: string[] | null;
  tags: string[] | null;
};

export function toHamper(row: ProductRow): Hamper {
  return {
    slug: row.slug,
    name: row.name,
    category: row.category as CategorySlug,
    price: Number(row.price),
    ...(row.compare_at === null ? {} : { compareAt: Number(row.compare_at) }),
    image: row.image_url ?? "/placeholder.svg",
    blurb: row.blurb ?? "",
    contents: row.contents ?? [],
    rating: 5,
    reviews: 0,
    tags: (row.tags ?? []).filter((t): t is Hamper["tags"][number] =>
      ["new", "bestseller", "offer"].includes(t),
    ),
  };
}

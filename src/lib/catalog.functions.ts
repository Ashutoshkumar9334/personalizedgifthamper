import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { CategorySlug, Hamper } from "@/data/hampers";

const COLUMNS = "slug, name, category, price, compare_at, image_url, blurb, contents, tags";

function client() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
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

type Row = {
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

function toHamper(row: Row): Hamper {
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

export const listStoreProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await client()
    .from("products")
    .select(COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) return [] as Hamper[];
  return (data as Row[]).map(toHamper);
});

export const getStoreProduct = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 120) }))
  .handler(async ({ data }) => {
    const { data: row, error } = await client()
      .from("products")
      .select(COLUMNS)
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !row) return null;
    return toHamper(row as Row);
  });

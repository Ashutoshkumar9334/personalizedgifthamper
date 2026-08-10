import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/hampers";

export interface ProductDraft {
  id?: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compare_at: number | null;
  image_url: string | null;
  blurb: string | null;
  contents: string[];
  stock: number;
  is_active: boolean;
  tags?: string[];
}

export const emptyProduct: ProductDraft = {
  name: "",
  slug: "",
  category: "luxury",
  price: 0,
  compare_at: null,
  image_url: "",
  blurb: "",
  contents: [],
  stock: 0,
  is_active: true,
  tags: [],
};


const schema = z.object({
  name: z.string().trim().min(2, "Add a product name").max(120),
  slug: z
    .string()
    .trim()
    .min(2, "Add a URL slug")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug can use lowercase letters, numbers and dashes only"),
  category: z.string().trim().min(2).max(40),
  price: z.number().min(1, "Price must be greater than zero").max(10_000_000),
  compare_at: z.number().min(0).max(10_000_000).nullable(),
  image_url: z.string().trim().max(500),
  blurb: z.string().trim().max(600),
  stock: z.number().int().min(0).max(100_000),
});

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function ProductForm({
  value,
  onCancel,
  onSubmit,
  saving,
}: {
  value: ProductDraft;
  onCancel?: () => void;
  onSubmit: (draft: ProductDraft) => void;
  saving?: boolean;
}) {
  const [draft, setDraft] = useState<ProductDraft>(value);
  const [contentsText, setContentsText] = useState(value.contents.join("\n"));

  const set = <K extends keyof ProductDraft>(key: K, v: ProductDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      name: draft.name,
      slug: draft.slug || slugify(draft.name),
      category: draft.category,
      price: Number(draft.price),
      compare_at: draft.compare_at === null ? null : Number(draft.compare_at),
      image_url: draft.image_url ?? "",
      blurb: draft.blurb ?? "",
      stock: Number(draft.stock),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]!.message);
      return;
    }
    onSubmit({
      ...draft,
      ...parsed.data,
      contents: contentsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 30),
    });
  };

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="p-name">Product name</Label>
        <Input
          id="p-name"
          className="mt-2"
          maxLength={120}
          value={draft.name}
          onChange={(e) => {
            const name = e.target.value;
            setDraft((d) => ({
              ...d,
              name,
              slug: d.id ? d.slug : slugify(name),
            }));
          }}
        />
      </div>

      <div>
        <Label htmlFor="p-slug">URL slug</Label>
        <Input
          id="p-slug"
          className="mt-2"
          maxLength={80}
          value={draft.slug}
          onChange={(e) => set("slug", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="p-category">Occasion</Label>
        <Select value={draft.category} onValueChange={(v) => set("category", v)}>
          <SelectTrigger id="p-category" className="mt-2 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="p-price">Price (₹)</Label>
        <Input
          id="p-price"
          className="mt-2"
          type="number"
          min={0}
          value={draft.price}
          onChange={(e) => set("price", Number(e.target.value))}
        />
      </div>

      <div>
        <Label htmlFor="p-compare">Compare-at price (₹, optional)</Label>
        <Input
          id="p-compare"
          className="mt-2"
          type="number"
          min={0}
          value={draft.compare_at ?? ""}
          onChange={(e) => set("compare_at", e.target.value === "" ? null : Number(e.target.value))}
        />
      </div>

      <div>
        <Label htmlFor="p-stock">Stock on hand</Label>
        <Input
          id="p-stock"
          className="mt-2"
          type="number"
          min={0}
          value={draft.stock}
          onChange={(e) => set("stock", Number(e.target.value))}
        />
      </div>

      <div>
        <Label htmlFor="p-active">Visible on the shop</Label>
        <Select
          value={draft.is_active ? "yes" : "no"}
          onValueChange={(v) => set("is_active", v === "yes")}
        >
          <SelectTrigger id="p-active" className="mt-2 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Published</SelectItem>
            <SelectItem value="no">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="p-image">Image URL</Label>
        <Input
          id="p-image"
          className="mt-2"
          maxLength={500}
          placeholder="https://…"
          value={draft.image_url ?? ""}
          onChange={(e) => set("image_url", e.target.value)}
        />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="p-blurb">Short description</Label>
        <Textarea
          id="p-blurb"
          className="mt-2"
          maxLength={600}
          rows={3}
          value={draft.blurb ?? ""}
          onChange={(e) => set("blurb", e.target.value)}
        />
      </div>

      <div className="sm:col-span-2">
        <Label htmlFor="p-contents">What's inside (one item per line)</Label>
        <Textarea
          id="p-contents"
          className="mt-2"
          rows={4}
          value={contentsText}
          onChange={(e) => setContentsText(e.target.value)}
        />
      </div>

      <label className="flex items-center gap-3 rounded-md border border-border p-4 sm:col-span-2">
        <Checkbox
          checked={(draft.tags ?? []).includes("offer")}
          onCheckedChange={(checked) => {
            const rest = (draft.tags ?? []).filter((t) => t !== "offer");
            set("tags", checked ? [...rest, "offer"] : rest);
          }}
        />
        <span className="text-sm">Show this product in Offers &amp; deals</span>
      </label>


      <div className="flex gap-3 sm:col-span-2">
        <Button type="submit" variant="gold" disabled={saving}>
          {draft.id ? "Save product" : "Add product"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

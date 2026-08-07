import heroHamper from "@/assets/hero-hamper.jpg";
import catBirthday from "@/assets/cat-birthday.jpg";
import catAnniversary from "@/assets/cat-anniversary.jpg";
import catFestival from "@/assets/cat-festival.jpg";
import catCorporate from "@/assets/cat-corporate.jpg";

export type CategorySlug =
  | "birthday"
  | "anniversary"
  | "wedding"
  | "baby-shower"
  | "corporate"
  | "festival"
  | "valentines"
  | "luxury";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  image: string;
}

export interface Hamper {
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  compareAt?: number;
  image: string;
  blurb: string;
  contents: string[];
  rating: number;
  reviews: number;
  tags: ("new" | "bestseller" | "offer")[];
}

export const categories: Category[] = [
  {
    slug: "birthday",
    name: "Birthday Hampers",
    tagline: "Confetti, cake and candlelight",
    image: catBirthday,
  },
  {
    slug: "anniversary",
    name: "Anniversary Hampers",
    tagline: "For the years worth toasting",
    image: catAnniversary,
  },
  {
    slug: "wedding",
    name: "Wedding Hampers",
    tagline: "Trousseau-worthy gifting",
    image: heroHamper,
  },
  {
    slug: "baby-shower",
    name: "Baby Shower Hampers",
    tagline: "Soft, sweet and brand new",
    image: catBirthday,
  },
  {
    slug: "corporate",
    name: "Corporate Gift Hampers",
    tagline: "Branded, bulk, beautifully done",
    image: catCorporate,
  },
  {
    slug: "festival",
    name: "Festival Hampers",
    tagline: "Diwali, Christmas, Rakhi & more",
    image: catFestival,
  },
  {
    slug: "valentines",
    name: "Valentine's Hampers",
    tagline: "Roses, cocoa, quiet romance",
    image: catAnniversary,
  },
  {
    slug: "luxury",
    name: "Luxury Hampers",
    tagline: "Our most extravagant baskets",
    image: heroHamper,
  },
];

export const hampers: Hamper[] = [
  {
    slug: "velvet-noir-luxe-basket",
    name: "Velvet Noir Luxe Basket",
    category: "luxury",
    price: 6499,
    compareAt: 7499,
    image: heroHamper,
    blurb:
      "Our signature wicker basket layered with single-origin chocolate, a hand-poured orchid candle and a floral tea blend.",
    contents: [
      "Velvet Noir 70% dark chocolate bar",
      "Pure Indulgence artisanal truffles (9 pc)",
      "Whispering Orchid soy candle",
      "Luxe floral infusion tea tin",
      "Dried rose posy & brass keepsake",
    ],
    rating: 4.9,
    reviews: 214,
    tags: ["bestseller", "offer"],
  },
  {
    slug: "golden-hour-birthday-box",
    name: "Golden Hour Birthday Box",
    category: "birthday",
    price: 2899,
    image: catBirthday,
    blurb:
      "Blush keepsake box with buttercream cupcakes, taper candles and a foiled personalised birthday card.",
    contents: [
      "Four vanilla buttercream cupcakes",
      "Pair of ivory taper candles",
      "Foiled personalised card",
      "Satin ribbon & confetti sachet",
    ],
    rating: 4.8,
    reviews: 132,
    tags: ["bestseller"],
  },
  {
    slug: "crimson-vows-anniversary",
    name: "Crimson Vows Anniversary Hamper",
    category: "anniversary",
    price: 4299,
    image: catAnniversary,
    blurb:
      "A dozen roses, two crystal-cut glasses and a gilded chocolate flight for the evening in.",
    contents: [
      "Twelve fresh red roses",
      "Two crystal-cut stemware glasses",
      "Gilded chocolate flight (12 pc)",
      "Hand-written vow card",
    ],
    rating: 4.9,
    reviews: 98,
    tags: ["bestseller"],
  },
  {
    slug: "diwali-deepam-thali",
    name: "Diwali Deepam Thali",
    category: "festival",
    price: 3499,
    compareAt: 3999,
    image: catFestival,
    blurb:
      "Brass diyas, premium dry fruits and a mithai selection in a hand-printed festive box.",
    contents: [
      "Two brass diyas",
      "Premium dry fruit assortment 400g",
      "Kaju katli & besan ladoo box",
      "Marigold garland & rangoli colours",
    ],
    rating: 4.7,
    reviews: 176,
    tags: ["offer", "new"],
  },
  {
    slug: "boardroom-navy-set",
    name: "Boardroom Navy Set",
    category: "corporate",
    price: 3899,
    image: catCorporate,
    blurb:
      "Understated navy rigid box with a full-grain notebook, single-estate coffee and your logo on the ribbon.",
    contents: [
      "Full-grain leather notebook",
      "Single-estate coffee 250g",
      "Stoneware espresso cup",
      "Custom branded satin ribbon",
    ],
    rating: 4.8,
    reviews: 64,
    tags: ["new"],
  },
  {
    slug: "champagne-trousseau-trunk",
    name: "Champagne Trousseau Trunk",
    category: "wedding",
    price: 8999,
    image: heroHamper,
    blurb:
      "A keepsake trunk for the bridal party: silk pouches, scented candles and monogrammed chocolates.",
    contents: [
      "Keepsake wooden trunk",
      "Four silk jewellery pouches",
      "Two scented pillar candles",
      "Monogrammed chocolate box",
    ],
    rating: 5,
    reviews: 41,
    tags: ["new", "bestseller"],
  },
  {
    slug: "little-cloud-baby-basket",
    name: "Little Cloud Baby Basket",
    category: "baby-shower",
    price: 2599,
    image: catBirthday,
    blurb:
      "Muslin swaddle, wooden rattle and a personalised name banner in a soft cotton-lined basket.",
    contents: [
      "Organic muslin swaddle",
      "Beech wood rattle",
      "Personalised name banner",
      "Baby balm & bib set",
    ],
    rating: 4.7,
    reviews: 57,
    tags: ["new"],
  },
  {
    slug: "rose-cocoa-valentine",
    name: "Rose & Cocoa Valentine",
    category: "valentines",
    price: 2299,
    compareAt: 2699,
    image: catAnniversary,
    blurb:
      "Preserved roses and cocoa-dusted truffles with a sealed love note, ready to gift.",
    contents: [
      "Preserved rose dome",
      "Cocoa-dusted truffles (12 pc)",
      "Wax-sealed love note",
    ],
    rating: 4.6,
    reviews: 88,
    tags: ["offer"],
  },
];

export const boxOptions = [
  { id: "wicker", name: "Classic Wicker Basket", price: 599 },
  { id: "rigid-plum", name: "Rigid Plum Keepsake Box", price: 749 },
  { id: "trunk", name: "Wooden Keepsake Trunk", price: 1299 },
  { id: "kraft", name: "Eco Kraft Crate", price: 399 },
];

export const addOnItems = [
  { id: "truffles", name: "Artisanal truffles (9 pc)", price: 649 },
  { id: "candle", name: "Hand-poured soy candle", price: 799 },
  { id: "tea", name: "Luxe floral tea tin", price: 549 },
  { id: "dryfruit", name: "Premium dry fruits 400g", price: 899 },
  { id: "roses", name: "Preserved rose posy", price: 999 },
  { id: "mug", name: "Photo-printed ceramic mug", price: 749 },
  { id: "chocolate", name: "Single-origin chocolate bar", price: 399 },
  { id: "diffuser", name: "Reed diffuser", price: 1099 },
];

export const wrappingOptions = [
  { id: "satin-gold", name: "Champagne satin ribbon", price: 0 },
  { id: "silk-plum", name: "Plum silk wrap & wax seal", price: 249 },
  { id: "handmade", name: "Handmade paper & dried florals", price: 349 },
];

export const deliverySlots = [
  "09:00 – 12:00",
  "12:00 – 15:00",
  "15:00 – 18:00",
  "18:00 – 21:00 (surprise slot)",
];

export const inr = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const getHamper = (slug: string) => hampers.find((h) => h.slug === slug);
export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const hampersByCategory = (slug: string) =>
  hampers.filter((h) => h.category === slug);

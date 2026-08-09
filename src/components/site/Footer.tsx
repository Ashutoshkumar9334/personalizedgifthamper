import { Link } from "@tanstack/react-router";
import { categories } from "@/data/hampers";

const columns = [
  {
    title: "Shop",
    links: [
      { to: "/shop", label: "All Hampers" },
      { to: "/new-arrivals", label: "New Arrivals" },
      { to: "/best-sellers", label: "Best Sellers" },
      { to: "/offers", label: "Offers & Deals" },
      { to: "/customize", label: "Build Your Own" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/contact", label: "Contact Us" },
      { to: "/corporate", label: "Corporate Gifting" },
      { to: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/auth", label: "Login / Register" },
      { to: "/account", label: "My Profile" },
      { to: "/orders", label: "My Orders" },
      { to: "/wishlist", label: "Wishlist" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/60">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl">A_S</span>
            <span className="eyebrow">Hamper</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Personalised gift hampers, hand-packed in small batches. Choose a basket, fill it
            with things they love, and we'll deliver it on the day that matters.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            hello@ashamper.in · +91 98765 43210
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <p className="eyebrow">{col.title}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="eyebrow">Occasions</p>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border/70 px-4 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} A_S Hamper. All rights reserved.
      </div>
    </footer>
  );
}

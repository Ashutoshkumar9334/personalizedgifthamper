import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { categories } from "@/data/hampers";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";

const primaryNav = [
  { to: "/shop", label: "All Hampers" },
  { to: "/customize", label: "Build Your Own" },
  { to: "/offers", label: "Offers" },
  { to: "/corporate", label: "Corporate" },
  { to: "/about", label: "About" },
];

export function Header() {
  const { count, wishlist } = useStore();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="surface-plum px-4 py-2 text-center text-[11px] tracking-[0.2em] uppercase">
        Free delivery above ₹2,499 · Same-day dispatch before 2 PM
      </div>
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <nav className="mt-10 flex flex-col gap-1">
              {primaryNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-sm px-3 py-2 text-base hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
              <p className="eyebrow mt-6 px-3">Occasions</p>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  onClick={() => setOpen(false)}
                  className="rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link to="/" className="flex shrink-0 items-baseline gap-2">
          <span className="font-display text-2xl tracking-tight">A_S</span>
          <span className="eyebrow">Hamper</span>
        </Link>

        <nav className="ml-8 hidden items-center gap-7 text-sm lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          action="/search"
          className="ml-auto hidden w-64 items-center gap-2 md:flex"
          role="search"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              placeholder="Search hampers…"
              className="pl-9"
              aria-label="Search hampers"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button asChild variant="ghost" size="icon" aria-label="Wishlist">
            <Link to="/wishlist" className="relative">
              <Heart />
              {wishlist.length > 0 && <Dot>{wishlist.length}</Dot>}
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Account">
            <Link to={user ? "/account" : "/auth"}>
              <User />
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Cart">
            <Link to="/cart" className="relative">
              <ShoppingBag />
              {count > 0 && <Dot>{count}</Dot>}
            </Link>
          </Button>
          <Button asChild variant="gold" className="ml-2 hidden md:inline-flex">
            <Link to="/customize">
              <Sparkles /> Build a hamper
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Dot({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
      {children}
    </span>
  );
}

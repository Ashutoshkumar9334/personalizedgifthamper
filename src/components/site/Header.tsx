import { Link } from "@tanstack/react-router";
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { categories } from "@/data/hampers";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/useAuth";

const primaryNav = [
  { to: "/", label: "Home", exact: true },
  { to: "/shop", label: "All Hampers" },
  { to: "/customize", label: "Build Your Own" },
  { to: "/offers", label: "Offers" },
  { to: "/corporate", label: "Corporate" },
  { to: "/vendor", label: "Vendor Zone" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  const { count, wishlist } = useStore();
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
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

        <div className="flex shrink-0 items-baseline gap-2 select-none" aria-label="A_S Hamper">
          <span className="font-display text-2xl tracking-tight">A_S</span>
          <span className="eyebrow">Hamper</span>
        </div>

        <nav className="ml-8 hidden items-center gap-6 text-sm lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
              activeOptions={{ exact: "exact" in item && Boolean(item.exact) }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form
          action="/search"
          className="ml-auto hidden w-56 items-center gap-2 xl:flex"
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

        <div className="ml-auto flex items-center gap-1 xl:ml-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
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

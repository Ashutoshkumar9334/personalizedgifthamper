import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartLine {
  id: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  custom?: {
    box: string;
    items: string[];
    message: string;
    wrapping: string;
    photoName?: string | undefined;
  };
}

interface StoreValue {
  cart: CartLine[];
  wishlist: string[];
  recentlyViewed: string[];
  addToCart: (line: Omit<CartLine, "id" | "qty"> & { id?: string; qty?: number }) => void;
  setQty: (id: string, qty: number) => void;
  removeLine: (id: string) => void;
  clearCart: () => void;
  toggleWishlist: (slug: string) => void;
  markViewed: (slug: string) => void;
  subtotal: number;
  count: number;
}

const StoreContext = createContext<StoreValue | null>(null);
const KEY = "as-hamper-store-v1";

interface Persisted {
  cart: CartLine[];
  wishlist: string[];
  recentlyViewed: string[];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>({
    cart: [],
    wishlist: [],
    recentlyViewed: [],
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setState(JSON.parse(raw) as Persisted);
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state]);

  const addToCart: StoreValue["addToCart"] = useCallback((line) => {
    setState((prev) => {
      const id = line.id ?? line.slug;
      const existing = prev.cart.find((l) => l.id === id);
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map((l) =>
            l.id === id ? { ...l, qty: l.qty + (line.qty ?? 1) } : l,
          ),
        };
      }
      return {
        ...prev,
        cart: [...prev.cart, { ...line, id, qty: line.qty ?? 1 }],
      };
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setState((prev) => ({
      ...prev,
      cart: prev.cart
        .map((l) => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l))
        .filter((l) => l.qty > 0),
    }));
  }, []);

  const removeLine = useCallback((id: string) => {
    setState((prev) => ({ ...prev, cart: prev.cart.filter((l) => l.id !== id) }));
  }, []);

  const clearCart = useCallback(() => {
    setState((prev) => ({ ...prev, cart: [] }));
  }, []);

  const toggleWishlist = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      wishlist: prev.wishlist.includes(slug)
        ? prev.wishlist.filter((s) => s !== slug)
        : [...prev.wishlist, slug],
    }));
  }, []);

  const markViewed = useCallback((slug: string) => {
    setState((prev) => ({
      ...prev,
      recentlyViewed: [slug, ...prev.recentlyViewed.filter((s) => s !== slug)].slice(0, 6),
    }));
  }, []);

  const value = useMemo<StoreValue>(() => {
    const subtotal = state.cart.reduce((sum, l) => sum + l.price * l.qty, 0);
    const count = state.cart.reduce((sum, l) => sum + l.qty, 0);
    return {
      ...state,
      addToCart,
      setQty,
      removeLine,
      clearCart,
      toggleWishlist,
      markViewed,
      subtotal,
      count,
    };
  }, [state, addToCart, setQty, removeLine, clearCart, toggleWishlist, markViewed]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

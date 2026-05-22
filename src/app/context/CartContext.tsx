import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useLanguage } from "./LanguageContext";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRtl = language === "ar";
  const userKey = user?.email ? `cart_${user.email}` : "cart_guest";
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastLoadedKey, setLastLoadedKey] = useState("");

  useEffect(() => {
    const savedCart = localStorage.getItem(userKey);
    let userItems: CartItem[] = [];
    if (savedCart) {
      try {
        userItems = JSON.parse(savedCart);
      } catch (e) {
        userItems = [];
      }
    }

    // Merge Guest Cart if transitioning to a logged-in user key
    if (userKey !== "cart_guest") {
      const guestCart = localStorage.getItem("cart_guest");
      if (guestCart) {
        try {
          const guestItems = JSON.parse(guestCart) as CartItem[];
          if (guestItems.length > 0) {
            const merged = [...userItems];
            guestItems.forEach((guestItem) => {
              const idx = merged.findIndex(
                (ui) => ui.id === guestItem.id && ui.size === guestItem.size
              );
              if (idx > -1) {
                merged[idx].quantity += guestItem.quantity;
              } else {
                merged.push(guestItem);
              }
            });
            userItems = merged;

            // Clear guest cart
            localStorage.removeItem("cart_guest");
            toast.success(
              isRtl 
                ? "تم دمج منتجات السلة المؤقتة مع حسابك!" 
                : "Merged guest cart with your account!"
            );
          }
        } catch (e) {
          console.error("Failed to parse guest cart", e);
        }
      }
    }

    setItems(userItems);
    setLastLoadedKey(userKey);
  }, [userKey]);

  useEffect(() => {
    if (lastLoadedKey === userKey) {
      localStorage.setItem(userKey, JSON.stringify(items));
    }
  }, [items, userKey, lastLoadedKey]);

  const addToCart = (item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    setItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id && i.size === item.size);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

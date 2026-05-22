import React, { createContext, useContext, useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface FavoriteProduct {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  image: string;
  rating: number;
  inStock: boolean;
  sizesJson?: string;
  imagesJson?: string;
  category: string;
  categoryAr: string;
  isNew: boolean;
  discount: number;
}

interface FavoriteContextType {
  favorites: FavoriteProduct[];
  toggleFavorite: (product: FavoriteProduct) => void;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export function FavoriteProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isRtl = language === "ar";

  const userKey = user?.email ? `favorites_${user.email}` : "favorites_guest";
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [lastLoadedKey, setLastLoadedKey] = useState("");

  // Load from localStorage when userKey changes
  useEffect(() => {
    const stored = localStorage.getItem(userKey);
    let userFavs: FavoriteProduct[] = [];
    if (stored) {
      try {
        userFavs = JSON.parse(stored);
      } catch (e) {
        userFavs = [];
      }
    }

    // Merge Guest Favorites if transitioning to a logged-in user key
    if (userKey !== "favorites_guest") {
      const guestFavsRaw = localStorage.getItem("favorites_guest");
      if (guestFavsRaw) {
        try {
          const guestFavs = JSON.parse(guestFavsRaw) as FavoriteProduct[];
          if (guestFavs.length > 0) {
            const merged = [...userFavs];
            guestFavs.forEach((guestItem) => {
              if (!merged.some((ui) => ui.id === guestItem.id)) {
                merged.push(guestItem);
              }
            });
            userFavs = merged;

            // Clear guest favorites
            localStorage.removeItem("favorites_guest");
            toast.success(
              isRtl 
                ? "تم دمج قائمة المفضلة المؤقتة مع حسابك!" 
                : "Merged guest wishlist with your account!"
            );
          }
        } catch (e) {
          console.error("Failed to parse guest favorites", e);
        }
      }
    }

    setFavorites(userFavs);
    setLastLoadedKey(userKey);
  }, [userKey]);

  // Save to localStorage when favorites change
  useEffect(() => {
    if (lastLoadedKey === userKey) {
      localStorage.setItem(userKey, JSON.stringify(favorites));
    }
  }, [favorites, userKey, lastLoadedKey]);

  const isFavorite = (productId: number) => {
    return favorites.some((item) => item.id === productId);
  };

  const toggleFavorite = (product: FavoriteProduct) => {
    const exists = isFavorite(product.id);
    
    if (exists) {
      setFavorites((prev) => prev.filter((item) => item.id !== product.id));
      toast.success(
        isRtl 
          ? `تمت إزالة "${product.nameAr || product.name}" من المفضلة` 
          : `Removed "${product.name}" from favorites`
      );
    } else {
      setFavorites((prev) => [...prev, product]);
      toast.success(
        isRtl 
          ? `تمت إضافة "${product.nameAr || product.name}" إلى المفضلة` 
          : `Added "${product.name}" to favorites`
      );
    }
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite, clearFavorites }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorite() {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error("useFavorite must be used within a FavoriteProvider");
  }
  return context;
}

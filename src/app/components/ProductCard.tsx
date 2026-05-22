import { Link } from "react-router";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useFavorite } from "../context/FavoriteContext";
import { toast } from "sonner";
import { Badge } from "./ui/Badge";
import { useLanguage } from "../context/LanguageContext";
import { formatPrice } from "../utils/currency";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  rating?: number;
  inStock?: boolean;
  size?: string;
  category?: string;
  isNew?: boolean;
  discount?: number;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  categoryAr?: string;
}

export function ProductCard({
  id,
  name,
  price,
  image,
  rating = 5,
  inStock = true,
  size = "500ml",
  category,
  isNew = false,
  discount = 0,
  nameAr,
  description,
  descriptionAr,
  categoryAr,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorite();
  const { language } = useLanguage();
  const [imageLoaded, setImageLoaded] = useState(false);

  const favorited = isFavorite(Number(id));
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: `${id}-${size}`,
      name,
      price: finalPrice,
      image,
      size,
    });
    toast.success(`Added ${name} to cart`);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: Number(id),
      name,
      nameAr: nameAr || name,
      price,
      image,
      rating,
      inStock,
      category: category || "",
      categoryAr: categoryAr || category || "",
      isNew,
      discount,
      description: description || "",
      descriptionAr: descriptionAr || "",
    });
  };

  return (
    <Link
      to={`/products/${id}`}
      className="group bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-teal-accent/30 relative"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-dark-olive/50">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-petroleum-dark animate-pulse"></div>
        )}
        <img
          src={image}
          alt={name}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isNew && <Badge variant="info">New</Badge>}
          {discount > 0 && <Badge variant="error">-{discount}%</Badge>}
          {!inStock && <Badge variant="warning">Out of Stock</Badge>}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleFavorite}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
              favorited
                ? "bg-destructive text-white"
                : "bg-petroleum-blue/90 text-white hover:bg-destructive hover:text-white"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${favorited ? "fill-current" : ""}`}
            />
          </button>
        </div>

        {/* Quick Add Button */}
        {inStock && (
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleQuickAdd}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-accent to-petroleum-light text-white rounded-xl hover:from-petroleum-light hover:to-teal-dark transition-all shadow-xl"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">Quick Add</span>
            </button>
          </div>
        )}

        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-4 right-4 opacity-100 group-hover:opacity-0 transition-opacity">
            <div className="bg-petroleum-blue/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md flex items-center gap-1">
              <Star className="w-4 h-4 fill-gold-accent text-gold-accent" />
              <span className="text-sm font-medium text-white">{rating}</span>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        {category && (
          <p className="text-xs text-sage-green-light mb-2 uppercase tracking-wide">
            {category}
          </p>
        )}
        <h3 className="font-display text-xl text-white mb-2 group-hover:text-teal-accent transition-colors line-clamp-2">
          {name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {discount > 0 ? (
              <>
                <p className="text-2xl font-semibold text-teal-accent">
                  {formatPrice(finalPrice, language)}
                </p>
                <p className="text-sm text-white/60 line-through">
                  {formatPrice(price, language)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-semibold text-teal-accent">
                {formatPrice(price, language)}
              </p>
            )}
          </div>
          <span className="text-sm text-sage-green-light">{size}</span>
        </div>
      </div>
    </Link>
  );
}

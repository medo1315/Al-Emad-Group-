import { useFavorite } from "../context/FavoriteContext";
import { useLanguage } from "../context/LanguageContext";
import { ProductCard } from "../components/ProductCard";
import { Heart, ShoppingBag } from "lucide-react";
import { Link } from "react-router";

export function FavoritesPage() {
  const { favorites, clearFavorites } = useFavorite();
  const { language } = useLanguage();
  const isRtl = language === "ar";

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl text-white mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-destructive fill-current animate-pulse" />
              <span>{isRtl ? "المفضلة" : "My Wishlist"}</span>
            </h1>
            <p className="text-sage-green-light">
              {isRtl 
                ? `لديك ${favorites.length} منتج في قائمة المفضلة` 
                : `You have ${favorites.length} products saved in your wishlist`}
            </p>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="px-6 py-2.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-full text-sm font-semibold transition-all cursor-pointer"
            >
              {isRtl ? "مسح الكل" : "Clear All"}
            </button>
          )}
        </div>

        {/* Content */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id.toString()}
                name={isRtl ? product.nameAr || product.name : product.name}
                nameAr={product.nameAr}
                price={product.price}
                image={product.image}
                rating={product.rating}
                inStock={product.inStock}
                category={isRtl ? product.categoryAr || product.category : product.category}
                categoryAr={product.categoryAr}
                isNew={product.isNew}
                discount={product.discount}
                description={product.description}
                descriptionAr={product.descriptionAr}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-petroleum-blue/10 rounded-3xl border border-teal-accent/20 max-w-2xl mx-auto space-y-6">
            <Heart className="w-16 h-16 text-white/20 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-display text-white">
                {isRtl ? "قائمة المفضلة فارغة" : "Your Wishlist is Empty"}
              </h2>
              <p className="text-sage-green-light max-w-sm mx-auto text-sm">
                {isRtl 
                  ? "تصفح كتالوج المنتجات المميز لدينا وأضف المنتجات التي تعجبك إلى قائمة المفضلة." 
                  : "Explore our premium olive oil collection from Our Farms and save your favorite items."}
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-accent to-petroleum-light text-white rounded-full hover:from-petroleum-light hover:to-teal-dark font-semibold transition-all shadow-xl"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>{isRtl ? "تصفح المنتجات" : "Explore Products"}</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

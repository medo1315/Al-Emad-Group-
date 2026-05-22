import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { API_BASE_URL } from "../config";
import { formatPrice } from "../utils/currency";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  image: string;
  rating: number;
  inStock: boolean;
  sizesJson: string;
  imagesJson: string;
  category: string;
  categoryAr: string;
  isNew: boolean;
  discount: number;
}

export function ProductsPage() {
  const { t, language } = useLanguage();
  const isRtl = language === "ar";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error("Failed to fetch products.");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        toast.error(isRtl ? "فشل تحميل المنتجات من الخادم." : "Failed to load products from server.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [isRtl]);

  const categories = [
    { id: "all", name: t("allProducts") },
    { id: "extra-virgin", name: t("extraVirgin") },
    { id: "organic", name: t("organic") },
    { id: "infused", name: t("infused") },
    { id: "premium", name: t("premium") },
  ];

  const sortOptions = [
    { id: "featured", name: t("prodSortFeatured") },
    { id: "price-low", name: t("prodSortPriceLow") },
    { id: "price-high", name: t("prodSortPriceHigh") },
    { id: "name", name: t("prodSortName") },
    { id: "newest", name: t("prodSortNewest") },
  ];

  const getProductDisplayPrice = (product: Product) => {
    try {
      const sizes = JSON.parse(product.sizesJson || "[]");
      if (sizes.length > 0) {
        return sizes[0].price;
      }
    } catch (e) {}
    return product.price;
  };

  const getProductDisplaySize = (product: Product) => {
    try {
      const sizes = JSON.parse(product.sizesJson || "[]");
      if (sizes.length > 0) {
        return sizes[0].size;
      }
    } catch (e) {}
    return "500ml";
  };

  const filteredProducts = products
    .filter(product => {
      const name = isRtl ? (product.nameAr || product.name) : product.name;
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const displayPrice = getProductDisplayPrice(product);
      const finalPrice = product.discount > 0 ? displayPrice * (1 - product.discount / 100) : displayPrice;
      const matchesPrice = finalPrice >= priceRange[0] && finalPrice <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      const priceA = getProductDisplayPrice(a);
      const finalPriceA = a.discount > 0 ? priceA * (1 - a.discount / 100) : priceA;
      const priceB = getProductDisplayPrice(b);
      const finalPriceB = b.discount > 0 ? priceB * (1 - b.discount / 100) : priceB;

      switch (sortBy) {
        case "price-low":
          return finalPriceA - finalPriceB;
        case "price-high":
          return finalPriceB - finalPriceA;
        case "name":
          const nameA = isRtl ? (a.nameAr || a.name) : a.name;
          const nameB = isRtl ? (b.nameAr || b.name) : b.name;
          return nameA.localeCompare(nameB);
        case "newest":
          return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-olive to-petroleum-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-12 w-48 bg-white/10 rounded-full mx-auto animate-pulse mb-4"></div>
            <div className="h-6 w-96 bg-white/5 rounded-full mx-auto animate-pulse"></div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20 space-y-4">
                <div className="aspect-square bg-white/10 rounded-xl"></div>
                <div className="h-6 bg-white/10 rounded-md w-3/4"></div>
                <div className="h-4 bg-white/5 rounded-md w-1/2"></div>
                <div className="flex justify-between items-center pt-4">
                  <div className="h-8 bg-teal-accent/20 rounded-md w-1/3"></div>
                  <div className="h-6 bg-white/10 rounded-md w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-olive to-petroleum-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display text-5xl lg:text-6xl text-white mb-4">
            {t("products")}
          </h1>
          <p className="text-lg text-sage-green-light max-w-2xl mx-auto">
            {t("prodSubtitle")}
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-teal-accent`} />
              <input
                type="text"
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${isRtl ? "pr-12 pl-4" : "pl-12 pr-4"} py-3 bg-petroleum-blue/30 backdrop-blur-sm text-white placeholder:text-white/50 rounded-full border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-teal-accent`}
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-6 py-3 bg-petroleum-blue/30 backdrop-blur-sm text-white rounded-full border border-teal-accent/30 hover:bg-white/10 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>{t("prodFilters")}</span>
            </button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Filter className="w-5 h-5 text-teal-accent hidden lg:block" />
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full transition-all ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-teal-accent to-petroleum-light text-white shadow-xl"
                    : "bg-petroleum-blue/30 backdrop-blur-sm text-white hover:bg-white/10 border border-teal-accent/30"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Sidebar */}
        <div className="flex gap-8">
          {/* Filters Panel */}
          <aside
            className={`${
              showFilters ? "fixed inset-0 z-50 lg:relative" : "hidden"
            } lg:block lg:w-64 flex-shrink-0`}
          >
            <div className={`${showFilters ? "h-full bg-black/50 lg:bg-transparent" : ""}`}>
              <div
                className={`${
                  showFilters
                    ? `absolute ${isRtl ? "left-0" : "right-0"} top-0 h-full w-80 bg-petroleum-dark shadow-2xl overflow-y-auto`
                    : ""
                } lg:sticky lg:top-24 bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/30`}
              >
                {/* Mobile Close Button */}
                {showFilters && (
                  <button
                    onClick={() => setShowFilters(false)}
                    className="lg:hidden absolute top-4 right-4 p-2 hover:bg-white/10 text-white rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                <h3 className="font-display text-xl text-white mb-6">{t("prodFilters")}</h3>

                {/* Sort By */}
                <div className="mb-6">
                  <label className="block text-sm text-white mb-3">{t("sort")}</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-olive/50 text-white rounded-lg border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-teal-accent"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id} className="bg-petroleum-dark">
                        {option.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm text-white mb-3">
                    {t("prodPriceRange")}: {formatPrice(priceRange[0], language)} - {formatPrice(priceRange[1], language)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full accent-teal-accent"
                  />
                </div>

                {/* Filter Stats */}
                <div className="pt-6 border-t border-teal-accent/20">
                  <p className="text-sm text-white/70">
                    {t("prodShowing")} {filteredProducts.length} {t("prodOf")} {products.length} {t("prodProducts")}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id.toString()}
                    name={isRtl ? (product.nameAr || product.name) : product.name}
                    price={getProductDisplayPrice(product)}
                    image={product.image}
                    rating={product.rating}
                    inStock={product.inStock}
                    size={getProductDisplaySize(product)}
                    category={isRtl ? (product.categoryAr || product.category) : product.category}
                    isNew={product.isNew}
                    discount={product.discount}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-muted-foreground">{t("prodNoneFound")}</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setPriceRange([0, 100]);
                  }}
                  className="mt-4 px-6 py-3 bg-olive-green text-white rounded-full hover:bg-dark-olive transition-colors"
                >
                  {t("prodClearFilters")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

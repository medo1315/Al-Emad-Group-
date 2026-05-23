import { Link } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { ArrowRight, Leaf, Award, Heart, ShoppingBag } from "lucide-react";
import { OliveBranchDecor } from "../components/OliveBranchDecor";
import { ProductCard } from "../components/ProductCard";
import logoImage from "../../imports/logo.png";
import heroBg from "../../imports/ChatGPT Image May 18, 2026, 09_43_36 PM.png";
import heroBgAr from "../../imports/ChatGPT Image May 19, 2026, 08_47_45 PM.png";

export function HomePage() {
  const { t, language } = useLanguage();

  const features = [
    {
      icon: Award,
      title: t("premium"),
      description: t("premiumDesc"),
    },
    {
      icon: Leaf,
      title: t("organicFeature"),
      description: t("organicDesc"),
    },
    {
      icon: Heart,
      title: t("traditional"),
      description: t("traditionalDesc"),
    },
  ];

  interface DBProduct {
    id: number;
    name: string;
    nameAr: string;
    price: number;
    image: string;
    rating: number;
    inStock: boolean;
    sizesJson: string;
    category: string;
    categoryAr: string;
    isNew: boolean;
    discount: number;
  }

  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (response.ok) {
          const data = await response.json();
          // Take the first 4 products to show on the homepage
          setProducts(data.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to fetch featured products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getProductDisplayPrice = (product: DBProduct) => {
    try {
      const sizes = JSON.parse(product.sizesJson || "[]");
      if (sizes.length > 0) {
        return sizes[0].price;
      }
    } catch (e) { }
    return product.price;
  };

  const getProductDisplaySize = (product: DBProduct) => {
    try {
      const sizes = JSON.parse(product.sizesJson || "[]");
      if (sizes.length > 0) {
        return sizes[0].size;
      }
    } catch (e) { }
    return "500ml";
  };

  return (
    <div className="bg-dark-olive">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#E2DCC8]">
        {/* Full Width Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={language === 'ar' ? heroBgAr : heroBg}
            alt="Premium Olive Oil Background"
            className={`w-full h-full object-cover ${language === 'ar' ? 'object-[20%_center]' : 'object-[80%_center]'} md:object-center`}
          />
          {/* Glass blur overlay on mobile only (below md) */}
          <div className="absolute inset-0 bg-[#E2DCC8]/40 backdrop-blur-[6px] md:bg-transparent md:backdrop-blur-none transition-all duration-300"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Elegant Text Content */}
          <div className="space-y-4 md:space-y-8 text-center md:text-start animate-slide-up w-full flex flex-col items-center md:items-start">
            {/* Floating Badge */}
            <div className="inline-flex items-center gap-1.5 bg-dark-olive/10 backdrop-blur-sm px-4 py-1.5 md:px-6 md:py-2 rounded-full border border-dark-olive/20 animate-bounce-slow shadow-sm">
              <Leaf className="w-3.5 h-3.5 md:w-5 md:h-5 text-dark-olive" />
              <span className="text-[10px] md:text-sm font-bold text-dark-olive tracking-widest uppercase">{t("naturalOrganic")}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-dark-olive leading-tight lg:leading-none animate-fade-in font-bold tracking-tight">
              {t("heroTitle")}
            </h1>

            <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-petroleum-dark/90 max-w-2xl animate-fade-in delay-200 font-medium leading-relaxed">
              {t("heroSubtitle")}
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-row justify-center md:justify-start gap-3 pt-2 md:pt-6 animate-fade-in delay-300 w-full sm:w-auto">
              <Link
                to="/products"
                className="group px-5 py-3 md:px-10 md:py-5 bg-dark-olive text-white rounded-full hover:bg-petroleum-dark transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-2 md:gap-3 transform hover:scale-105"
              >
                <ShoppingBag className="w-4 h-4 md:w-6 md:h-6" />
                <span className="text-xs sm:text-sm md:text-lg font-medium tracking-wide whitespace-nowrap">{t("shopNow")}</span>
                <ArrowRight className="w-4 h-4 md:w-6 md:h-6 transition-transform rtl:rotate-180 group-hover:translate-x-1.5 md:group-hover:translate-x-2 rtl:group-hover:-translate-x-1.5 rtl:group-hover:-translate-x-2" />
              </Link>

              <Link
                to="/about"
                className="px-5 py-3 md:px-10 md:py-5 bg-transparent text-dark-olive rounded-full hover:bg-dark-olive/5 transition-all border border-dark-olive md:border-2 flex items-center justify-center gap-2 md:gap-3 transform hover:scale-105"
              >
                <span className="text-xs sm:text-sm md:text-lg font-bold tracking-wide whitespace-nowrap">{t("learnMore")}</span>
              </Link>
            </div>
          </div>

          {/* Empty column to push content, aligning with the bottles on the right (in LTR) / left (in RTL) */}
          <div className="hidden lg:block"></div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(180deg); }
          50% { transform: translateY(-20px) rotate(185deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slow-zoom {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.15); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 6s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-slide-up { animation: slide-up 1s ease-out forwards; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .animate-slow-zoom { animation: slow-zoom 20s ease-in-out infinite alternate; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-1000 { animation-delay: 1s; }
      `}</style>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-petroleum-dark to-olive-green-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl text-white mb-4">
              {t("whyChooseUs")}
            </h2>
            <p className="text-lg text-sage-green-light max-w-2xl mx-auto">
              {t("discoverApart")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 bg-dark-olive/50 backdrop-blur-sm rounded-2xl hover:bg-petroleum-blue/50 hover:shadow-2xl transition-all border-2 border-teal-accent/30 hover:border-teal-accent flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-accent to-petroleum-light rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-2xl text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sage-green-light">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-olive-green-dark to-dark-olive">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-4xl lg:text-5xl text-white mb-2">
                {t("featuredProducts")}
              </h2>
              <p className="text-sage-green-light">{t("popularSelections")}</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-2 text-teal-accent hover:text-sage-green-light transition-colors group"
            >
              <span>{t("viewAll")}</span>
              <ArrowRight className="w-5 h-5 transition-transform rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20 space-y-4 animate-pulse">
                  <div className="aspect-square bg-white/10 rounded-xl"></div>
                  <div className="h-6 bg-white/10 rounded-md w-3/4"></div>
                  <div className="h-4 bg-white/5 rounded-md w-1/2"></div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="h-8 bg-teal-accent/20 rounded-md w-1/3"></div>
                    <div className="h-6 bg-white/10 rounded-md w-1/4"></div>
                  </div>
                </div>
              ))
            ) : (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id.toString()}
                  name={language === "ar" ? (product.nameAr || product.name) : product.name}
                  price={getProductDisplayPrice(product)}
                  image={product.image}
                  rating={product.rating}
                  inStock={product.inStock}
                  size={getProductDisplaySize(product)}
                  category={language === "ar" ? (product.categoryAr || product.category) : product.category}
                  isNew={product.isNew}
                  discount={product.discount}
                />
              ))
            )}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-teal-accent hover:text-sage-green-light transition-colors"
            >
              <span>{t("viewAll")}</span>
              <ArrowRight className="w-5 h-5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Heritage Section */}
      <section className="py-20 bg-gradient-to-br from-petroleum-dark to-teal-dark relative overflow-hidden">
        <OliveBranchDecor className="absolute top-0 left-0 w-64 h-64 text-teal-accent opacity-10" />
        <OliveBranchDecor className="absolute bottom-0 right-0 w-72 h-72 text-sage-green opacity-10 rotate-180" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img
            src={logoImage}
            alt="AL EMAD GROUP Logo"
            className="w-32 h-32 mx-auto mb-8 object-contain bg-white/10 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border-2 border-teal-accent/30"
          />
          <h2 className="font-display text-4xl lg:text-5xl text-white mb-6">
            {t("establishedForOlives")}
          </h2>
          <p className="text-lg lg:text-xl text-sage-green-light max-w-3xl mx-auto mb-8 leading-relaxed">
            {t("heritageDesc")}
          </p>
          <div className="flex flex-row gap-3 justify-center">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 px-5 py-3 md:px-8 md:py-4 bg-gradient-to-r from-teal-accent to-petroleum-light text-white rounded-full hover:from-petroleum-light hover:to-teal-dark transition-all shadow-xl text-xs sm:text-base"
            >
              <span>{t("ourStory")}</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 rtl:rotate-180" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 md:px-8 md:py-4 bg-olive-green/30 text-white rounded-full hover:bg-olive-green/50 transition-all border sm:border-2 border-teal-accent backdrop-blur-sm text-xs sm:text-base"
            >
              <span>{t("getInTouch")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Olive Grove Section */}
      <section className="py-20 bg-gradient-to-br from-olive-green-dark via-dark-olive to-petroleum-dark text-white relative overflow-hidden border-t-2 border-teal-accent/30">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.unsplash.com/photo-1617708139288-c04371187382?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2002"
            alt="Olive Grove"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl lg:text-5xl mb-6 text-white">
            {t("fromOurGroves")}
          </h2>
          <p className="text-lg lg:text-xl text-sage-green-light max-w-3xl mx-auto mb-8">
            {t("grovesDesc")}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-5 py-3 md:px-8 md:py-4 bg-gradient-to-r from-teal-accent to-petroleum-light text-white rounded-full hover:from-petroleum-light hover:to-teal-dark transition-all shadow-2xl text-xs sm:text-base"
          >
            <span>{t("exploreCollection")}</span>
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </div>
  );
}

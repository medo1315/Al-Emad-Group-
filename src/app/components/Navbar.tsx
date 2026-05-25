import { Link, useLocation } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useFavorite } from "../context/FavoriteContext";
import { ShoppingCart, Globe, User, Home, ShoppingBag, Info, LogOut, Heart } from "lucide-react";
import logoImage from "../../imports/logo.png";

export function Navbar() {
  const { t, language, toggleLanguage } = useLanguage();
  const { itemCount } = useCart();
  const { favorites } = useFavorite();
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const loginRedirectPath = location.pathname !== "/" && location.pathname !== "/login" && location.pathname !== "/register"
    ? `/login?redirect=${encodeURIComponent(location.pathname.substring(1))}`
    : "/login";

  const navLinks = [
    { path: "/", label: t("home") },
    { path: "/products", label: t("products") },
    { path: "/about", label: t("about") },
    { path: "/contact", label: t("contact") },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Top Header - Glassmorphism */}
      <header className="sticky top-0 z-50 bg-[#1e241e]/70 backdrop-blur-md border-b border-white/10 shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logoImage}
                alt="AL EMAD GROUP"
                className="w-12 h-12 object-contain group-hover:scale-105 transition-transform bg-white/10 rounded-lg p-1 backdrop-blur-sm border border-white/10"
              />
              <div className="block">
                <h1 className="font-display text-xl text-white leading-none font-bold tracking-tight">
                  AL EMAD GROUP
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation Links (Capsule Style) */}
            <div className="hidden lg:flex items-center bg-white/5 border border-white/10 backdrop-blur-md rounded-full p-1.5 gap-1.5 shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm tracking-wide px-6 py-2.5 rounded-full transition-all duration-300 font-semibold ${isActive(link.path)
                      ? "bg-gradient-to-r from-teal-accent to-sage-green text-dark-olive shadow-lg scale-105"
                      : "text-white/80 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions (Desktop: Language, Cart, Profile; Mobile: Just Language) */}
            <div className="flex items-center gap-4">
              {/* Language Toggle (Always available) */}
              <button
                onClick={toggleLanguage}
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-accent/30 text-white/90 hover:text-teal-accent flex flex-col items-center justify-center transition-all duration-300 backdrop-blur-sm"
                aria-label="Toggle Language"
              >
                <Globe className="w-4 h-4 text-teal-accent" />
                <span className="text-[8px] font-bold mt-0.5">{language === "en" ? "AR" : "EN"}</span>
              </button>

              {/* Favorites (Wishlist) */}
              <Link
                to="/favorites"
                className="relative w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-accent/30 text-white/90 hover:text-teal-accent flex items-center justify-center transition-all duration-300 backdrop-blur-sm"
                aria-label="Wishlist"
              >
                <Heart className="w-4.5 h-4.5 text-teal-accent" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-gradient-to-r from-teal-accent to-petroleum-light text-white text-xs font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(45,189,168,0.5)] border border-teal-accent/50">
                    {favorites.length}
                  </span>
                )}
              </Link>

              {/* Desktop Actions */}
              <div className="hidden lg:flex items-center gap-3">
                {/* Cart */}
                <Link
                  to="/cart"
                  className="relative w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-accent/30 text-white/90 hover:text-teal-accent flex items-center justify-center transition-all duration-300"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-gradient-to-r from-teal-accent to-petroleum-light text-white text-xs font-bold rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(45,189,168,0.5)] border border-teal-accent/50">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* My Orders */}
                {isAuthenticated && (
                  <Link
                    to="/my-orders"
                    className={`relative w-12 h-12 rounded-full border transition-all duration-300 flex items-center justify-center ${isActive("/my-orders")
                        ? "bg-gradient-to-r from-teal-accent to-sage-green text-dark-olive border-teal-accent shadow-lg scale-105"
                        : "bg-white/5 border-white/10 hover:border-teal-accent/30 text-white/90 hover:text-teal-accent"
                      }`}
                    title={language === "ar" ? "طلباتي" : "My Orders"}
                  >
                    <ShoppingBag className="w-4.5 h-4.5" />
                  </Link>
                )}

                {/* Profile / Logout */}
                {isAuthenticated ? (
                  <div className="flex items-center gap-3">
                    <span className="text-white/80 text-sm hidden md:inline-block font-sans max-w-[120px] truncate">
                      {user?.fullName}
                    </span>
                    <button
                      onClick={logout}
                      className="w-12 h-12 rounded-full bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-white/90 hover:text-red-400 flex items-center justify-center transition-all duration-300"
                      title={t("logout")}
                      aria-label="Logout"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ) : (
                  <Link
                    to={loginRedirectPath}
                    className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-accent/30 text-white/90 hover:text-teal-accent flex items-center justify-center transition-all duration-300"
                    aria-label="Login"
                  >
                    <User className="w-4.5 h-4.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar Navigation (App-like navigation) */}
      <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 h-16 rounded-2xl bg-[#1e241e]/85 backdrop-blur-lg border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex items-center justify-between px-1 py-1 transition-all duration-300">

        {/* Home Tab */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all duration-300 ${isActive("/")
              ? "text-teal-accent scale-105 bg-teal-accent/10 border border-teal-accent/20"
              : "text-white/60 hover:text-white"
            }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] sm:text-[10px] font-medium mt-1 whitespace-nowrap">{t("home")}</span>
        </Link>

        {/* Products Tab */}
        <Link
          to="/products"
          className={`flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all duration-300 ${isActive("/products")
              ? "text-teal-accent scale-105 bg-teal-accent/10 border border-teal-accent/20"
              : "text-white/60 hover:text-white"
            }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[9px] sm:text-[10px] font-medium mt-1 whitespace-nowrap">{t("products")}</span>
        </Link>

        {/* Cart Tab */}
        <Link
          to="/cart"
          className={`relative flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all duration-300 ${isActive("/cart")
              ? "text-teal-accent scale-105 bg-teal-accent/10 border border-teal-accent/20"
              : "text-white/60 hover:text-white"
            }`}
        >
          <ShoppingCart className="w-5 h-5" />
          {itemCount > 0 && (
            <span className="absolute top-1 right-[20%] min-w-4 h-4 px-1 bg-gradient-to-r from-teal-accent to-petroleum-light text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md">
              {itemCount}
            </span>
          )}
          <span className="text-[9px] sm:text-[10px] font-medium mt-1 whitespace-nowrap">{t("cart")}</span>
        </Link>

        {/* About Tab */}
        <Link
          to="/about"
          className={`flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all duration-300 ${isActive("/about")
              ? "text-teal-accent scale-105 bg-teal-accent/10 border border-teal-accent/20"
              : "text-white/60 hover:text-white"
            }`}
        >
          <Info className="w-5 h-5" />
          <span className="text-[9px] sm:text-[10px] font-medium mt-1 whitespace-nowrap">{t("about")}</span>
        </Link>

        {/* Account Tab */}
        {isAuthenticated ? (
          <Link
            to="/my-orders"
            className={`flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all duration-300 ${isActive("/my-orders")
                ? "text-teal-accent scale-105 bg-teal-accent/10 border border-teal-accent/20"
                : "text-white/60 hover:text-white"
              }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] font-medium mt-1 whitespace-nowrap">{language === "ar" ? "طلباتي" : "Orders"}</span>
          </Link>
        ) : (
          <Link
            to={loginRedirectPath}
            className={`flex flex-col items-center justify-center flex-1 h-12 rounded-xl transition-all duration-300 ${isActive("/login")
                ? "text-teal-accent scale-105 bg-teal-accent/10 border border-teal-accent/20"
                : "text-white/60 hover:text-white"
              }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[9px] sm:text-[10px] font-medium mt-1 whitespace-nowrap">{t("login")}</span>
          </Link>
        )}
      </nav>
    </>
  );
}

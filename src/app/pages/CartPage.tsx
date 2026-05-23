import { Link, useNavigate } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/currency";
import { toast } from "sonner";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";

export function CartPage() {
  const { t, language } = useLanguage();
  const { items, removeFromCart, updateQuantity, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      toast.error(
        language === "ar"
          ? "يرجى تسجيل الدخول أولاً لإتمام عملية الشراء."
          : "Please log in first to complete your purchase."
      );
      navigate("/login?redirect=checkout");
    } else {
      navigate("/checkout");
    }
  };

  const shipping = 5.99;
  const finalTotal = total + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dark-olive to-petroleum-dark flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-petroleum-blue/30 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-teal-accent" />
          </div>
          <h2 className="font-display text-3xl text-white mb-4">
            {t("cartEmpty")}
          </h2>
          <p className="text-sage-green-light mb-8">
            {t("cartEmptyDesc")}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-accent to-petroleum-light text-white rounded-full hover:from-petroleum-light hover:to-teal-dark transition-all shadow-xl"
          >
            <span>{t("exploreProducts")}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-olive to-petroleum-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-teal-accent hover:text-sage-green-light mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t("continueShopping")}</span>
        </Link>

        <h1 className="font-display text-4xl lg:text-5xl text-white mb-12">
          {t("cart")}
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl p-6 flex gap-6 border border-teal-accent/30 hover:shadow-2xl transition-shadow"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl text-white mb-1">
                    {item.name}
                  </h3>
                  {item.size && (
                    <p className="text-sm text-sage-green-light mb-3">{item.size}</p>
                  )}
                  <p className="text-lg text-teal-accent">
                    {formatPrice(item.price, language)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-destructive"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-dark-olive/50 hover:bg-petroleum-dark text-white transition-colors flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-dark-olive/50 hover:bg-petroleum-dark text-white transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/30 sticky top-24">
              <h2 className="font-display text-2xl text-white mb-6">
                {t("cartSummary")}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-white/90">
                  <span>{t("subtotal")}</span>
                  <span>{formatPrice(total, language)}</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>{t("cartShipping")}</span>
                  <span>{formatPrice(shipping, language)}</span>
                </div>

                <div className="h-px bg-teal-accent/20"></div>
                <div className="flex justify-between text-xl text-white">
                  <span className="font-display">{t("total")}</span>
                  <span className="font-display">{formatPrice(finalTotal, language)}</span>
                </div>
              </div>

              <button onClick={handleCheckoutClick} className="w-full block mb-4 border-none bg-transparent p-0 text-left cursor-pointer">
                <Button className="w-full" size="lg">
                  {t("checkout")}
                </Button>
              </button>

              <div className="space-y-2 text-sm text-muted-foreground">
               
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sage-green rounded-full"></span>
                  {t("cartSecurePay")}
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sage-green rounded-full"></span>
                  {t("cartShipsSoon")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

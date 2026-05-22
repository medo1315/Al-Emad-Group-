import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/currency";
import { API_BASE_URL } from "../config";
import {
  ArrowLeft,
  CreditCard,
  Truck,
  Shield,
  Check,
  Package,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";

export function CheckoutPage() {
  const { t, language } = useLanguage();
  const { items, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercentage: number } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setIsValidatingCoupon(true);
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/validate/${couponCodeInput.trim()}`, {
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });
      if (!response.ok) throw new Error("Validation failed");
      const result = await response.json();
      if (result.isValid) {
        setAppliedCoupon({
          code: couponCodeInput.trim().toUpperCase(),
          discountPercentage: result.discountPercentage
        });
        toast.success(
          language === "ar"
            ? `تم تطبيق الكوبون! خصم ${result.discountPercentage}%`
            : `Coupon applied! ${result.discountPercentage}% discount`
        );
      } else {
        toast.error(result.message || (language === "ar" ? "كوبون غير صالح" : "Invalid coupon"));
      }
    } catch (e) {
      toast.error(language === "ar" ? "خطأ في التحقق من الكوبون" : "Error validating coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error(
        language === "ar"
          ? "يرجى تسجيل الدخول أولاً لإتمام عملية الشراء."
          : "Please log in first to complete your purchase."
      );
      navigate("/login?redirect=checkout");
    }
  }, [isAuthenticated, navigate, language]);

  const [formData, setFormData] = useState(() => {
    const names = user?.fullName ? user.fullName.split(" ") : [];
    const firstName = names[0] || "";
    const lastName = names.slice(1).join(" ") || "";
    return {
      // Shipping Info
      firstName,
      lastName,
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA",

      // Payment Info
      cardNumber: "",
      cardName: "",
      expiryDate: "",
      cvv: "",

      // Additional
      shippingMethod: "standard",
      saveInfo: false,
    };
  });

  const shipping = formData.shippingMethod === "express" ? 12.99 : 5.99;
  const couponDiscount = appliedCoupon ? total * (appliedCoupon.discountPercentage / 100) : 0;
  const discountedSubtotal = total - couponDiscount;
  const tax = discountedSubtotal * 0.1;
  const finalTotal = discountedSubtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      // Validate shipping info
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.address) {
        toast.error(t("checkoutRequiredFields"));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    const payload = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      couponCode: appliedCoupon?.code || "",
      orderItems: items.map(item => ({
        productId: parseInt(item.id),
        quantity: item.quantity,
        price: item.price,
        size: item.size || ""
      }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place order.");
      }

      toast.success(t("checkoutSuccess"));
      clearCart();
      setIsProcessing(false);
      navigate("/");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || (language === "ar" ? "فشل إتمام الطلب." : "Failed to place the order."));
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-petroleum-blue/30 backdrop-blur-sm flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <Package className="w-16 h-16 text-sage-green-light mx-auto mb-4" />
          <h2 className="font-display text-3xl text-white mb-4">
            {t("cartEmpty")}
          </h2>
          <p className="text-sage-green-light mb-8">
            {t("checkoutEmptyDesc")}
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-olive-green text-white rounded-full hover:bg-dark-olive transition-all"
          >
            <span>{t("checkoutBrowse")}</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petroleum-blue/30 backdrop-blur-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-teal-accent hover:text-white mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>{t("checkoutBack")}</span>
        </Link>

        <h1 className="font-display text-4xl lg:text-5xl text-white mb-12">
          {t("checkout")}
        </h1>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: t("checkoutStepShipping") },
              { num: 2, label: t("checkoutStepPayment") },
              { num: 3, label: t("checkoutStepReview") },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      step >= s.num
                        ? "bg-olive-green text-white"
                        : "bg-petroleum-blue/30 backdrop-blur-sm border-2 border-teal-accent/30 text-sage-green-light"
                    }`}
                  >
                    {step > s.num ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <span className="font-semibold">{s.num}</span>
                    )}
                  </div>
                  <span className="text-sm mt-2 text-white">{s.label}</span>
                </div>
                {index < 2 && (
                  <div
                    className={`w-24 h-1 mx-4 transition-all ${
                      step > s.num ? "bg-olive-green" : "bg-border"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Shipping Information */}
            {step === 1 && (
              <div className="bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl p-8 border border-teal-accent/30">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-6 h-6 text-teal-accent" />
                  <h2 className="font-display text-2xl text-white">
                    {t("checkoutShipTitle")}
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white mb-2">
                      {t("checkoutFirstName")} <span className="text-destructive">{t("checkoutRequired")}</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">
                      {t("checkoutLastName")} <span className="text-destructive">{t("checkoutRequired")}</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">
                      {t("checkoutEmail")} <span className="text-destructive">{t("checkoutRequired")}</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">{t("checkoutPhone")}</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 font-sans"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-white mb-2">
                      {t("checkoutAddress")} <span className="text-destructive">{t("checkoutRequired")}</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">{t("checkoutCity")}</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">{t("checkoutState")}</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">{t("checkoutZip")}</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">{t("checkoutCountry")}</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 font-sans"
                    >
                      <option value="USA">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                    </select>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="mt-8">
                  <h3 className="font-display text-lg text-white mb-4">
                    {t("checkoutShipMethod")}
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-teal-accent/30 hover:border-olive-green cursor-pointer transition-all">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={formData.shippingMethod === "standard"}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-teal-accent"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">{t("checkoutStandardShip")}</p>
                        <p className="text-sm text-sage-green-light">{t("checkoutStandardDays")}</p>
                      </div>
                      <span className="text-teal-accent font-semibold">{formatPrice(5.99, language)}</span>
                    </label>

                    <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-teal-accent/30 hover:border-olive-green cursor-pointer transition-all">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={formData.shippingMethod === "express"}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-teal-accent"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-white">{t("checkoutExpressShip")}</p>
                        <p className="text-sm text-sage-green-light">{t("checkoutExpressDays")}</p>
                      </div>
                      <span className="text-teal-accent font-semibold">{formatPrice(12.99, language)}</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <Button onClick={handleNextStep} className="w-full" size="lg">
                    {t("checkoutPayBtn")}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {step === 2 && (
              <div className="bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl p-8 border border-teal-accent/30">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-teal-accent" />
                  <h2 className="font-display text-2xl text-white">
                    {language === "ar" ? "طريقة الدفع" : "Payment Method"}
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="p-6 rounded-2xl border-2 border-teal-accent bg-teal-accent/5 flex items-start gap-4">
                    <div className="mt-1 flex items-center justify-center w-5 h-5 rounded-full border-2 border-teal-accent bg-teal-accent text-white flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {language === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}
                      </h3>
                      <p className="text-sm text-sage-green-light mt-2 leading-relaxed">
                        {language === "ar" 
                          ? "ادفع نقدًا عند استلام طلبك. يرجى التأكد من جاهزية المبلغ المطلوب عند وصول مندوب التوصيل."
                          : "Pay with cash upon delivery. Please ensure you have the correct amount ready when the courier arrives."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-dark-olive/50 rounded-xl border border-teal-accent/10">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <p className="text-xs text-white/90">
                      {language === "ar"
                        ? "طلبك آمن 100٪. لن يتم تحصيل أي مبالغ منك حتى يتم تسليم المنتج لباب منزلك."
                        : "Your order is 100% secure. You will not be charged anything until the products are delivered to your doorstep."}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                    {t("checkoutBackBtn")}
                  </Button>
                  <Button onClick={handleNextStep} className="flex-1" size="lg">
                    {t("checkoutReviewBtn")}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {step === 3 && (
              <div className="bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl p-8 border border-teal-accent/30">
                <h2 className="font-display text-2xl text-white mb-6">
                  {t("checkoutReviewTitle")}
                </h2>

                <div className="space-y-6">
                  {/* Shipping Address */}
                  <div className="p-4 bg-dark-olive/50 rounded-xl">
                    <h3 className="font-semibold text-white mb-2">{t("checkoutShipAddress")}</h3>
                    <p className="text-white/90">
                      {formData.firstName} {formData.lastName}
                    </p>
                    <p className="text-white/90">{formData.address}</p>
                    <p className="text-white/90">
                      {formData.city}, {formData.state} {formData.zipCode}
                    </p>
                    <p className="text-white/90">{formData.country}</p>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h3 className="font-semibold text-white mb-4">{t("checkoutOrderItems")}</h3>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="text-white">{item.name}</p>
                            <p className="text-sm text-sage-green-light">
                              {item.size} × {item.quantity}
                            </p>
                          </div>
                          <p className="text-teal-accent font-semibold">
                            {formatPrice(item.price * item.quantity, language)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                    {t("checkoutBackBtn")}
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2"
                    size="lg"
                  >
                    {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>{isProcessing ? t("checkoutProcessing") : t("checkoutPlaceOrder")}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/30 sticky top-24">
              <h2 className="font-display text-2xl text-white mb-6">
                {t("cartSummary")}
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-white/90">
                  <span>{t("subtotal")} ({items.length} {t("prodProducts")})</span>
                  <span>{formatPrice(total, language)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>
                      {language === "ar" ? "خصم الكوبون" : "Coupon Discount"} ({appliedCoupon.code})
                    </span>
                    <span>-{formatPrice(couponDiscount, language)}</span>
                  </div>
                )}

                <div className="flex justify-between text-white/90">
                  <span>{t("cartShipping")}</span>
                  <span>{formatPrice(shipping, language)}</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>{t("cartTax")}</span>
                  <span>{formatPrice(tax, language)}</span>
                </div>
                
                {/* Coupon Code Input block */}
                <div className="pt-2 pb-2 border-t border-b border-teal-accent/10">
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={language === "ar" ? "كود الخصم..." : "Coupon code..."}
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className={`flex-1 px-3 py-2 bg-petroleum-dark/50 text-white rounded-lg border border-teal-accent/25 focus:outline-none focus:border-teal-accent text-xs font-mono font-bold ${
                          language === "ar" ? "text-right" : "text-left"
                        }`}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponCodeInput}
                        className="px-4 py-2 bg-teal-accent/20 hover:bg-teal-accent border border-teal-accent/30 hover:border-teal-accent text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                      >
                        {isValidatingCoupon ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>{language === "ar" ? "تطبيق" : "Apply"}</span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg">
                      <div className="flex items-center gap-1.5 text-xs text-white">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono font-bold text-emerald-400">{appliedCoupon.code}</span>
                        <span>({appliedCoupon.discountPercentage}%)</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-red-400 hover:text-red-300 font-bold underline transition-colors"
                      >
                        {language === "ar" ? "إلغاء" : "Remove"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-xl pt-2">
                  <span className="font-display text-white">{t("total")}</span>
                  <span className="font-display text-teal-accent">
                    {formatPrice(finalTotal, language)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-sm text-sage-green-light">
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sage-green" />
                  {t("checkoutSecureCheck")}
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sage-green" />
                  {t("cartFreeReturns")}
                </p>
                <p className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sage-green" />
                  {t("checkoutMoneyBack")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

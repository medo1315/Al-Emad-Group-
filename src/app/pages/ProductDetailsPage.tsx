import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/currency";
import { useAuth } from "../context/AuthContext";
import { useFavorite } from "../context/FavoriteContext";
import { Star, ShoppingCart, Heart, ArrowLeft, Check, Leaf, Truck, Shield, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/Badge";
import { API_BASE_URL } from "../config";

interface DBProduct {
  id: number;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  image: string;
  rating: number;
  inStock: boolean;
  stock: number;
  sizesJson: string;
  imagesJson: string;
  category: string;
  categoryAr: string;
  isNew: boolean;
  discount: number;
  benefitsJson?: string;
  featuresJson?: string;
  nutritionalJson?: string;
}

export function ProductDetailsPage() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const isRtl = language === "ar";
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("500ml");
  const [product, setProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");

  const { toggleFavorite, isFavorite } = useFavorite();
  const favorited = product ? isFavorite(product.id) : false;

  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/product/${id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        setProduct(data);
        setSelectedImage(data.image);
        
        try {
          const parsedSizes = JSON.parse(data.sizesJson || "[]");
          if (parsedSizes.length > 0) {
            setSelectedSize(parsedSizes[0].size);
          } else {
            setSelectedSize("500ml");
          }
        } catch (e) {
          setSelectedSize("500ml");
        }
      } catch (err) {
        toast.error(isRtl ? "فشل تحميل تفاصيل المنتج." : "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    fetchReviews();
  }, [id, isRtl]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(isRtl ? "يجب تسجيل الدخول أولاً لترك تعليق." : "Please login to write a review.");
      return;
    }
    if (!newComment.trim()) {
      toast.error(isRtl ? "يرجى كتابة تعليق." : "Please write a comment.");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reviews/product/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          rating: newRating,
          comment: newComment
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to submit review.");
      }

      toast.success(isRtl ? "تم إضافة تعليقك بنجاح!" : "Review submitted successfully!");
      setNewComment("");
      setNewRating(5);
      fetchReviews();
      
      // Also update the local product rating in UI
      const prodResp = await fetch(`${API_BASE_URL}/products/${id}`);
      if (prodResp.ok) {
        const prodData = await prodResp.json();
        setProduct(prodData);
      }
    } catch (err: any) {
      toast.error(err.message || (isRtl ? "حدث خطأ ما." : "Something went wrong."));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-petroleum-blue/30 backdrop-blur-sm flex items-center justify-center py-20">
        <div className="text-center text-white space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-teal-accent mx-auto" />
          <p className="text-lg text-sage-green-light">{isRtl ? "جاري تحميل تفاصيل المنتج..." : "Loading product details..."}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-petroleum-blue/30 backdrop-blur-sm py-20 text-center">
        <p className="text-2xl text-white mb-6">{isRtl ? "المنتج غير موجود!" : "Product not found!"}</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-olive-green text-white rounded-full hover:bg-dark-olive transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("prodBackToProducts")}</span>
        </Link>
      </div>
    );
  }

  const productName = isRtl ? (product.nameAr || product.name) : product.name;
  const productDescription = isRtl ? (product.descriptionAr || product.description) : product.description;

  const defaultImages: string[] = (() => {
    try {
      const parsed = JSON.parse(product.imagesJson || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {}
    return [product.image];
  })();

  const sizes: { size: string; price: number }[] = (() => {
    try {
      return JSON.parse(product.sizesJson || "[]");
    } catch (e) {
      return [];
    }
  })();

  const currentPrice = sizes.find(s => s.size === selectedSize)?.price || product.price;
  const finalPrice = product.discount > 0 ? currentPrice * (1 - product.discount / 100) : currentPrice;

  const benefits: { icon: any; text: string }[] = (() => {
    try {
      const parsed = JSON.parse(product.benefitsJson || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((b: any, index: number) => {
          const icons = [Truck, Shield, RefreshCw];
          const icon = icons[index % icons.length];
          return {
            icon,
            text: isRtl
              ? (b.textAr || b.text || "").replace("$50", "2,500 ج.م")
              : (b.text || b.textAr || "").replace("$50", "EGP 2,500")
          };
        });
      }
    } catch (e) {}
    return [
      { icon: Truck, text: t("prodBenefits1") },
      { icon: Shield, text: t("prodBenefits2") },
      { icon: RefreshCw, text: t("prodBenefits3") },
    ];
  })();

  const nutritionalInfo: { label: string; value: string }[] = (() => {
    try {
      const parsed = JSON.parse(product.nutritionalJson || "{}");
      if (parsed.info && Array.isArray(parsed.info) && parsed.info.length > 0) {
        return parsed.info.map((n: any) => ({
          label: isRtl ? (n.labelAr || n.label) : (n.label || n.labelAr),
          value: isRtl ? (n.valueAr || n.value) : (n.value || n.valueAr)
        }));
      }
    } catch (e) {}
    return [
      { label: t("prodNutr1"), value: t("prodNutr1Val") },
      { label: t("prodNutr2"), value: t("prodNutr2Val") },
      { label: t("prodNutr3"), value: t("prodNutr3Val") },
      { label: t("prodNutr4"), value: t("prodNutr4Val") },
      { label: t("prodNutr5"), value: t("prodNutr5Val") },
    ];
  })();

  const dynamicFootnote = (() => {
    try {
      const parsed = JSON.parse(product.nutritionalJson || "{}");
      if (parsed.footnote || parsed.footnoteAr) {
        return isRtl ? (parsed.footnoteAr || parsed.footnote) : (parsed.footnote || parsed.footnoteAr);
      }
    } catch (e) {}
    return isRtl
      ? "* تعتمد النسب المئوية للقيم اليومية على نظام غذائي يحتوي على 2000 سعرة حرارية"
      : "* Percent Daily Values are based on a 2,000 calorie diet";
  })();

  const features: string[] = (() => {
    try {
      const parsed = JSON.parse(product.featuresJson || "[]");
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((f: any) => isRtl ? (f.textAr || f.text) : (f.text || f.textAr));
      }
    } catch (e) {}
    return [
      t("prodFeature1"),
      t("prodFeature2"),
      t("prodFeature3"),
      t("prodFeature4"),
      t("prodFeature5"),
      t("prodFeature6"),
    ];
  })();

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}-${selectedSize}`,
      name: productName,
      price: finalPrice,
      image: selectedImage || product.image,
      size: selectedSize,
      quantity,
    });
    toast.success(`${t("prodToastAdded")} ${quantity}x ${productName} (${selectedSize}) ${t("prodToastToCart")}`);
  };

  return (
    <div className="min-h-screen bg-petroleum-blue/30 backdrop-blur-sm py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-teal-accent hover:text-white mb-8 group"
        >
          <ArrowLeft className={`w-4 h-4 ${isRtl ? "group-hover:translate-x-1" : "group-hover:-translate-x-1"} transition-transform`} />
          <span>{t("prodBackToProducts")}</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-petroleum-blue/30 backdrop-blur-sm shadow-2xl">
              <img
                src={selectedImage || product.image}
                alt={productName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {defaultImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    (selectedImage || product.image) === image
                      ? "border-olive-green shadow-md"
                      : "border-transparent hover:border-sage-green"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${productName} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="success" className="mb-3">
                <Leaf className="w-3 h-3 mr-1" />
                {t("prodCertifiedOrganic")}
              </Badge>
              <h1 className="font-display text-4xl lg:text-5xl text-white mb-4">
                {productName}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(product.rating)
                          ? "fill-gold-accent text-gold-accent"
                          : "text-white/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sage-green-light">
                  ({reviews.length} {t("prodReviews")})
                </span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="flex items-center gap-2">
                  {product.discount > 0 ? (
                    <>
                      <p className="text-4xl font-semibold text-teal-accent">
                        {formatPrice(finalPrice, language)}
                      </p>
                      <p className="text-lg text-white/60 line-through">
                        {formatPrice(currentPrice, language)}
                      </p>
                      <Badge variant="error">-{product.discount}%</Badge>
                    </>
                  ) : (
                    <p className="text-4xl font-semibold text-teal-accent">
                      {formatPrice(currentPrice, language)}
                    </p>
                  )}
                </div>
                {product.inStock ? (
                  <Badge variant="success">{t("inStock")}</Badge>
                ) : (
                  <Badge variant="warning">{t("outOfStock")}</Badge>
                )}
              </div>
            </div>

            <div className="h-px bg-border"></div>

            <div>
              <p className="text-white/90 leading-relaxed text-lg">
                {productDescription}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block mb-3 text-white">{t("prodSelectSize")}</label>
              <div className="grid grid-cols-4 gap-3">
                {sizes.map((sizeOption) => (
                  <button
                    key={sizeOption.size}
                    onClick={() => setSelectedSize(sizeOption.size)}
                    className={`py-3 rounded-lg border-2 transition-all ${
                      selectedSize === sizeOption.size
                        ? "border-olive-green bg-olive-green text-white"
                        : "border-teal-accent/30 hover:border-sage-green text-white"
                    }`}
                  >
                    <div className="text-sm font-semibold">{sizeOption.size}</div>
                    <div className="text-xs opacity-80">{formatPrice(sizeOption.price, language)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block mb-3 text-white">{t("quantity")}</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-lg bg-petroleum-blue/30 backdrop-blur-sm border border-teal-accent/30 hover:bg-dark-olive/50 transition-colors text-white text-xl"
                >
                  -
                </button>
                <span className="text-2xl w-12 text-center text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => product.stock > 0 ? Math.min(product.stock, prev + 1) : prev + 1)}
                  disabled={quantity >= product.stock}
                  className="w-12 h-12 rounded-lg bg-petroleum-blue/30 backdrop-blur-sm border border-teal-accent/30 hover:bg-dark-olive/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-white text-xl"
                >
                  +
                </button>
              </div>
              
              {/* Stock Indicator - Only shown when sold out */}
              {(!product.inStock || product.stock <= 0) && (
                <div className="mt-2 text-xs font-semibold flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-red-400">
                    {isRtl ? "انتهى من المخزن (سولد أوت)" : "Sold Out"}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={handleAddToCart} className="flex-1" size="lg" disabled={!product.inStock || product.stock <= 0}>
                <ShoppingCart className="w-5 h-5" />
                <span>{t("addToCart")}</span>
              </Button>
              <button 
                onClick={() => product && toggleFavorite(product)}
                className={`w-14 h-14 flex items-center justify-center backdrop-blur-sm rounded-full border-2 transition-all ${
                  favorited
                    ? "bg-destructive text-white border-destructive shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                    : "bg-petroleum-blue/30 border-teal-accent/30 hover:border-olive-green hover:bg-dark-olive/50 text-white"
                }`}
              >
                <Heart className={`w-5 h-5 ${favorited ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Benefits */}
            <div className="grid gap-3 text-white">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-dark-olive/50 rounded-xl"
                  >
                    <Icon className="w-5 h-5 text-sage-green flex-shrink-0" />
                    <span className="text-sm text-white/90">{benefit.text}</span>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-border"></div>

            {/* Features */}
            <div>
              <h3 className="font-display text-2xl text-white mb-4">
                {t("prodFeaturesTitle")}
              </h3>
              <ul className="grid gap-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-dark-olive/50 rounded-xl">
                    <Check className="w-5 h-5 text-sage-green mt-0.5 flex-shrink-0" />
                    <span className="text-white/90">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-20">
          <div className="flex items-center gap-4 border-b border-teal-accent/30 mb-8">
            {[
              { id: "description", label: t("prodTabDesc") },
              { id: "details", label: t("prodTabNutr") },
              { id: "reviews", label: t("prodTabReviews") },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-4 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-teal-accent"
                    : "text-sage-green-light hover:text-teal-accent"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-olive-green"></div>
                )}
              </button>
            ))}
          </div>

          <div className="bg-petroleum-blue/30 backdrop-blur-sm rounded-2xl p-8 border border-teal-accent/30">
            {activeTab === "description" && (
              <div className="prose prose-lg max-w-none text-white">
                <p className="text-white/90 leading-relaxed mb-4">
                  {productDescription}
                </p>
                <p className="text-white/90 leading-relaxed mb-4">
                  {t("prodDescParagraph2")}
                </p>
                <p className="text-white/90 leading-relaxed">
                  {t("prodDescParagraph3")}
                </p>
              </div>
            )}

            {activeTab === "details" && (
              <div>
                <h3 className="font-display text-xl text-white mb-6">
                  {t("prodNutrTitle")}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {nutritionalInfo.map((info, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-dark-olive/50 rounded-xl text-white"
                    >
                      <span className="text-white/90">{info.label}</span>
                      <span className="font-semibold text-teal-accent">{info.value}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-sage-green-light mt-6">
                  {dynamicFootnote}
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8 animate-fade-in">
                {/* Review Header / Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-petroleum-blue/10 rounded-2xl border border-teal-accent/10">
                  <div>
                    <h3 className="font-display text-2xl text-white mb-1">
                      {isRtl ? "تقييمات وآراء العملاء" : "Customer Reviews"}
                    </h3>
                    <p className="text-sage-green-light text-sm">
                      {isRtl 
                        ? `بناءً على ${reviews.length} من التقييمات` 
                        : `Based on ${reviews.length} user reviews`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${
                            i < Math.round(product.rating) 
                              ? "fill-gold-accent text-gold-accent" 
                              : "text-white/20"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-3xl font-display font-semibold text-white">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Write a Review Section */}
                <div className="p-6 bg-petroleum-blue/10 rounded-2xl border border-teal-accent/15 space-y-4">
                  <h4 className="font-display text-lg text-teal-accent font-semibold">
                    {isRtl ? "اكتب مراجعتك للمنتج" : "Write a Customer Review"}
                  </h4>
                  
                  {user ? (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {/* Rating Selector */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white/70">
                          {isRtl ? "تقييمك بالنجوم:" : "Your Rating:"}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((starValue) => (
                            <button
                              key={starValue}
                              type="button"
                              onClick={() => setNewRating(starValue)}
                              className="p-1 hover:scale-110 transition-transform focus:outline-none"
                            >
                              <Star
                                className={`w-6 h-6 transition-colors ${
                                  starValue <= newRating 
                                    ? "fill-gold-accent text-gold-accent" 
                                    : "text-white/30"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment Input */}
                      <div>
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={isRtl ? "اكتب رأيك وتجربتك بالتفصيل هنا..." : "Share your experience and thoughts about this product..."}
                          rows={3}
                          className="w-full px-4 py-3 bg-petroleum-blue/30 text-white placeholder:text-white/30 rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-2 focus:ring-teal-accent resize-none text-sm"
                          required
                        />
                      </div>

                      {/* Submit button */}
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={submittingReview}
                          className="px-6 py-2.5 bg-olive-green text-white hover:bg-dark-olive font-medium text-sm flex items-center gap-2 rounded-full border-none cursor-pointer"
                        >
                          {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                          <span>{isRtl ? "إرسال المراجعة" : "Submit Review"}</span>
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-4 bg-dark-olive/20 rounded-xl border border-dashed border-teal-accent/20">
                      <p className="text-sm text-sage-green-light mb-3">
                        {isRtl 
                          ? "يرجى تسجيل الدخول لتتمكن من كتابة مراجعة للمنتج." 
                          : "Please sign in to write a product review."}
                      </p>
                      <Link
                        to={`/login?redirect=products/${id}`}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-teal-accent hover:bg-teal-dark text-white rounded-full text-xs font-semibold transition-colors"
                      >
                        <span>{isRtl ? "تسجيل الدخول" : "Sign In"}</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {loadingReviews ? (
                    <div className="text-center py-10 bg-petroleum-blue/5 rounded-2xl border border-teal-accent/5">
                      <p className="text-sm text-sage-green-light italic animate-pulse">
                        {isRtl ? "جاري تحميل المراجعات..." : "Loading reviews..."}
                      </p>
                    </div>
                  ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="p-6 bg-dark-olive/30 rounded-2xl border border-teal-accent/5"
                      >
                        <div className="flex items-start justify-between mb-3 text-white">
                          <div>
                            <p className="font-semibold text-white/90">{review.userName}</p>
                            <p className="text-[11px] text-sage-green-light">
                              {new Date(review.createdAt).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating 
                                    ? "fill-gold-accent text-gold-accent" 
                                    : "text-white/10"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-petroleum-blue/5 rounded-2xl border border-teal-accent/5">
                      <p className="text-sm text-sage-green-light italic">
                        {isRtl 
                          ? "لا توجد مراجعات بعد. كن أول من يكتب مراجعة!" 
                          : "No reviews yet. Be the first to share your thoughts!"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

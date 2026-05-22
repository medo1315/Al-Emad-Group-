import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { Search, Plus, Trash2, Copy, Check, Calendar, Percent, Loader2, Ticket, X, Users } from "lucide-react";
import { API_BASE_URL } from "../../config";
import { toast } from "sonner";

interface Coupon {
  id: number;
  code: string;
  discountPercentage: number;
  expiryDate: string;
  maxUses: number;
  usesCount: number;
  isActive: boolean;
}

export function AdminCoupons() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Creation form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiry, setExpiry] = useState("");
  const [maxUses, setMaxUses] = useState("100");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Translations
  const t = {
    title: isRtl ? "إدارة الكوبونات والخصومات" : "Coupon Management",
    subtitle: isRtl ? "إنشاء وتحديد سقف الاستخدام لكوبونات الخصم للمتسوقين" : "Create, activate, and set usage limits for shopper coupons",
    createBtn: isRtl ? "إنشاء كوبون جديد" : "Create Coupon",
    searchPlaceholder: isRtl ? "البحث برمز الكوبون..." : "Search coupon code...",
    statusActive: isRtl ? "نشط" : "Active",
    statusExpired: isRtl ? "منتهي الصلاحية" : "Expired",
    codeLabel: isRtl ? "رمز الكوبون (مثال: SAVE20)" : "Coupon Code (e.g., SAVE20)",
    discountLabel: isRtl ? "نسبة الخصم (%)" : "Discount Percentage (%)",
    expiryLabel: isRtl ? "تاريخ الانتهاء" : "Expiry Date",
    maxUsesLabel: isRtl ? "الحد الأقصى للمستخدمين (مثال: 20 مستخدم)" : "Maximum Coupon Uses (e.g., 20 users)",
    modalTitle: isRtl ? "إنشاء كوبون جديد" : "Create New Coupon",
    cancel: isRtl ? "إلغاء" : "Cancel",
    submit: isRtl ? "حفظ الكوبون" : "Save Coupon",
    copied: isRtl ? "تم نسخ الرمز!" : "Copied code!",
    deleteConfirm: isRtl ? "هل أنت متأكد من حذف هذا الكوبون؟" : "Are you sure you want to delete this coupon?",
    fetchError: isRtl ? "فشل تحميل الكوبونات." : "Failed to load coupons.",
    createSuccess: isRtl ? "تم إنشاء الكوبون بنجاح." : "Coupon created successfully.",
    createError: isRtl ? "فشل إنشاء الكوبون." : "Failed to create coupon.",
    deleteSuccess: isRtl ? "تم حذف الكوبون بنجاح." : "Coupon deleted successfully.",
    deleteError: isRtl ? "فشل حذف الكوبون." : "Failed to delete coupon.",
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/coupons`, {
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch coupons");
      const data = await response.json();
      setCoupons(data);
    } catch (e) {
      toast.error(t.fetchError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchCoupons();
    }
  }, [user]);

  const handleCopyCode = (couponCode: string, id: number) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedId(id);
    toast.success(t.copied);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t.deleteConfirm)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });
      if (!response.ok) throw new Error("Failed to delete coupon");
      
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success(t.deleteSuccess);
    } catch (err) {
      toast.error(t.deleteError);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discount || !expiry || !maxUses) {
      toast.error(isRtl ? "يرجى ملء جميع الحقول المطلوبة." : "Please fill in all fields.");
      return;
    }

    const discountVal = parseInt(discount, 10);
    if (isNaN(discountVal) || discountVal < 1 || discountVal > 100) {
      toast.error(isRtl ? "يجب أن تكون النسبة بين 1 و 100." : "Percentage must be between 1 and 100.");
      return;
    }

    const maxUsesVal = parseInt(maxUses, 10);
    if (isNaN(maxUsesVal) || maxUsesVal < 1) {
      toast.error(isRtl ? "الحد الأقصى للمستخدمين يجب أن يكون 1 على الأقل." : "Max uses must be at least 1.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/coupons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          code: code.trim(),
          discountPercentage: discountVal,
          expiryDate: new Date(expiry).toISOString(),
          maxUses: maxUsesVal
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create coupon");
      }

      const created = await response.json();
      setCoupons(prev => [created, ...prev]);
      toast.success(t.createSuccess);
      setIsModalOpen(false);
      
      // Reset form
      setCode("");
      setDiscount("");
      setExpiry("");
      setMaxUses("100");
    } catch (err: any) {
      toast.error(err.message || t.createError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`p-6 lg:p-8 min-h-screen bg-petroleum-dark/40 ${isRtl ? "text-right" : "text-left"}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-white mb-2 flex items-center justify-start gap-3">
            <Ticket className="w-8 h-8 text-teal-accent" />
            <span>{t.title}</span>
          </h1>
          <p className="text-sage-green-light">{t.subtitle}</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-accent to-sage-green hover:from-teal-dark hover:to-teal-accent text-dark-olive hover:text-white rounded-xl transition-all shadow-lg font-bold self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" />
          <span>{t.createBtn}</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-teal-accent/80`} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isRtl ? "pr-12 pl-4 text-right" : "pl-12 pr-4"} py-3 bg-petroleum-blue/30 text-white rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-teal-accent`}
          />
        </div>
      </div>

      {/* Coupons grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-white">
          <Loader2 className="w-12 h-12 animate-spin text-teal-accent" />
          <p className="text-sage-green-light">{isRtl ? "جاري تحميل الكوبونات..." : "Loading coupons list..."}</p>
        </div>
      ) : filteredCoupons.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoupons.map((coupon) => {
            const expired = isExpired(coupon.expiryDate);
            const isFull = coupon.usesCount >= coupon.maxUses;
            const usagePercentage = Math.min((coupon.usesCount / coupon.maxUses) * 100, 100);

            return (
              <div
                key={coupon.id}
                className="bg-petroleum-blue/20 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20 hover:border-teal-accent/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <code className="px-4 py-2 bg-gradient-to-r from-teal-accent/20 to-teal-accent/5 border border-teal-accent/30 text-teal-accent rounded-lg text-lg font-mono font-bold">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => handleCopyCode(coupon.code, coupon.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-all"
                        title={isRtl ? "نسخ الرمز" : "Copy Code"}
                      >
                        {copiedId === coupon.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-white/60" />
                        )}
                      </button>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      expired || isFull
                        ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    }`}>
                      {expired ? t.statusExpired : (isFull ? (isRtl ? "مكتمل الاستخدام" : "Max Reached") : t.statusActive)}
                    </span>
                  </div>

                  <div className="p-4 bg-petroleum-dark/40 rounded-xl border border-teal-accent/10 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className="w-5 h-5 text-teal-accent" />
                      <span className="text-white text-sm font-semibold">{isRtl ? "خصم بمقدار" : "Discount value"}</span>
                    </div>
                    <span className="text-2xl font-bold text-teal-accent font-sans">{coupon.discountPercentage}%</span>
                  </div>

                  {/* Usage progress bar */}
                  <div className="mb-4 p-4 bg-petroleum-dark/30 rounded-xl border border-teal-accent/10">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-sage-green-light flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{isRtl ? "مرات الاستخدام" : "Coupon Usage"}</span>
                      </span>
                      <span className="text-white font-bold font-sans">
                        {coupon.usesCount} / {coupon.maxUses}
                      </span>
                    </div>
                    <div className="w-full bg-petroleum-dark rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isFull
                            ? "bg-red-500"
                            : usagePercentage > 75
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                        style={{ width: `${usagePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs text-sage-green-light mb-4">
                    <Calendar className="w-4 h-4 text-teal-accent" />
                    <span>
                      {isRtl ? "تاريخ الصلاحية:" : "Expires:"}{" "}
                      {new Date(coupon.expiryDate).toLocaleDateString(isRtl ? 'ar' : 'en', {
                        dateStyle: 'medium'
                      })}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(coupon.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-400 hover:text-white rounded-xl transition-all font-medium text-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{isRtl ? "حذف الكوبون" : "Delete Coupon"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-petroleum-blue/10 rounded-2xl border border-teal-accent/20">
          <p className="text-sage-green-light italic">{isRtl ? "لا توجد نتائج مطابقة للبحث." : "No coupons found."}</p>
        </div>
      )}

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className={`bg-petroleum-dark border border-teal-accent/30 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative ${isRtl ? "text-right" : "text-left"}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
            
            <button
              onClick={() => setIsModalOpen(false)}
              className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all`}
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="font-display text-2xl text-white font-bold mb-6 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-teal-accent" />
              <span>{t.modalTitle}</span>
            </h2>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-sm text-sage-green-light mb-2">{t.codeLabel}</label>
                <input
                  type="text"
                  required
                  placeholder="SAVE20"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className={`w-full px-4 py-3 bg-petroleum-blue/30 text-white rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-teal-accent font-mono font-bold ${isRtl ? "text-right" : "text-left"}`}
                />
              </div>

              <div>
                <label className="block text-sm text-sage-green-light mb-2">{t.discountLabel}</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  placeholder="20"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className={`w-full px-4 py-3 bg-petroleum-blue/30 text-white rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-teal-accent font-sans font-bold ${isRtl ? "text-right" : "text-left"}`}
                />
              </div>

              <div>
                <label className="block text-sm text-sage-green-light mb-2">{t.maxUsesLabel}</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="20"
                  value={maxUses}
                  onChange={(e) => setMaxUses(e.target.value)}
                  className={`w-full px-4 py-3 bg-petroleum-blue/30 text-white rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-teal-accent font-sans font-bold ${isRtl ? "text-right" : "text-left"}`}
                />
              </div>

              <div>
                <label className="block text-sm text-sage-green-light mb-2">{t.expiryLabel}</label>
                <input
                  type="date"
                  required
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className={`w-full px-4 py-3 bg-petroleum-blue/30 text-white rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-teal-accent font-sans ${isRtl ? "text-right" : "text-left"}`}
                />
              </div>

              <div className="flex gap-4 mt-6 pt-4 border-t border-teal-accent/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all text-sm font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-accent to-sage-green text-dark-olive font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{t.submit}</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}

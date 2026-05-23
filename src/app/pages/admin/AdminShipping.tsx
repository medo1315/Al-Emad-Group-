import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { Search, Edit2, Save, X, Loader2, Truck, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../../config";
import { toast } from "sonner";
import { formatPrice } from "../../utils/currency";

interface Governorate {
  id: number;
  name: string;
  nameAr: string;
  shippingCost: number;
  estimatedDelivery?: string;
  estimatedDeliveryAr?: string;
}

export function AdminShipping() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Editing states
  const [editCost, setEditCost] = useState("");
  const [editDelivery, setEditDelivery] = useState("");
  const [editDeliveryAr, setEditDeliveryAr] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Translations
  const t = {
    title: isRtl ? "إدارة أسعار الشحن" : "Shipping & Delivery Rates",
    subtitle: isRtl ? "تعديل أسعار التوصيل ومواعيد الشحن لمختلف محافظات مصر" : "Manage delivery rates and expected delivery times for Egypt governorates",
    searchPlaceholder: isRtl ? "البحث باسم المحافظة..." : "Search governorate name...",
    govName: isRtl ? "المحافظة" : "Governorate",
    shippingCost: isRtl ? "سعر التوصيل" : "Delivery Rate",
    estimatedDeliveryHeader: isRtl ? "وقت التوصيل المتوقع" : "Estimated Delivery Time",
    actions: isRtl ? "الإجراءات" : "Actions",
    edit: isRtl ? "تعديل" : "Edit",
    save: isRtl ? "حفظ" : "Save",
    cancel: isRtl ? "إلغاء" : "Cancel",
    saveSuccess: isRtl ? "تم تحديث سعر ووقت الشحن بنجاح." : "Shipping rate and delivery time updated successfully.",
    saveError: isRtl ? "فشل تحديث بيانات الشحن." : "Failed to update shipping information.",
    fetchError: isRtl ? "فشل تحميل قائمة المحافظات." : "Failed to load governorates list.",
  };

  const fetchGovernorates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/governorates`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setGovernorates(data);
    } catch (e) {
      console.error("Error fetching governorates, loading defaults:", e);
      // Load fallback list if backend fails to connect
      setGovernorates([
        { id: 1, name: "Cairo", nameAr: "القاهرة", shippingCost: 50.00, estimatedDelivery: "1-2 business days", estimatedDeliveryAr: "1-2 أيام عمل" },
        { id: 2, name: "Giza", nameAr: "الجيزة", shippingCost: 50.00, estimatedDelivery: "1-2 business days", estimatedDeliveryAr: "1-2 أيام عمل" },
        { id: 3, name: "Alexandria", nameAr: "الإسكندرية", shippingCost: 60.00, estimatedDelivery: "2-3 business days", estimatedDeliveryAr: "2-3 أيام عمل" },
        { id: 4, name: "Qalyubia", nameAr: "القليوبية", shippingCost: 65.00, estimatedDelivery: "2-3 business days", estimatedDeliveryAr: "2-3 أيام عمل" },
        { id: 5, name: "Sharqia", nameAr: "الشرقية", shippingCost: 65.00, estimatedDelivery: "2-3 business days", estimatedDeliveryAr: "2-3 أيام عمل" },
        { id: 6, name: "Monufia", nameAr: "المنوفية", shippingCost: 65.00, estimatedDelivery: "2-3 business days", estimatedDeliveryAr: "2-3 أيام عمل" },
        { id: 7, name: "Gharbia", nameAr: "الغربية", shippingCost: 65.00, estimatedDelivery: "2-3 business days", estimatedDeliveryAr: "2-3 أيام عمل" },
        { id: 8, name: "Dakahlia", nameAr: "الدقهلية", shippingCost: 65.00, estimatedDelivery: "2-3 business days", estimatedDeliveryAr: "2-3 أيام عمل" },
        { id: 9, name: "Beheira", nameAr: "البحيرة", shippingCost: 65.00, estimatedDelivery: "2-3 business days", estimatedDeliveryAr: "2-3 أيام عمل" },
        { id: 10, name: "Damietta", nameAr: "دمياط", shippingCost: 70.00, estimatedDelivery: "2-4 business days", estimatedDeliveryAr: "2-4 أيام عمل" },
        { id: 11, name: "Port Said", nameAr: "بورسعيد", shippingCost: 70.00, estimatedDelivery: "2-4 business days", estimatedDeliveryAr: "2-4 أيام عمل" },
        { id: 12, name: "Ismailia", nameAr: "الإسماعيلية", shippingCost: 70.00, estimatedDelivery: "2-4 business days", estimatedDeliveryAr: "2-4 أيام عمل" },
        { id: 13, name: "Suez", nameAr: "السويس", shippingCost: 70.00, estimatedDelivery: "2-4 business days", estimatedDeliveryAr: "2-4 أيام عمل" },
        { id: 14, name: "Kafr El Sheikh", nameAr: "كفر الشيخ", shippingCost: 70.00, estimatedDelivery: "2-4 business days", estimatedDeliveryAr: "2-4 أيام عمل" },
        { id: 15, name: "Fayoum", nameAr: "الفيوم", shippingCost: 75.00, estimatedDelivery: "2-4 business days", estimatedDeliveryAr: "2-4 أيام عمل" },
        { id: 16, name: "Beni Suef", nameAr: "بني سويف", shippingCost: 75.00, estimatedDelivery: "2-4 business days", estimatedDeliveryAr: "2-4 أيام عمل" },
        { id: 17, name: "Minya", nameAr: "المنيا", shippingCost: 80.00, estimatedDelivery: "3-5 business days", estimatedDeliveryAr: "3-5 أيام عمل" },
        { id: 18, name: "Assiut", nameAr: "أسيوط", shippingCost: 80.00, estimatedDelivery: "3-5 business days", estimatedDeliveryAr: "3-5 أيام عمل" },
        { id: 19, name: "Sohag", nameAr: "سوهاج", shippingCost: 85.00, estimatedDelivery: "3-5 business days", estimatedDeliveryAr: "3-5 أيام عمل" },
        { id: 20, name: "Qena", nameAr: "قنا", shippingCost: 85.00, estimatedDelivery: "3-5 business days", estimatedDeliveryAr: "3-5 أيام عمل" },
        { id: 21, name: "Luxor", nameAr: "الأقصر", shippingCost: 90.00, estimatedDelivery: "3-5 business days", estimatedDeliveryAr: "3-5 أيام عمل" },
        { id: 22, name: "Aswan", nameAr: "أسوان", shippingCost: 95.00, estimatedDelivery: "3-5 business days", estimatedDeliveryAr: "3-5 أيام عمل" },
        { id: 23, name: "Red Sea", nameAr: "البحر الأحمر", shippingCost: 100.00, estimatedDelivery: "4-7 business days", estimatedDeliveryAr: "4-7 أيام عمل" },
        { id: 24, name: "Matrouh", nameAr: "مطروح", shippingCost: 100.00, estimatedDelivery: "4-7 business days", estimatedDeliveryAr: "4-7 أيام عمل" },
        { id: 25, name: "New Valley", nameAr: "الوادي الجديد", shippingCost: 120.00, estimatedDelivery: "4-7 business days", estimatedDeliveryAr: "4-7 أيام عمل" },
        { id: 26, name: "North Sinai", nameAr: "شمال سيناء", shippingCost: 120.00, estimatedDelivery: "4-7 business days", estimatedDeliveryAr: "4-7 أيام عمل" },
        { id: 27, name: "South Sinai", nameAr: "جنوب سيناء", shippingCost: 120.00, estimatedDelivery: "4-7 business days", estimatedDeliveryAr: "4-7 أيام عمل" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGovernorates();
  }, []);

  const startEditing = (gov: Governorate) => {
    setEditingId(gov.id);
    setEditCost(gov.shippingCost.toString());
    setEditDelivery(gov.estimatedDelivery || "2-4 business days");
    setEditDeliveryAr(gov.estimatedDeliveryAr || "2-4 أيام عمل");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditCost("");
    setEditDelivery("");
    setEditDeliveryAr("");
  };

  const saveCost = async (id: number) => {
    const cost = parseFloat(editCost);
    if (isNaN(cost) || cost < 0) {
      toast.error(isRtl ? "يرجى إدخال قيمة صحيحة." : "Please enter a valid price.");
      return;
    }

    if (!editDelivery.trim() || !editDeliveryAr.trim()) {
      toast.error(isRtl ? "يرجى إدخال موعد الشحن المتوقع." : "Please enter the expected delivery time.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/governorates/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify({ 
          shippingCost: cost,
          estimatedDelivery: editDelivery,
          estimatedDeliveryAr: editDeliveryAr
        })
      });

      if (!response.ok) throw new Error("Update failed");

      // Update locally
      setGovernorates(prev =>
        prev.map(g => (g.id === id ? { 
          ...g, 
          shippingCost: cost, 
          estimatedDelivery: editDelivery, 
          estimatedDeliveryAr: editDeliveryAr 
        } : g))
      );
      toast.success(t.saveSuccess);
      setEditingId(null);
    } catch (e) {
      toast.error(t.saveError);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredGovernorates = governorates.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.nameAr.includes(searchQuery)
  );

  return (
    <div className={`p-6 lg:p-8 min-h-screen bg-petroleum-dark/40 ${isRtl ? "text-right" : "text-left"}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Title */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="font-display text-4xl text-white mb-2 flex items-center justify-start gap-3">
            <Truck className="w-8 h-8 text-teal-accent" />
            <span>{t.title}</span>
          </h1>
          <p className="text-sage-green-light">{t.subtitle}</p>
        </div>
        <button
          onClick={fetchGovernorates}
          className="p-3 bg-white/5 hover:bg-white/10 text-teal-accent hover:text-white rounded-xl transition-all border border-teal-accent/20"
          title={isRtl ? "تحديث" : "Refresh"}
        >
          <RefreshCw className="w-5 h-5" />
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

      {/* Governorates Table / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-white">
          <Loader2 className="w-12 h-12 animate-spin text-teal-accent" />
          <p className="text-sage-green-light">{isRtl ? "جاري تحميل البيانات..." : "Loading delivery rates..."}</p>
        </div>
      ) : filteredGovernorates.length > 0 ? (
        <div className="bg-petroleum-blue/15 border border-teal-accent/20 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
              <thead>
                <tr className="bg-dark-olive/40 border-b border-teal-accent/20 text-white font-display text-sm font-semibold">
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.govName}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.shippingCost}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.estimatedDeliveryHeader}</th>
                  <th className="px-6 py-4 text-center">{t.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-accent/10 text-white">
                {filteredGovernorates.map((gov) => {
                  const isEditing = editingId === gov.id;
                  return (
                    <tr key={gov.id} className="hover:bg-teal-accent/5 transition-colors">
                      {/* Name */}
                      <td className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"} font-medium`}>
                        <div className="flex flex-col">
                          <span className="text-lg">{isRtl ? gov.nameAr : gov.name}</span>
                          <span className="text-xs text-sage-green-light/70">{isRtl ? gov.name : gov.nameAr}</span>
                        </div>
                      </td>
                      
                      {/* Cost */}
                      <td className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>
                        {isEditing ? (
                          <div className="flex items-center gap-2 max-w-[150px]">
                            <input
                              type="number"
                              value={editCost}
                              onChange={(e) => setEditCost(e.target.value)}
                              className="w-full px-3 py-1.5 bg-petroleum-dark text-white rounded-lg border border-teal-accent/40 focus:outline-none focus:border-teal-accent font-bold"
                              min="0"
                              autoFocus
                            />
                            <span className="text-sm font-bold text-teal-accent">EGP</span>
                          </div>
                        ) : (
                          <span className="font-bold text-teal-accent text-lg">
                            {formatPrice(gov.shippingCost, language)}
                          </span>
                        )}
                      </td>

                      {/* Delivery Time */}
                      <td className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>
                        {isEditing ? (
                          <div className="flex flex-col gap-2 max-w-[220px]">
                            <input
                              type="text"
                              value={editDelivery}
                              onChange={(e) => setEditDelivery(e.target.value)}
                              placeholder="EN: 2-3 business days"
                              className="w-full px-3 py-1.5 bg-petroleum-dark text-white rounded-lg border border-teal-accent/40 focus:outline-none focus:border-teal-accent text-sm"
                            />
                            <input
                              type="text"
                              value={editDeliveryAr}
                              onChange={(e) => setEditDeliveryAr(e.target.value)}
                              placeholder="AR: ٢-٣ أيام عمل"
                              className="w-full px-3 py-1.5 bg-petroleum-dark text-white rounded-lg border border-teal-accent/40 focus:outline-none focus:border-teal-accent text-sm text-right"
                            />
                          </div>
                        ) : (
                          <span className="text-sage-green-light">
                            {isRtl ? (gov.estimatedDeliveryAr || "2-4 أيام عمل") : (gov.estimatedDelivery || "2-4 business days")}
                          </span>
                        )}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => saveCost(gov.id)}
                              disabled={isSaving}
                              className="p-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-lg transition-all"
                              title={t.save}
                            >
                              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-lg transition-all"
                              title={t.cancel}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(gov)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-accent/15 hover:bg-teal-accent hover:text-dark-olive text-teal-accent border border-teal-accent/30 rounded-xl transition-all text-xs font-semibold"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>{t.edit}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-petroleum-blue/10 rounded-2xl border border-teal-accent/20">
          <p className="text-sage-green-light italic">{isRtl ? "لا توجد نتائج مطابقة لبحثك." : "No matching governorates found."}</p>
        </div>
      )}
    </div>
  );
}

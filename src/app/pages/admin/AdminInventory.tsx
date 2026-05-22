import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { Search, AlertTriangle, Package, TrendingDown, TrendingUp, Edit2, Check, X, Loader2, RefreshCw } from "lucide-react";
import { API_BASE_URL } from "../../config";
import { toast } from "sonner";

interface Product {
  id: number;
  name: string;
  nameAr: string;
  category: string;
  categoryAr: string;
  stock: number;
  inStock: boolean;
  price: number;
  image: string;
}

export function AdminInventory() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Inline editing states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Translations
  const t = {
    title: isRtl ? "إدارة المخازن والمخزون" : "Inventory Control",
    subtitle: isRtl ? "مراقبة كميات المنتجات وتعديل كميات المخازن فورياً" : "Monitor product quantities and adjust stock levels instantly",
    searchPlaceholder: isRtl ? "البحث باسم المنتج أو التصنيف..." : "Search by product name or category...",
    thProduct: isRtl ? "المنتج" : "Product",
    thCategory: isRtl ? "التصنيف" : "Category",
    thPrice: isRtl ? "السعر" : "Price",
    thStock: isRtl ? "الكمية بالمخزن" : "Current Stock",
    thStatus: isRtl ? "الحالة" : "Status",
    thActions: isRtl ? "العمليات" : "Actions",
    thStockLevel: isRtl ? "مؤشر المخزون" : "Stock Level",
    statusGood: isRtl ? "متوفر" : "Good",
    statusLow: isRtl ? "مخزون منخفض" : "Low Stock",
    statusOut: isRtl ? "انتهى من المخزن" : "Sold Out",
    alertTitle: isRtl ? "تحذير: منتجات توشك على النفاد!" : "Warning: Items near depletion!",
    alertDesc: (count: number) => isRtl 
      ? `هناك ${count} منتجات متبقي منها أقل من 5 قطع. يرجى تزويد المخازن قريباً.`
      : `There are ${count} items with less than 5 units left. Please restock soon.`,
    noResults: isRtl ? "لا توجد منتجات مطابقة للبحث." : "No products found matching the search.",
    saveSuccess: isRtl ? "تم تحديث كمية المخزون بنجاح." : "Stock quantity updated successfully.",
    saveError: isRtl ? "فشل تحديث المخزون." : "Failed to update stock quantity.",
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (e) {
      toast.error(isRtl ? "فشل تحميل قائمة المنتجات." : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdateStock = async (id: number) => {
    const parsedStock = parseInt(editValue, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      toast.error(isRtl ? "يرجى إدخال قيمة صحيحة وموجبة." : "Please enter a valid positive number.");
      return;
    }

    setUpdatingId(id);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify({ stock: parsedStock })
      });

      if (!response.ok) throw new Error("Failed to update stock");
      
      const updatedProduct = await response.json();
      
      // Update local state
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast.success(t.saveSuccess);
      setEditingId(null);
    } catch (err) {
      toast.error(t.saveError);
    } finally {
      setUpdatingId(null);
    }
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setEditValue(product.stock.toString());
  };

  const getStatusType = (stock: number) => {
    if (stock === 0) return "out";
    if (stock <= 5) return "low";
    return "good";
  };

  const getStatusColor = (stock: number) => {
    const status = getStatusType(stock);
    switch (status) {
      case "good":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "low":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "out":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-white/10 text-white/70";
    }
  };

  const getStatusText = (stock: number) => {
    const status = getStatusType(stock);
    if (status === "good") return t.statusGood;
    if (status === "low") return t.statusLow;
    return t.statusOut;
  };

  const filteredProducts = products.filter(item => {
    const name = (isRtl ? item.nameAr : item.name).toLowerCase();
    const cat = (isRtl ? item.categoryAr : item.category).toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || cat.includes(query);
  });

  const lowStockCount = products.filter(p => p.stock <= 5).length;
  const maxStockBaseline = 100; // Baseline for visual stock level progress bar

  return (
    <div className={`p-6 lg:p-8 min-h-screen bg-petroleum-dark/40 ${isRtl ? "text-right" : "text-left"}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Title */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-white mb-2 flex items-center justify-start gap-3">
            <Package className="w-8 h-8 text-teal-accent" />
            <span>{t.title}</span>
          </h1>
          <p className="text-sage-green-light">{t.subtitle}</p>
        </div>
        
        <button
          onClick={fetchProducts}
          className="self-start sm:self-auto px-5 py-2.5 bg-petroleum-blue/40 hover:bg-teal-accent border border-teal-accent/30 text-white rounded-xl transition-all text-xs font-semibold flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{isRtl ? "تحديث القائمة" : "Refresh Table"}</span>
        </button>
      </div>

      {/* Alert Banner */}
      {lowStockCount > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-bold text-sm">
              {t.alertTitle}
            </p>
            <p className="text-xs text-sage-green-light mt-1">
              {t.alertDesc(lowStockCount)}
            </p>
          </div>
        </div>
      )}

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

      {/* Inventory Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-white">
          <Loader2 className="w-12 h-12 animate-spin text-teal-accent" />
          <p className="text-sage-green-light">{isRtl ? "جاري تحميل المخازن..." : "Loading inventory datasets..."}</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="bg-petroleum-blue/10 backdrop-blur-md rounded-3xl border border-teal-accent/20 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-petroleum-dark/60 text-teal-accent font-semibold border-b border-teal-accent/20">
                <tr>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.thProduct}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.thCategory}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.thPrice}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.thStock}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.thStatus}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.thStockLevel}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.thActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-accent/15 text-white">
                {filteredProducts.map((item) => {
                  const stockPercentage = Math.min((item.stock / maxStockBaseline) * 100, 100);
                  const isEditing = editingId === item.id;
                  const prodName = isRtl ? item.nameAr : item.name;
                  const prodCat = isRtl ? item.categoryAr : item.category;

                  return (
                    <tr key={item.id} className="hover:bg-petroleum-blue/20 transition-colors duration-200">
                      {/* Product Name & Image */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={prodName}
                            className="w-10 h-10 rounded-lg object-cover border border-teal-accent/20"
                          />
                          <span className="font-bold text-white max-w-[200px] truncate">{prodName}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4 text-white/80">{prodCat}</td>

                      {/* Price */}
                      <td className="px-6 py-4 text-white font-semibold font-sans">${item.price.toFixed(2)}</td>

                      {/* Stock Quantity (Inline editable) */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 px-2 py-1 bg-petroleum-dark border border-teal-accent text-white rounded text-center font-bold focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base font-sans">{item.stock}</span>
                            {item.stock > 5 ? (
                              <TrendingUp className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.stock)}`}>
                          {getStatusText(item.stock)}
                        </span>
                      </td>

                      {/* Progress Bar */}
                      <td className="px-6 py-4">
                        <div className="w-28 sm:w-36">
                          <div className="w-full bg-petroleum-dark rounded-full h-1.5 border border-white/5">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                item.stock > 10
                                  ? "bg-emerald-400"
                                  : item.stock > 0
                                  ? "bg-amber-400"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${stockPercentage}%` }}
                            ></div>
                          </div>
                          <p className="text-[10px] text-sage-green-light mt-1 font-mono font-bold">
                            {item.stock} {isRtl ? "قطع متوفرة" : "units"}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              disabled={updatingId === item.id}
                              onClick={() => handleUpdateStock(item.id)}
                              className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/30 transition-all disabled:opacity-50"
                            >
                              {updatingId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg border border-red-500/30 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditing(item)}
                            className="p-2 bg-petroleum-blue/40 hover:bg-teal-accent text-white rounded-lg transition-all flex items-center gap-1 text-xs font-semibold border border-teal-accent/20"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>{isRtl ? "تعديل الكمية" : "Update Stock"}</span>
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
        <div className="text-center py-20 bg-petroleum-blue/10 rounded-3xl border border-teal-accent/20">
          <p className="text-sage-green-light italic">{t.noResults}</p>
        </div>
      )}

    </div>
  );
}

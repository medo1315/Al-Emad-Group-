import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router";
import { formatPrice } from "../utils/currency";
import { Package, Calendar, DollarSign, Eye, X, Loader2, AlertCircle, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../config";
import { Button } from "../components/ui/button";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productNameAr: string;
  productImage: string;
  quantity: number;
  price: number;
  size: string;
}

interface Order {
  id: number;
  userId: string;
  userFullName: string;
  orderDate: string;
  status: string; // Pending, Processing, Shipped, Delivered, Cancelled
  totalAmount: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  orderItems: OrderItem[];
}

export function MyOrdersPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isRtl = language === "ar";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Translations
  const t = {
    title: isRtl ? "طلباتي" : "My Orders",
    subtitle: isRtl ? "تابع حالة طلباتك الحالية وتصفح سجل مشترياتك" : "Track status of your current orders and view shopping history",
    noOrders: isRtl ? "لم تقم بإنشاء أي طلبات بعد." : "You haven't placed any orders yet.",
    browseProducts: isRtl ? "تصفح المنتجات الآن" : "Browse Products Now",
    orderId: isRtl ? "رقم الطلب" : "Order ID",
    date: isRtl ? "التاريخ" : "Date",
    total: isRtl ? "الإجمالي" : "Total",
    status: isRtl ? "الحالة" : "Status",
    actions: isRtl ? "العمليات" : "Actions",
    viewDetails: isRtl ? "عرض التفاصيل" : "View Details",
    cancelOrder: isRtl ? "إلغاء الطلب" : "Cancel Order",
    cancelConfirm: isRtl ? "هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟ سيتم إرجاع المنتجات إلى المخزن." : "Are you sure you want to cancel this order? Products will be returned to stock.",
    cancelSuccess: isRtl ? "تم إلغاء الطلب بنجاح." : "Order cancelled successfully.",
    cancelFail: isRtl ? "فشل إلغاء الطلب." : "Failed to cancel the order.",
    close: isRtl ? "إغلاق" : "Close",
    orderDetails: isRtl ? "تفاصيل الطلب" : "Order Details",
    shippingAddress: isRtl ? "عنوان الشحن" : "Shipping Address",
    paymentMethod: isRtl ? "طريقة الدفع" : "Payment Method",
    cod: isRtl ? "الدفع عند الاستلام" : "Cash on Delivery",
    itemsOrdered: isRtl ? "المنتجات المطلوبة" : "Items Ordered",
    qty: isRtl ? "الكمية" : "Qty",
    size: isRtl ? "الحجم" : "Size",
    price: isRtl ? "السعر" : "Price",
    loginRequired: isRtl ? "يجب تسجيل الدخول أولاً لعرض طلباتك." : "You must log in first to view your orders.",
    loginBtn: isRtl ? "تسجيل الدخول" : "Log In",
    orderCancelled: isRtl ? "ملغي" : "Cancelled",
  };

  const fetchMyOrders = async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          "Authorization": `Bearer ${user.token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (e) {
      toast.error(isRtl ? "فشل تحميل قائمة الطلبات." : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchMyOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm(t.cancelConfirm)) return;

    setCancellingId(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to cancel order");
      }

      toast.success(t.cancelSuccess);

      // Update locally
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "Cancelled" } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: "Cancelled" } : null);
      }
    } catch (e: any) {
      toast.error(e.message || t.cancelFail);
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "Processing":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "Shipped":
        return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "Delivered":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "Cancelled":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-white/10 text-white/70";
    }
  };

  const getStatusText = (status: string) => {
    if (!isRtl) return status;
    switch (status) {
      case "Pending": return "قيد الانتظار";
      case "Processing": return "قيد المعالجة";
      case "Shipped": return "تم الشحن";
      case "Delivered": return "تم التوصيل";
      case "Cancelled": return "ملغي";
      default: return status;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-petroleum-blue/30 backdrop-blur-sm flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4 bg-petroleum-dark/40 p-8 rounded-3xl border border-teal-accent/20">
          <AlertCircle className="w-16 h-16 text-teal-accent mx-auto mb-4" />
          <h2 className="font-display text-2xl text-white mb-4">{t.loginRequired}</h2>
          <Button onClick={() => navigate("/login?redirect=/my-orders")} className="w-full">
            {t.loginBtn}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-petroleum-blue/30 backdrop-blur-sm py-12 ${isRtl ? "text-right" : "text-left"}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl lg:text-5xl text-white mb-2 flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-teal-accent" />
              <span>{t.title}</span>
            </h1>
            <p className="text-sage-green-light">{t.subtitle}</p>
          </div>
          
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-olive-green hover:bg-dark-olive text-white rounded-full transition-all text-sm font-medium self-start md:self-auto"
          >
            {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            <span>{t.browseProducts}</span>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-white">
            <Loader2 className="w-12 h-12 animate-spin text-teal-accent" />
            <p className="text-sage-green-light">{isRtl ? "جاري تحميل طلباتك..." : "Loading your orders..."}</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="bg-petroleum-blue/10 rounded-3xl border border-teal-accent/20 overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-petroleum-dark/60 text-teal-accent font-semibold border-b border-teal-accent/20">
                  <tr>
                    <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.orderId}</th>
                    <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.date}</th>
                    <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.total}</th>
                    <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.status}</th>
                    <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-accent/15 text-white">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-petroleum-blue/20 transition-colors duration-200">
                      <td className="px-6 py-4 font-mono font-bold text-teal-accent">#{order.id}</td>
                      <td className="px-6 py-4 text-white/80">
                        {new Date(order.orderDate).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 font-bold text-teal-accent">{formatPrice(order.totalAmount, language)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsModalOpen(true);
                            }}
                            className="px-4 py-2 bg-petroleum-blue/40 hover:bg-teal-accent text-white rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            <span>{t.viewDetails}</span>
                          </button>
                          
                          {order.status === "Pending" && (
                            <button
                              disabled={cancellingId === order.id}
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium disabled:opacity-50"
                            >
                              {cancellingId === order.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <span>{t.cancelOrder}</span>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-petroleum-blue/10 rounded-3xl border border-teal-accent/20">
            <Package className="w-16 h-16 text-sage-green-light mx-auto mb-4" />
            <p className="text-white/80 text-lg mb-6">{t.noOrders}</p>
            <Button onClick={() => navigate("/products")}>{t.browseProducts}</Button>
          </div>
        )}

        {/* Order Details Modal */}
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
            <div className={`bg-petroleum-dark border border-teal-accent/30 rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto ${isRtl ? "text-right" : "text-left"}`}>
              
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedOrder(null);
                }}
                className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all`}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-accent/20 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-teal-accent font-bold">{t.orderDetails}</span>
                  <h2 className="font-display text-2xl sm:text-3xl text-white font-bold mt-1">#{selectedOrder.id}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-sage-green-light">{t.status}:</span>
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Ordered Items */}
                <div className="md:col-span-2 space-y-6">
                  <h3 className="text-lg font-display text-white font-semibold flex items-center gap-2 border-b border-teal-accent/10 pb-2">
                    <Package className="w-5 h-5 text-teal-accent" />
                    <span>{t.itemsOrdered}</span>
                  </h3>

                  <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2">
                    {selectedOrder.orderItems.map((item) => {
                      const itemName = isRtl ? (item.productNameAr || item.productName) : item.productName;
                      return (
                        <div key={item.id} className="flex gap-4 p-3 bg-petroleum-blue/15 rounded-2xl border border-teal-accent/10 hover:border-teal-accent/20 transition-all duration-200">
                          <img
                            src={item.productImage || "https://images.unsplash.com/photo-1759749597601-e90685f026b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"}
                            alt={itemName}
                            className="w-16 h-16 rounded-xl object-cover border border-teal-accent/10 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-base truncate">{itemName}</h4>
                            <p className="text-xs text-sage-green-light mt-1">
                              {item.size ? `${t.size}: ${item.size} • ` : ""}
                              {t.qty}: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right flex flex-col justify-center min-w-[70px]">
                            <span className="text-teal-accent font-bold text-sm">{formatPrice(item.price, language)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping & Payment Summary */}
                <div className="space-y-6">
                  <div className="bg-petroleum-blue/20 p-5 rounded-2xl border border-teal-accent/15 space-y-5">
                    
                    {/* Summary */}
                    <div>
                      <h4 className="text-xs uppercase text-teal-accent font-bold mb-2 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        <span>{t.total}</span>
                      </h4>
                      <div className="flex items-center justify-between text-white border-b border-teal-accent/10 pb-2 mb-2">
                        <span className="text-sm">{t.total}</span>
                        <span className="font-bold text-lg text-teal-accent">{formatPrice(selectedOrder.totalAmount, language)}</span>
                      </div>
                      <div className="flex items-center justify-between text-white/70 text-xs">
                        <span>{t.paymentMethod}</span>
                        <span className="font-semibold">{t.cod}</span>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="space-y-3 pt-2 border-t border-teal-accent/10">
                      <h4 className="text-xs uppercase text-teal-accent font-bold flex items-center gap-1.5 pb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{t.shippingAddress}</span>
                      </h4>
                      
                      <div className="space-y-1.5 text-xs text-white/90">
                        <div className="font-bold text-white">{selectedOrder.firstName} {selectedOrder.lastName}</div>
                        <div>{selectedOrder.phone}</div>
                        <div>{selectedOrder.address}</div>
                        <div className="text-sage-green-light">
                          {selectedOrder.city}, {selectedOrder.state} {selectedOrder.zipCode}
                        </div>
                      </div>
                    </div>

                    {/* Cancel Button in Modal */}
                    {selectedOrder.status === "Pending" && (
                      <button
                        disabled={cancellingId === selectedOrder.id}
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        className="w-full mt-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {cancellingId === selectedOrder.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <span>{t.cancelOrder}</span>
                        )}
                      </button>
                    )}

                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

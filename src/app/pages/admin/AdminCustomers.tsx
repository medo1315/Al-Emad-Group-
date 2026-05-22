import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { Search, Mail, Phone, Calendar, Loader2, DollarSign, ShoppingBag, Eye, X, Package, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "../../config";
import { toast } from "sonner";

interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  joinedAt: string;
}

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
  status: string;
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

export function AdminCustomers() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Detail modal state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch customers
      const custRes = await fetch(`${API_BASE_URL}/customers`, {
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });
      if (!custRes.ok) throw new Error("Failed to fetch customers");
      const custData = await custRes.json();
      setCustomers(custData);

      // Fetch all orders to link details
      const ordRes = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData);
      }
    } catch (err) {
      toast.error(isRtl ? "فشل تحميل بيانات العملاء." : "Failed to load customers data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchData();
    }
  }, [user]);

  const filteredCustomers = customers.filter(customer => {
    const name = customer.fullName.toLowerCase();
    const email = customer.email.toLowerCase();
    const phone = customer.phone;
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query) || phone.includes(query);
  });

  const getCustomerOrders = (customerId: string) => {
    return orders.filter(o => o.userId === customerId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "Processing": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "Shipped": return "bg-purple-500/20 text-purple-400 border border-purple-500/30";
      case "Delivered": return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "Cancelled": return "bg-red-500/20 text-red-400 border border-red-500/30";
      default: return "bg-white/10 text-white/70";
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

  return (
    <div className={`p-6 lg:p-8 min-h-screen bg-petroleum-dark/40 ${isRtl ? "text-right" : "text-left"}`}>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white mb-2 flex items-center justify-start gap-3">
          <ShieldCheck className="w-8 h-8 text-teal-accent" />
          <span>{isRtl ? "إدارة العملاء" : "Customer Relations"}</span>
        </h1>
        <p className="text-sage-green-light">
          {isRtl ? "استعراض قائمة العملاء المسجلين، سجل الشراء، وقيمة المبيعات الإجمالية لكل عميل" : "Browse registered customer lists, sales history, and total spending metrics"}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-teal-accent/80`} />
          <input
            type="text"
            placeholder={isRtl ? "البحث بالاسم، البريد الإلكتروني، أو الهاتف..." : "Search by name, email, phone..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isRtl ? "pr-12 pl-4 text-right" : "pl-12 pr-4"} py-3 bg-petroleum-blue/30 backdrop-blur-sm text-white rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-teal-accent`}
          />
        </div>
      </div>

      {/* View Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-white">
          <Loader2 className="w-12 h-12 animate-spin text-teal-accent" />
          <p className="text-sage-green-light">{isRtl ? "جاري تحميل قائمة العملاء..." : "Loading customers catalog..."}</p>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => {
            const initials = customer.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "?";
            const isVip = customer.totalSpent >= 200; // VIP if spent $200 or more

            return (
              <div
                key={customer.id}
                className="bg-petroleum-blue/20 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20 hover:border-teal-accent/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-accent to-sage-green rounded-xl flex items-center justify-center text-dark-olive text-xl font-bold font-display shadow-md">
                      {initials}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isVip
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-sage-green/20 text-sage-green border border-sage-green/30"
                    }`}>
                      {isVip ? (isRtl ? "عميل مميز VIP" : "VIP Customer") : (isRtl ? "نشط" : "Active")}
                    </span>
                  </div>

                  <h3 className="font-display text-xl text-white font-semibold truncate mb-4">
                    {customer.fullName}
                  </h3>

                  <div className="space-y-3 mb-6 text-sm text-white">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-sage-green-light flex-shrink-0" />
                      <span className="truncate text-white/80">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-sage-green-light flex-shrink-0" />
                      <span className="text-white/80">{customer.phone || (isRtl ? "غير مسجل" : "Not registered")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-sage-green-light flex-shrink-0" />
                      <span className="text-white/80">
                        {isRtl ? "انضم في:" : "Joined:"} {new Date(customer.joinedAt).toLocaleDateString(isRtl ? 'ar' : 'en', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-petroleum-dark/40 rounded-xl border border-teal-accent/10">
                    <div>
                      <p className="text-xs text-sage-green-light mb-1 flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isRtl ? "الطلبات" : "Orders"}</span>
                      </p>
                      <p className="text-lg text-white font-bold">{customer.ordersCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-sage-green-light mb-1 flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>{isRtl ? "المشتريات" : "Spent"}</span>
                      </p>
                      <p className="text-lg text-teal-accent font-bold">${customer.totalSpent.toFixed(2)}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setIsModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-accent/20 to-teal-accent/10 hover:from-teal-accent hover:to-teal-dark border border-teal-accent/30 hover:border-teal-accent text-white rounded-xl transition-all font-medium text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{isRtl ? "تفاصيل الطلبات" : "Purchase History"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-petroleum-blue/10 rounded-2xl border border-teal-accent/20">
          <p className="text-sage-green-light italic">
            {isRtl ? "لا توجد نتائج مطابقة للبحث." : "No customers found matching the search query."}
          </p>
        </div>
      )}

      {/* Customer Purchase History Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className={`bg-petroleum-dark border border-teal-accent/30 rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto ${isRtl ? "text-right" : "text-left"}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
            
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedCustomer(null);
              }}
              className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all`}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-6 border-b border-teal-accent/20 pb-4">
              <span className="text-xs uppercase tracking-wider text-teal-accent font-bold">
                {isRtl ? "سجل طلبات العميل" : "Customer Order History"}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl text-white font-bold mt-1">
                {selectedCustomer.fullName}
              </h2>
              <p className="text-sm text-sage-green-light mt-1">{selectedCustomer.email}</p>
            </div>

            <div className="space-y-6">
              {getCustomerOrders(selectedCustomer.id).length > 0 ? (
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2">
                  {getCustomerOrders(selectedCustomer.id).map((order) => (
                    <div
                      key={order.id}
                      className="p-5 bg-petroleum-blue/10 rounded-2xl border border-teal-accent/15 hover:border-teal-accent/35 transition-all duration-200"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                          <span className="font-mono text-teal-accent font-bold text-lg">#{order.id}</span>
                          <span className="text-xs text-white/50 mx-2">|</span>
                          <span className="text-xs text-white/80">
                            {new Date(order.orderDate).toLocaleDateString(isRtl ? 'ar' : 'en', {
                              dateStyle: 'medium'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                          <span className="text-white font-bold text-lg">${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Order items inside modal */}
                      <div className="grid sm:grid-cols-2 gap-3 border-t border-teal-accent/10 pt-4">
                        {order.orderItems.map((item) => {
                          const itemName = isRtl ? (item.productNameAr || item.productName) : item.productName;
                          return (
                            <div key={item.id} className="flex gap-3 items-center">
                              <img
                                src={item.productImage || "https://images.unsplash.com/photo-1759749597601-e90685f026b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"}
                                alt={itemName}
                                className="w-12 h-12 rounded-lg object-cover border border-teal-accent/10 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-white text-sm truncate">{itemName}</p>
                                <p className="text-xs text-sage-green-light mt-0.5">
                                  {item.size ? `${isRtl ? "الحجم" : "Size"}: ${item.size} • ` : ""}
                                  {isRtl ? "الكمية" : "Qty"}: {item.quantity}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-petroleum-blue/5 rounded-2xl border border-teal-accent/10">
                  <p className="text-sage-green-light italic">
                    {isRtl ? "لا توجد طلبات سابقة لهذا العميل بعد." : "This customer hasn't placed any orders yet."}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

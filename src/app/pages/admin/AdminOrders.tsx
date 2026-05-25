import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { Search, Filter, Eye, X, Loader2, Calendar, User, Mail, Phone, MapPin, DollarSign, Package, Printer } from "lucide-react";
import { formatPrice } from "../../utils/currency";
import { API_BASE_URL } from "../../config";
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

export function AdminOrders() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handlePrintInvoice = (order: Order) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>${isRtl ? "فاتورة رقم" : "Invoice #"} ${order.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;600;700&display=swap');
            body {
              font-family: ${isRtl ? "'Cairo', sans-serif" : "'Inter', sans-serif"};
              direction: ${isRtl ? "rtl" : "ltr"};
              padding: 40px;
              color: #333;
              background-color: #fff;
              line-height: 1.6;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
            }
            .invoice-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #6b7a3e;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-logo {
              font-size: 26px;
              font-weight: 700;
              color: #1a3038;
            }
            .company-details {
              font-size: 13px;
              color: #666;
              text-align: ${isRtl ? "left" : "right"};
            }
            .invoice-title {
              font-size: 32px;
              font-weight: 700;
              color: #6b7a3e;
              margin: 0;
            }
            .invoice-meta {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
              font-size: 14px;
            }
            .meta-group h4 {
              margin: 0 0 8px 0;
              color: #6b7a3e;
              font-weight: 700;
              border-bottom: 1px solid #eee;
              padding-bottom: 4px;
            }
            .meta-group p {
              margin: 0;
              color: #555;
              line-height: 1.6;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              margin-top: 10px;
            }
            .items-table th {
              background-color: #f7f9fa;
              border-bottom: 2px solid #ddd;
              padding: 12px;
              text-align: ${isRtl ? "right" : "left"};
              font-weight: 700;
              color: #1a3038;
            }
            .items-table td {
              padding: 12px;
              border-bottom: 1px solid #eee;
              color: #555;
            }
            .items-table .text-right {
              text-align: ${isRtl ? "left" : "right"};
            }
            .invoice-summary {
              display: flex;
              justify-content: flex-end;
              margin-top: 20px;
            }
            .summary-table {
              width: 300px;
              border-collapse: collapse;
            }
            .summary-table td {
              padding: 8px 12px;
              font-size: 14px;
            }
            .summary-table tr.total-row td {
              font-weight: 700;
              font-size: 18px;
              color: #6b7a3e;
              border-top: 2px solid #6b7a3e;
              padding-top: 12px;
            }
            .footer {
              margin-top: 60px;
              text-align: center;
              font-size: 13px;
              color: #888;
              border-top: 1px dashed #ddd;
              padding-top: 20px;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <div>
                <h1 class="invoice-title">${isRtl ? "فاتورة ضريبية" : "TAX INVOICE"}</h1>
                <div style="margin-top: 8px; font-size: 15px; color: #555;">
                  <strong>${isRtl ? "رقم الفاتورة:" : "Invoice No:"}</strong> #${order.id}
                </div>
              </div>
              <div class="company-details">
                <div class="company-logo">${isRtl ? "مجموعة العماد" : "AL EMAD GROUP"}</div>
                <div>${isRtl ? "القاهرة، جمهورية مصر العربية" : "Cairo, Arab Republic of Egypt"}</div>
                <div>support@alemadgroup.com</div>
              </div>
            </div>

            <div class="invoice-meta">
              <div class="meta-group">
                <h4>${isRtl ? "تفاصيل الشحن:" : "Shipping Details:"}</h4>
                <p>
                  <strong>${order.firstName} ${order.lastName}</strong><br>
                  ${order.address}<br>
                  ${order.city}, ${order.state} ${order.zipCode}<br>
                  <strong>${isRtl ? "الهاتف:" : "Phone:"}</strong> ${order.phone}<br>
                  <strong>${isRtl ? "البريد الإلكتروني:" : "Email:"}</strong> ${order.email}
                </p>
              </div>
              <div class="meta-group" style="text-align: ${isRtl ? "left" : "right"};">
                <h4>${isRtl ? "معلومات الفاتورة:" : "Invoice Information:"}</h4>
                <p>
                  <strong>${isRtl ? "تاريخ الطلب:" : "Order Date:"}</strong> ${new Date(order.orderDate).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}<br>
                  <strong>${isRtl ? "طريقة الدفع:" : "Payment Method:"}</strong> ${isRtl ? "الدفع عند الاستلام (COD)" : "Cash on Delivery (COD)"}<br>
                  <strong>${isRtl ? "حالة الطلب الحالية:" : "Current Status:"}</strong> ${isRtl ? getStatusText(order.status) : order.status}
                </p>
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>${isRtl ? "المنتج" : "Item Description"}</th>
                  <th>${isRtl ? "الحجم" : "Size"}</th>
                  <th class="text-right">${isRtl ? "سعر الوحدة" : "Unit Price"}</th>
                  <th class="text-right" style="text-align: center;">${isRtl ? "الكمية" : "Qty"}</th>
                  <th class="text-right">${isRtl ? "الإجمالي" : "Total"}</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map((item, index) => {
                  const name = isRtl ? (item.productNameAr || item.productName) : item.productName;
                  return `
                    <tr>
                      <td>${index + 1}</td>
                      <td><strong>${name}</strong></td>
                      <td>${item.size || "-"}</td>
                      <td class="text-right">${formatPrice(item.price, language)}</td>
                      <td class="text-right" style="text-align: center;">${item.quantity}</td>
                      <td class="text-right">${formatPrice(item.price * item.quantity, language)}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>

            <div class="invoice-summary">
              <table class="summary-table">
                <tr>
                  <td>${isRtl ? "المجموع الفرعي:" : "Subtotal:"}</td>
                  <td class="text-right">${formatPrice(order.totalAmount, language)}</td>
                </tr>
                <tr>
                  <td>${isRtl ? "مصاريف الشحن:" : "Shipping Costs:"}</td>
                  <td class="text-right">${isRtl ? "مجاني" : "Free"}</td>
                </tr>
                <tr class="total-row">
                  <td>${isRtl ? "الإجمالي الكلي:" : "Total Amount:"}</td>
                  <td class="text-right">${formatPrice(order.totalAmount, language)}</td>
                </tr>
              </table>
            </div>

            <div class="footer">
              <p>${isRtl ? "شكرًا لتعاملكم معنا ونتطلع لخدمتكم مرة أخرى!" : "Thank you for your business! We look forward to serving you again."}</p>
              <p style="font-size: 11px; margin-top: 5px;">${isRtl ? "تم إنشاء هذه الفاتورة إلكترونياً." : "This is an electronically generated invoice."}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Trigger printing once loaded
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      toast.error(isRtl ? "فشل تحميل الطلبات من الخادم." : "Failed to load orders from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchOrders();
    }
  }, [user]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast.success(isRtl ? "تم تحديث حالة الطلب بنجاح!" : "Order status updated successfully!");
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      toast.error(isRtl ? "فشل تحديث حالة الطلب." : "Failed to update order status.");
    } finally {
      setUpdatingStatus(false);
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

  const filteredOrders = orders.filter(order => {
    const customerName = `${order.firstName} ${order.lastName}`.toLowerCase();
    const orderIdStr = `#${order.id}`;
    const matchesSearch =
      orderIdStr.includes(searchQuery) ||
      customerName.includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`p-6 lg:p-8 min-h-screen bg-petroleum-dark/40 ${isRtl ? "text-right" : "text-left"}`}>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white mb-2 flex items-center justify-start gap-3">
          <Package className="w-8 h-8 text-teal-accent" />
          <span>{isRtl ? "إدارة الطلبات" : "Order Management"}</span>
        </h1>
        <p className="text-sage-green-light">
          {isRtl ? "متابعة وإدارة طلبات العملاء وتعديل حالات الشحن والتوصيل" : "Track and manage customer shopping orders and fulfillment"}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute ${isRtl ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-5 h-5 text-teal-accent/80`} />
          <input
            type="text"
            placeholder={isRtl ? "البحث برقم الطلب أو اسم العميل..." : "Search by order ID, name, email..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${isRtl ? "pr-12 pl-4 text-right" : "pl-12 pr-4"} py-3 bg-petroleum-blue/30 backdrop-blur-sm text-white rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-teal-accent`}
          />
        </div>

        <div className="flex items-center gap-3 justify-start">
          <Filter className="w-5 h-5 text-teal-accent" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-4 py-3 bg-petroleum-blue/30 text-white rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-teal-accent ${isRtl ? "text-right" : "text-left"}`}
          >
            <option value="all" className="bg-petroleum-dark text-white">{isRtl ? "جميع الحالات" : "All Statuses"}</option>
            <option value="Pending" className="bg-petroleum-dark text-white">{isRtl ? "قيد الانتظار" : "Pending"}</option>
            <option value="Processing" className="bg-petroleum-dark text-white">{isRtl ? "قيد المعالجة" : "Processing"}</option>
            <option value="Shipped" className="bg-petroleum-dark text-white">{isRtl ? "تم الشحن" : "Shipped"}</option>
            <option value="Delivered" className="bg-petroleum-dark text-white">{isRtl ? "تم التوصيل" : "Delivered"}</option>
            <option value="Cancelled" className="bg-petroleum-dark text-white">{isRtl ? "ملغي" : "Cancelled"}</option>
          </select>
        </div>
      </div>

      {/* Orders View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-white">
          <Loader2 className="w-12 h-12 animate-spin text-teal-accent" />
          <p className="text-sage-green-light">{isRtl ? "جاري تحميل الطلبات..." : "Loading orders catalog..."}</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="bg-petroleum-blue/10 rounded-2xl border border-teal-accent/20 overflow-hidden backdrop-blur-sm shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-petroleum-dark/60 text-teal-accent font-semibold border-b border-teal-accent/20">
                <tr>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "رقم الطلب" : "Order ID"}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "العميل" : "Customer"}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "التاريخ" : "Date"}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "الإجمالي" : "Total"}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "الحالة" : "Status"}</th>
                  <th className={`px-6 py-4 ${isRtl ? "text-right" : "text-left"}`}>{isRtl ? "العمليات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-accent/15 text-white">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-petroleum-blue/20 transition-colors duration-200">
                    <td className="px-6 py-4 font-mono font-bold text-teal-accent">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-white">{order.firstName} {order.lastName}</div>
                        <div className="text-xs text-sage-green-light">{order.email}</div>
                      </div>
                    </td>
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                          className="p-2.5 bg-petroleum-blue/40 hover:bg-teal-accent hover:text-white rounded-xl text-sage-green-light transition-all flex items-center gap-1.5"
                          title={isRtl ? "عرض تفاصيل الطلب" : "View Order Details"}
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-medium">{isRtl ? "عرض" : "View"}</span>
                        </button>
                        
                        <button
                          onClick={() => handlePrintInvoice(order)}
                          className="p-2.5 bg-petroleum-blue/40 hover:bg-olive-green hover:text-white rounded-xl text-sage-green-light transition-all flex items-center gap-1.5"
                          title={isRtl ? "طباعة الفاتورة" : "Print Invoice"}
                        >
                          <Printer className="w-4 h-4" />
                          <span className="text-xs font-medium">{isRtl ? "طباعة" : "Print"}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-petroleum-blue/10 rounded-2xl border border-teal-accent/20">
          <p className="text-sage-green-light italic">
            {isRtl ? "لا توجد أي طلبات مطابقة للبحث." : "No orders found matching the filter."}
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className={`bg-petroleum-dark border border-teal-accent/30 rounded-3xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto ${isRtl ? "text-right" : "text-left"}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
            
            {/* Modal Close Button */}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedOrder(null);
              }}
              className={`absolute top-4 ${isRtl ? "left-4" : "right-4"} p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-all`}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Title */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-teal-accent/20 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-teal-accent font-bold">
                  {isRtl ? "تفاصيل الطلب" : "Order details"}
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-white font-bold mt-1">
                  #{selectedOrder.id}
                </h2>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="px-4 py-1.5 bg-olive-green hover:bg-dark-olive text-white rounded-full transition-all flex items-center gap-1.5 text-xs font-medium shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isRtl ? "طباعة الفاتورة" : "Print Invoice"}</span>
                </button>
                <span className="text-sm text-sage-green-light">{isRtl ? "حالة الطلب الحالية:" : "Current Status:"}</span>
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Order Items (Left 2 Columns) */}
              <div className="md:col-span-2 space-y-6">
                <h3 className="text-lg font-display text-white font-semibold flex items-center gap-2 border-b border-teal-accent/10 pb-2">
                  <Package className="w-5 h-5 text-teal-accent" />
                  <span>{isRtl ? "المنتجات المطلوبة" : "Ordered Items"}</span>
                </h3>

                <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                  {selectedOrder.orderItems.map((item) => {
                    const itemName = isRtl ? (item.productNameAr || item.productName) : item.productName;
                    return (
                      <div key={item.id} className="flex gap-4 p-3 bg-petroleum-blue/10 rounded-2xl border border-teal-accent/10 hover:border-teal-accent/20 transition-all duration-200">
                        <img
                          src={item.productImage || "https://images.unsplash.com/photo-1759749597601-e90685f026b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"}
                          alt={itemName}
                          className="w-16 h-16 rounded-xl object-cover border border-teal-accent/10 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-base truncate">{itemName}</h4>
                          <p className="text-xs text-sage-green-light mt-1">
                            {item.size ? `${isRtl ? "الحجم" : "Size"}: ${item.size} • ` : ""}
                            {isRtl ? "الكمية" : "Qty"}: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right flex flex-col justify-center min-w-[70px]">
                          <span className="text-teal-accent font-bold text-sm">{formatPrice(item.price, language)}</span>
                          <span className="text-xs text-white/50">{isRtl ? "للقطعة" : "each"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Status Update Select */}
                <div className="bg-petroleum-blue/10 p-5 rounded-2xl border border-teal-accent/10 space-y-3">
                  <h4 className="text-sm font-semibold text-white">{isRtl ? "تعديل حالة الشحن والتوصيل" : "Change Order Shipping Status"}</h4>
                  <div className="flex items-center gap-3">
                    <select
                      value={selectedOrder.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                      className={`flex-1 px-4 py-2.5 bg-petroleum-dark text-white rounded-xl border border-teal-accent/20 focus:outline-none focus:ring-2 focus:ring-teal-accent disabled:opacity-50 text-sm ${isRtl ? "text-right" : "text-left"}`}
                    >
                      <option value="Pending">{isRtl ? "قيد الانتظار (Pending)" : "Pending"}</option>
                      <option value="Processing">{isRtl ? "قيد المعالجة (Processing)" : "Processing"}</option>
                      <option value="Shipped">{isRtl ? "تم الشحن (Shipped)" : "Shipped"}</option>
                      <option value="Delivered">{isRtl ? "تم التوصيل (Delivered)" : "Delivered"}</option>
                      <option value="Cancelled">{isRtl ? "ملغي (Cancelled)" : "Cancelled"}</option>
                    </select>
                    {updatingStatus && <Loader2 className="w-5 h-5 animate-spin text-teal-accent" />}
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Details (Right Column) */}
              <div className="space-y-6">
                <div className="bg-petroleum-blue/20 p-5 rounded-2xl border border-teal-accent/15 space-y-5">
                  
                  {/* Summary */}
                  <div>
                    <h4 className="text-xs uppercase text-teal-accent font-bold mb-2 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4" />
                      <span>{isRtl ? "ملخص الحساب" : "Payment Summary"}</span>
                    </h4>
                    <div className="flex items-center justify-between text-white border-b border-teal-accent/10 pb-2 mb-2">
                      <span className="text-sm">{isRtl ? "قيمة الطلب" : "Subtotal"}</span>
                      <span className="font-bold">{formatPrice(selectedOrder.totalAmount, language)}</span>
                    </div>
                    <div className="flex items-center justify-between text-white/65 text-xs">
                      <span>{isRtl ? "طريقة الدفع" : "Payment Method"}</span>
                      <span className="font-semibold">{isRtl ? "الدفع عند الاستلام" : "Cash on Delivery"}</span>
                    </div>
                  </div>

                  {/* Customer shipping info */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase text-teal-accent font-bold flex items-center gap-1.5 border-b border-teal-accent/10 pb-2">
                      <User className="w-4 h-4" />
                      <span>{isRtl ? "بيانات الشحن والتوصيل" : "Shipping Information"}</span>
                    </h4>
                    
                    <div className="space-y-2.5 text-xs text-white">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-sage-green-light mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-bold">{selectedOrder.firstName} {selectedOrder.lastName}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-sage-green-light mt-0.5 flex-shrink-0" />
                        <div className="break-all">{selectedOrder.email}</div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-sage-green-light mt-0.5 flex-shrink-0" />
                        <div>{selectedOrder.phone}</div>
                      </div>

                      <div className="flex items-start gap-2 pt-2 border-t border-teal-accent/10">
                        <MapPin className="w-4 h-4 text-teal-accent mt-0.5 flex-shrink-0" />
                        <div className="space-y-0.5">
                          <div className="font-medium">{selectedOrder.address}</div>
                          <div className="text-sage-green-light">
                            {selectedOrder.city}, {selectedOrder.state} {selectedOrder.zipCode}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 pt-2 border-t border-teal-accent/10">
                        <Calendar className="w-4 h-4 text-sage-green-light mt-0.5 flex-shrink-0" />
                        <div>
                          {new Date(selectedOrder.orderDate).toLocaleString(isRtl ? 'ar-EG' : 'en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

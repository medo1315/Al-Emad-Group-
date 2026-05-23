import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router";
import { formatPrice } from "../../utils/currency";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  ArrowUp,
  Loader2,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { API_BASE_URL } from "../../config";
import { toast } from "sonner";

interface SalesTrend {
  month: string;
  sales: number;
  orders: number;
  customers: number;
}

interface CategoryDistribution {
  categoryName: string;
  value: number;
  color: string;
}

interface LowStockProduct {
  id: number;
  name: string;
  nameAr: string;
  stock: number;
}

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  averageOrderValue: number;
  salesTrends: SalesTrend[];
  categoryDistribution: CategoryDistribution[];
  lowStockProducts: LowStockProduct[];
}

interface OrderItem {
  id: number;
  productName: string;
  productNameAr: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  userId: string;
  userFullName: string;
  orderDate: string;
  status: string;
  totalAmount: number;
  orderItems: OrderItem[];
}

export function AdminDashboard() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Translations
  const t = {
    dashboard: isRtl ? "لوحة التحكم الرئيسية" : "Dashboard",
    welcome: isRtl ? "مرحباً بك مجدداً! إليك ملخص نشاط المتجر اليوم." : "Welcome back! Here's what's happening today.",
    totalSales: isRtl ? "إجمالي الإيرادات" : "Total Revenue",
    totalOrders: isRtl ? "إجمالي الطلبات" : "Orders Count",
    totalCustomers: isRtl ? "العملاء المسجلين" : "Active Customers",
    totalProducts: isRtl ? "المنتجات بالمتجر" : "Total Products",
    revenueOverview: isRtl ? "نظرة عامة على الإيرادات" : "Revenue Overview",
    ordersTrend: isRtl ? "مؤشر نمو الطلبات" : "Orders Trend",
    recentOrders: isRtl ? "الطلبات الأخيرة" : "Recent Orders",
    lowStockTitle: isRtl ? "تنبيهات نقص المخزون" : "Low Stock Alerts",
    noLowStock: isRtl ? "جميع المنتجات متوفرة بمخزون كافٍ." : "All products have sufficient stock.",
    averageOrder: isRtl ? "متوسط قيمة الطلب:" : "Avg Order Value:",
    viewAllOrders: isRtl ? "عرض كل الطلبات" : "View All Orders",
    items: isRtl ? "منتجات" : "items",
    loading: isRtl ? "جاري تحميل بيانات لوحة التحكم..." : "Loading dashboard analytics...",
    errorMsg: isRtl ? "فشل في تحميل التحليلات." : "Failed to load dashboard analytics.",
    pcs: isRtl ? "قطعة" : "pcs",
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = {
        "Authorization": `Bearer ${user?.token}`
      };

      // Fetch analytics
      const analyticsResponse = await fetch(`${API_BASE_URL}/analytics`, { headers });
      if (!analyticsResponse.ok) throw new Error("Failed to load analytics");
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);

      // Fetch recent orders
      const ordersResponse = await fetch(`${API_BASE_URL}/orders`, { headers });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        // Take the first 5 orders
        setRecentOrders(ordersData.slice(0, 5));
      }
    } catch (e) {
      toast.error(t.errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
        <Loader2 className="w-12 h-12 animate-spin text-teal-accent" />
        <p className="text-sage-green-light font-medium">{t.loading}</p>
      </div>
    );
  }

  const stats = [
    {
      label: t.totalSales,
      value: analytics ? formatPrice(analytics.totalSales, language) : (isRtl ? "0 ج.م" : "EGP 0"),
      change: t.averageOrder + " " + (analytics ? formatPrice(analytics.averageOrderValue, language) : (isRtl ? "0 ج.م" : "EGP 0")),
      icon: DollarSign,
      color: "from-teal-accent to-sage-green",
    },
    {
      label: t.totalOrders,
      value: analytics?.totalOrders.toString() || "0",
      change: isRtl ? "الطلبات النشطة" : "Active customer orders",
      icon: ShoppingCart,
      color: "from-sage-green to-light-olive",
    },
    {
      label: t.totalCustomers,
      value: analytics?.totalCustomers.toString() || "0",
      change: isRtl ? "مشترين فريدين" : "Unique registered buyers",
      icon: Users,
      color: "from-light-olive to-gold-accent",
    },
    {
      label: t.totalProducts,
      value: analytics?.totalProducts.toString() || "0",
      change: isRtl ? "منشور في المتجر" : "Published product items",
      icon: Package,
      color: "from-gold-accent to-earth-brown",
    },
  ];

  return (
    <div className={`p-6 lg:p-8 min-h-screen ${isRtl ? "text-right" : "text-left"}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white mb-2">
          {t.dashboard}
        </h1>
        <p className="text-sage-green-light">{t.welcome}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-dark-olive/40 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20 hover:border-teal-accent/40 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-dark-olive" />
                </div>
                <div className="flex items-center gap-1 text-xs text-teal-accent font-semibold">
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-sm text-sage-green-light mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-white font-sans">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-dark-olive/40 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-white">{t.revenueOverview}</h2>
            <TrendingUp className="w-5 h-5 text-teal-accent" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.salesTrends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C361A" />
              <XAxis dataKey="month" stroke="#8FBC8F" />
              <YAxis stroke="#8FBC8F" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#161C12",
                  border: "1px solid #D4AF37",
                  borderRadius: "0.5rem",
                  color: "#FAF8F3"
                }}
              />
              <Bar key="bar-revenue" dataKey="sales" fill="#D4AF37" radius={[8, 8, 0, 0]} name={isRtl ? "المبيعات (ج.م)" : "Sales (EGP)"} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-dark-olive/40 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl text-white">{t.ordersTrend}</h2>
            <ShoppingCart className="w-5 h-5 text-teal-accent" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.salesTrends || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C361A" />
              <XAxis dataKey="month" stroke="#8FBC8F" />
              <YAxis stroke="#8FBC8F" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#161C12",
                  border: "1px solid #D4AF37",
                  borderRadius: "0.5rem",
                  color: "#FAF8F3"
                }}
              />
              <Line
                key="line-orders"
                type="monotone"
                dataKey="orders"
                stroke="#teal-accent"
                strokeWidth={3}
                dot={{ fill: "#A4B36D", r: 6 }}
                name={isRtl ? "الطلبات" : "Orders"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-dark-olive/40 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-white flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-teal-accent" />
                <span>{t.recentOrders}</span>
              </h2>
              <Link to="/admin/orders" className="text-xs text-teal-accent hover:underline font-semibold">
                {t.viewAllOrders}
              </Link>
            </div>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-petroleum-dark/40 rounded-xl border border-teal-accent/10 hover:border-teal-accent/20 transition-all duration-300">
                  <div>
                    <p className="text-sm font-semibold text-white">#{order.id}</p>
                    <p className="text-xs text-sage-green-light">{order.userFullName}</p>
                    <p className="text-xs text-teal-accent/80 font-medium">
                      {order.orderItems?.length || 0} {t.items}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-teal-accent font-bold font-sans mb-1">{formatPrice(order.totalAmount, language)}</p>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                      order.status === "Delivered" || order.status === "completed"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : order.status === "Cancelled"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-dark-olive/40 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20">
          <h2 className="font-display text-xl text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>{t.lowStockTitle}</span>
          </h2>
          
          {analytics?.lowStockProducts && analytics.lowStockProducts.length > 0 ? (
            <div className="space-y-4">
              {analytics.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{isRtl ? product.nameAr : product.name}</p>
                    <div className="w-full bg-petroleum-dark rounded-full h-1.5 mt-2">
                      <div
                        className="bg-red-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min((product.stock / 5) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className={`text-right ${isRtl ? "mr-4" : "ml-4"}`}>
                    <span className="text-red-400 text-sm font-bold font-sans">
                      {product.stock} {t.pcs}
                    </span>
                    <p className="text-[10px] text-sage-green-light italic mt-1">{isRtl ? "مخزون منخفض جداً" : "Urgent Restock"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-petroleum-blue/10 rounded-2xl border border-teal-accent/10">
              <p className="text-sage-green-light italic text-sm">{t.noLowStock}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { formatPrice } from "../../utils/currency";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  Loader2,
  PieChart as PieIcon,
  BarChart as BarIcon,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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

export function AdminAnalytics() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === "ar";

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`, {
        headers: {
          "Authorization": `Bearer ${user?.token}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const result = await response.json();
      setData(result);
    } catch (err) {
      toast.error(isRtl ? "فشل تحميل البيانات التحليلية." : "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchAnalytics();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-white min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-teal-accent" />
        <p className="text-sage-green-light">{isRtl ? "جاري تحميل لوحة البيانات التحليلية..." : "Loading analytics dashboards..."}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 min-h-screen text-white flex flex-col justify-center items-center">
        <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
        <p className="text-sage-green-light italic">{isRtl ? "لم نتمكن من جلب البيانات حالياً." : "Unable to retrieve analytics at the moment."}</p>
      </div>
    );
  }

  // Format category names for chart
  const categoryChartData = data.categoryDistribution.map(cat => ({
    name: cat.categoryName,
    value: cat.value,
    color: cat.color
  }));

  const metrics = [
    {
      label: isRtl ? "إجمالي المبيعات" : "Total Revenue",
      value: formatPrice(data.totalSales, language),
      icon: DollarSign,
      color: "from-teal-accent/30 to-teal-accent/10 border-teal-accent/30 text-teal-accent",
    },
    {
      label: isRtl ? "إجمالي الطلبات" : "Total Orders",
      value: data.totalOrders,
      icon: ShoppingCart,
      color: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
    },
    {
      label: isRtl ? "متوسط قيمة الطلب" : "Average Order Value",
      value: formatPrice(data.averageOrderValue, language),
      icon: TrendingUp,
      color: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400",
    },
    {
      label: isRtl ? "العملاء المسجلين" : "Active Customers",
      value: data.totalCustomers,
      icon: Users,
      color: "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400",
    },
  ];

  return (
    <div className={`p-6 lg:p-8 min-h-screen bg-petroleum-dark/40 ${isRtl ? "text-right" : "text-left"}`} style={{ direction: isRtl ? 'rtl' : 'ltr' }}>
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="font-display text-4xl text-white mb-2 flex items-center justify-start gap-3">
          <TrendingUp className="w-8 h-8 text-teal-accent" />
          <span>{isRtl ? "لوحة التحليلات والإحصائيات" : "Performance Analytics"}</span>
        </h1>
        <p className="text-sage-green-light">
          {isRtl ? "مراقبة المبيعات وتدفق المشتريات ومؤشرات نمو المتجر" : "Monitor sales performance, orders flow, and store growth indicators"}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`bg-petroleum-blue/20 backdrop-blur-sm rounded-2xl p-6 border ${metric.color.split(" ")[2]} hover:shadow-xl transition-shadow flex items-center gap-4`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${metric.color.split(" ")[0]} ${metric.color.split(" ")[1]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-sage-green-light mb-1">{metric.label}</p>
                <p className="text-2xl text-white font-bold font-sans">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Warn Banner */}
      {data.lowStockProducts.length > 0 && (
        <div className="mb-8 p-5 bg-red-500/10 border border-red-500/35 rounded-2xl flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-red-400 font-bold text-base mb-1">
              {isRtl ? "تحذير: منتجات شارفت على النفاد!" : "Warning: Low Stock Products!"}
            </h3>
            <p className="text-sm text-white/80 mb-3">
              {isRtl 
                ? "المنتجات التالية متبقي منها أقل من 5 قطع في المخزن. يرجى إعادة تعبئة المخزون لتجنب نفاد الكمية."
                : "The following items have less than 5 units left in stock. Reorder stock soon to avoid sold out status."}
            </p>
            <div className="flex flex-wrap gap-3">
              {data.lowStockProducts.map(prod => (
                <span key={prod.id} className="px-3 py-1 bg-red-500/20 text-white border border-red-500/30 rounded-lg text-xs font-semibold">
                  {isRtl ? prod.nameAr : prod.name} ({prod.stock} {isRtl ? "قطع" : "left"})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sales Trends Chart */}
      <div className="bg-petroleum-blue/20 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20 mb-8">
        <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-2">
          <BarIcon className="w-5 h-5 text-teal-accent" />
          <span>{isRtl ? "مؤشر نمو المبيعات (آخر 6 أشهر)" : "Sales & Order Trends (Last 6 Months)"}</span>
        </h2>
        <div className="w-full" style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.salesTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C361A" opacity={0.2} />
              <XAxis dataKey="month" stroke="#8FBC8F" />
              <YAxis stroke="#8FBC8F" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#161C12",
                  border: "1px solid #2ddba8",
                  borderRadius: "0.75rem",
                  color: "#FAF8F3",
                  textAlign: isRtl ? 'right' : 'left'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#2ddba8"
                strokeWidth={3}
                name={isRtl ? "المبيعات (ج.م)" : "Sales (EGP)"}
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#A4B36D"
                strokeWidth={2}
                name={isRtl ? "الطلبات" : "Orders"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Category Distribution Chart */}
        <div className="bg-petroleum-blue/20 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20">
          <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-teal-accent" />
            <span>{isRtl ? "توزيع المبيعات حسب التصنيف" : "Sales by Product Category"}</span>
          </h2>
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6" style={{ minHeight: 300 }}>
            {categoryChartData.some(c => c.value > 0) ? (
              <>
                <div style={{ width: '100%', maxWidth: 280, height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatPrice(Number(value), language)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3 justify-center">
                  {categoryChartData.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-white text-sm font-semibold">{cat.name}</span>
                      <span className="text-teal-accent text-xs">({formatPrice(cat.value, language)})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sage-green-light italic text-sm py-10">
                {isRtl ? "لا توجد بيانات مبيعات كافية لعرضها." : "No sales data available yet to display."}
              </div>
            )}
          </div>
        </div>

        {/* Store Performance Summary */}
        <div className="bg-petroleum-blue/20 backdrop-blur-sm rounded-2xl p-6 border border-teal-accent/20 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-2xl text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-accent" />
              <span>{isRtl ? "موجز أداء المتجر" : "Store Growth Metrics"}</span>
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-petroleum-dark/40 rounded-xl border border-teal-accent/10 flex justify-between items-center">
                <span className="text-white text-sm">{isRtl ? "مجموع المنتجات في الكتالوج" : "Catalog Products Count"}</span>
                <span className="text-teal-accent font-bold text-lg">{data.totalProducts}</span>
              </div>
              <div className="p-4 bg-petroleum-dark/40 rounded-xl border border-teal-accent/10 flex justify-between items-center">
                <span className="text-white text-sm">{isRtl ? "العملاء المسجلين" : "Registered Customers"}</span>
                <span className="text-teal-accent font-bold text-lg">{data.totalCustomers}</span>
              </div>
              <div className="p-4 bg-petroleum-dark/40 rounded-xl border border-teal-accent/10 flex justify-between items-center">
                <span className="text-white text-sm">{isRtl ? "إجمالي المعاملات الناجحة" : "Total Orders Placed"}</span>
                <span className="text-teal-accent font-bold text-lg">{data.totalOrders}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-teal-accent/5 rounded-2xl border border-teal-accent/20">
            <p className="text-xs text-sage-green-light leading-relaxed">
              {isRtl
                ? "يتم تحديث جميع التحليلات والرسوم البيانية المعروضة أعلاه تلقائياً وبشكل فوري بمجرد إتمام المتسوقين لعمليات الشراء في المتجر."
                : "All dashboards and charts automatically refresh instantly when customers place success orders in real-time."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

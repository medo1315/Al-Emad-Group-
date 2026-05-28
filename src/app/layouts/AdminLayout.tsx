import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Warehouse,
  Ticket,
  Menu,
  X,
  Shield,
  UserPlus,
  Truck,
  LogOut,
  Store,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import logoImage from "../../imports/logo.png";
import { PageLoader } from "../components/PageLoader";


export function AdminLayout() {
  const { t, language } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isRtl = language === "ar";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: t("dashboard"), exact: true },
    { path: "/admin/orders", icon: ShoppingCart, label: t("orders") },
    { path: "/admin/products", icon: Package, label: t("products") },
    { path: "/admin/customers", icon: Users, label: t("customers") },
    { path: "/admin/analytics", icon: BarChart3, label: t("analytics") },
    { path: "/admin/inventory", icon: Warehouse, label: t("inventory") },
    { path: "/admin/coupons", icon: Ticket, label: t("coupons") },
    { path: "/admin/shipping", icon: Truck, label: isRtl ? "أسعار الشحن" : "Shipping Costs" },
    { path: "/admin/roles", icon: Shield, label: isRtl ? "الأدوار والصلاحيات" : "Roles & Permissions" },
    { path: "/admin/accounts", icon: UserPlus, label: isRtl ? "حسابات المشرفين" : "Admin Accounts" },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-olive to-petroleum-dark">
      <PageLoader />
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-petroleum-dark to-dark-olive border-b border-teal-accent/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logoImage}
            alt="AL EMAD GROUP"
            className="w-10 h-10 object-contain bg-white/10 rounded-lg p-1"
          />
          <span className="font-display text-lg text-white">AL EMAD ADMIN</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile: show logged-in user indicator */}
          {user && (
            <div className="flex items-center gap-2 px-2 py-1 bg-teal-accent/10 border border-teal-accent/20 rounded-lg">
              <div className="w-6 h-6 bg-gradient-to-br from-teal-accent to-petroleum-light rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">{user.fullName?.charAt(0)?.toUpperCase()}</span>
              </div>
              <span className="text-white/90 text-xs font-medium max-w-[80px] truncate">{user.fullName}</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 text-white rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-petroleum-dark to-dark-olive border-r border-teal-accent/20 z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 pt-16 lg:pt-0 flex flex-col`}
      >
        <div className="p-6 border-b border-teal-accent/20 hidden lg:block">
          <div className="flex items-center gap-3">
            <img
              src={logoImage}
              alt="AL EMAD GROUP"
              className="w-12 h-12 object-contain bg-white/10 rounded-lg p-2"
            />
            <div>
              <h1 className="font-display text-xl text-white">AL EMAD</h1>
              <p className="text-xs text-teal-accent">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? "bg-gradient-to-r from-teal-accent to-petroleum-light text-white shadow-xl"
                    : "text-white/90 hover:bg-white/10 hover:text-teal-accent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logged-in Admin Profile Section */}
        <div className="border-t border-teal-accent/20 p-4 space-y-3">
          {user && (
            <div className="bg-petroleum-blue/20 border border-teal-accent/15 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-accent to-petroleum-light rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-white text-sm font-bold">{user.fullName?.charAt(0)?.toUpperCase()}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-semibold truncate">{user.fullName}</p>
                  <p className="text-white/50 text-[10px] truncate font-mono">{user.email}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="w-3 h-3 text-teal-accent" />
                    <span className="text-teal-accent text-[10px] font-semibold">
                      {user.roles?.includes("Admin") 
                        ? (isRtl ? "مدير النظام" : "Administrator") 
                        : (isRtl ? "مستخدم" : "User")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl transition-all duration-200 shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">{isRtl ? "تسجيل الخروج" : "Logout"}</span>
          </button>
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-teal-accent/30 text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <Store className="w-4 h-4" />
            <span className="text-sm">{isRtl ? "العودة للمتجر" : "Back to Store"}</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main key={location.pathname} className="lg:ml-64 pt-16 lg:pt-0 animate-page-fade-in">
        <Outlet />
      </main>
    </div>
  );
}

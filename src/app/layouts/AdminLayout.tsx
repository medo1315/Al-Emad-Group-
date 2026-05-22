import { Outlet, Link, useLocation } from "react-router";
import { useLanguage } from "../context/LanguageContext";
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
} from "lucide-react";
import { useState } from "react";
import logoImage from "../../imports/logo.png";
import { PageLoader } from "../components/PageLoader";


export function AdminLayout() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: "/admin", icon: LayoutDashboard, label: t("dashboard"), exact: true },
    { path: "/admin/orders", icon: ShoppingCart, label: t("orders") },
    { path: "/admin/products", icon: Package, label: t("products") },
    { path: "/admin/customers", icon: Users, label: t("customers") },
    { path: "/admin/analytics", icon: BarChart3, label: t("analytics") },
    { path: "/admin/inventory", icon: Warehouse, label: t("inventory") },
    { path: "/admin/coupons", icon: Ticket, label: t("coupons") },
    { path: "/admin/roles", icon: Shield, label: language === "ar" ? "الأدوار والصلاحيات" : "Roles & Permissions" },
    { path: "/admin/accounts", icon: UserPlus, label: language === "ar" ? "حسابات المشرفين" : "Admin Accounts" },
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
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-white/10 text-white rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-petroleum-dark to-dark-olive border-r border-teal-accent/20 z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 pt-16 lg:pt-0`}
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

        <nav className="p-4 space-y-1">
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

        <div className="absolute bottom-6 left-4 right-4 space-y-2">
          <Link
            to="/admin/login"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-destructive text-white rounded-xl hover:bg-destructive/90 transition-colors shadow-md"
          >
            <span>Logout</span>
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-4 py-3 border border-teal-accent/30 text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <span>Back to Store</span>
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

import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { AdminGuard } from "./components/AdminGuard";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import { ProductDetailsPage } from "./pages/ProductDetailsPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { MyOrdersPage } from "./pages/MyOrdersPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminCustomers } from "./pages/admin/AdminCustomers";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminInventory } from "./pages/admin/AdminInventory";
import { AdminCoupons } from "./pages/admin/AdminCoupons";
import { AdminRoles } from "./pages/admin/AdminRoles";
import { AdminAccounts } from "./pages/admin/AdminAccounts";
import { AdminShipping } from "./pages/admin/AdminShipping";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "products", Component: ProductsPage },
      { path: "products/:id", Component: ProductDetailsPage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "about", Component: AboutPage },
      { path: "contact", Component: ContactPage },
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "forgot-password", Component: ForgotPasswordPage },
      { path: "favorites", Component: FavoritesPage },
      { path: "my-orders", Component: MyOrdersPage },
    ],
  },

  {
    path: "/admin/login",
    Component: AdminLoginPage,
  },
  {
    path: "/admin",
    element: <AdminGuard><AdminLayout /></AdminGuard>,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "orders", Component: AdminOrders },
      { path: "products", Component: AdminProducts },
      { path: "customers", Component: AdminCustomers },
      { path: "analytics", Component: AdminAnalytics },
      { path: "inventory", Component: AdminInventory },
      { path: "coupons", Component: AdminCoupons },
      { path: "roles", Component: AdminRoles },
      { path: "accounts", Component: AdminAccounts },
      { path: "shipping", Component: AdminShipping },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);

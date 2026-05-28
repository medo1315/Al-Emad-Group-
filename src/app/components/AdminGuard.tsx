import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

/**
 * Protects admin routes - redirects non-admin users to admin login page.
 * Renders children only if the user is authenticated AND has the Admin role.
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();

  // Still loading auth state - show nothing to avoid flash
  if (loading) {
    return null;
  }

  // Not logged in at all → go to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but not an Admin → go to admin login with a message
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // User is an authenticated Admin → allow access
  return <>{children}</>;
}

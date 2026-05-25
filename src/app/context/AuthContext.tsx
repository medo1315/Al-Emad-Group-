import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "../config";
import { useLanguage } from "./LanguageContext";
import { translateError } from "../utils/errorTranslator";

interface User {
  token: string;
  email: string;
  fullName: string;
  roles: string[];
  expiresAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (fullName: string, email: string, password: string) => Promise<boolean>;
  registerAdmin: (fullName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_API_URL = `${API_BASE_URL}/account`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const isRtl = language === "ar";

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("al_emad_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        // Check if token is expired
        if (new Date(parsedUser.expiresAt) > new Date()) {
          setUser(parsedUser);
        } else {
          localStorage.removeItem("al_emad_user");
        }
      } catch (e) {
        localStorage.removeItem("al_emad_user");
      }
    }
    setLoading(false);
  }, []);

  // Global fetch interceptor to catch "user not found" errors and redirect to login
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init);
      
      if (!response.ok) {
        try {
          const clone = response.clone();
          const data = await clone.json();
          const errorMsg = (data.message || "").toLowerCase();
          
          if (errorMsg.includes("user not found") || errorMsg.includes("usernotfound")) {
            // Clear auth state
            setUser(null);
            localStorage.removeItem("al_emad_user");
            
            // Show toast message
            toast.error(
              isRtl 
                ? "انتهت الجلسة أو المستخدم غير موجود. يرجى تسجيل الدخول مرة أخرى." 
                : "Session expired or user not found. Please log in again."
            );
            
            // Redirect to login page if not already on an auth or password recovery page
            const currentPath = window.location.pathname;
            const isAuthPage = 
              currentPath === "/login" || 
              currentPath === "/register" || 
              currentPath === "/forgot-password" || 
              currentPath === "/admin/login";

            if (!isAuthPage) {
              if (currentPath.startsWith("/admin")) {
                window.location.href = "/admin/login";
              } else {
                window.location.href = "/login";
              }
            }
          }
        } catch (e) {
          // If response body is not JSON or does not have a message, ignore
        }
      }
      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isRtl]);


  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(translateError(data.message || "Login failed. Please check credentials.", isRtl));
      }

      const userData: User = {
        token: data.token,
        email: data.email,
        fullName: data.fullName,
        roles: data.roles,
        expiresAt: data.expiresAt,
      };

      setUser(userData);
      localStorage.setItem("al_emad_user", JSON.stringify(userData));
      return true;
    } catch (error: any) {
      toast.error(error.message || translateError("Connection to server failed.", isRtl));
      return false;
    }
  };

  const register = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${AUTH_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(translateError(data.message || "Registration failed.", isRtl));
      }

      const userData: User = {
        token: data.token,
        email: data.email,
        fullName: data.fullName,
        roles: data.roles,
        expiresAt: data.expiresAt,
      };

      setUser(userData);
      localStorage.setItem("al_emad_user", JSON.stringify(userData));
      return true;
    } catch (error: any) {
      toast.error(error.message || translateError("Connection to server failed.", isRtl));
      return false;
    }
  };

  const registerAdmin = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${AUTH_API_URL}/register-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(translateError(data.message || "Admin registration failed.", isRtl));
      }

      const userData: User = {
        token: data.token,
        email: data.email,
        fullName: data.fullName,
        roles: data.roles,
        expiresAt: data.expiresAt,
      };

      setUser(userData);
      localStorage.setItem("al_emad_user", JSON.stringify(userData));
      return true;
    } catch (error: any) {
      toast.error(error.message || translateError("Connection to server failed.", isRtl));
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("al_emad_user");
    toast.success(isRtl ? "تم تسجيل الخروج بنجاح" : "Logged out successfully");
  };

  const isAuthenticated = !!user;
  const isAdmin = user ? user.roles.includes("Admin") : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        registerAdmin,
        logout,
        isAuthenticated,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

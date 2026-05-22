import { RouterProvider } from "react-router";
import { router } from "./routes";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { FavoriteProvider } from "./context/FavoriteContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <FavoriteProvider>
            <RouterProvider router={router} />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#FAF8F3",
                  border: "1px solid #6B7A3E",
                  color: "#2D3319",
                },
              }}
            />
          </FavoriteProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
import { Outlet, useLocation } from "react-router";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { PageLoader } from "../components/PageLoader";

export function RootLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-dark-olive to-petroleum-dark text-white">
      <PageLoader />
      <Navbar />
      <main key={location.pathname} className="flex-1 pb-24 lg:pb-0 animate-page-fade-in flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}


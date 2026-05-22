import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import logoImage from "../../imports/logo.png";
import { toast } from "sonner";

export function LoginPage() {
  const { t, language } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const isRtl = language === "ar";
  const searchParams = new URLSearchParams(window.location.search);
  const redirectParam = searchParams.get("redirect");
  const registerLink = redirectParam ? "/register?redirect=" + redirectParam : "/register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(formData.email, formData.password);
    setLoading(false);

    if (success) {
      toast.success(isRtl ? "تم تسجيل الدخول بنجاح!" : "Logged in successfully!");
      
      // Let's retrieve user role to redirect appropriately
      const savedUser = localStorage.getItem("al_emad_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.roles && parsed.roles.includes("Admin")) {
            navigate("/admin");
            return;
          }
        } catch (e) {
          // Fallback to home
        }
      }

      const searchParams = new URLSearchParams(window.location.search);
      const redirectPath = searchParams.get("redirect");
      if (redirectPath) {
        navigate("/" + redirectPath);
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen bg-petroleum-blue/30 backdrop-blur-sm py-12 flex items-center justify-center">
      <div className="max-w-md w-full px-4 sm:px-6">
        <div className="text-center mb-8">
          <Link to="/">
            <img
              src={logoImage}
              alt="AL EMAD GROUP"
              className="w-20 h-20 mx-auto mb-4 object-contain hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="font-display text-4xl text-white mb-2">
            {t("loginWelcome")}
          </h1>
          <p className="text-sage-green-light">
            {t("loginSubtitle")}
          </p>
        </div>

        <div className="bg-petroleum-blue/30 backdrop-blur-sm rounded-3xl p-8 border border-teal-accent/30 shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-olive-green/10 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-white mb-2">{t("loginEmail")}</label>
              <div className="relative">
                <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-sage-green-light`} />
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 text-white font-sans placeholder-white/30 disabled:opacity-50`}
                  placeholder={t("loginPlaceholderEmail")}
                />
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">{t("loginPassword")}</label>
              <div className="relative">
                <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-sage-green-light`} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full ${isRtl ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 text-white font-sans placeholder-white/30 disabled:opacity-50`}
                  placeholder={t("loginPlaceholderPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-sage-green-light hover:text-teal-accent`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="w-4 h-4 rounded border-teal-accent/30 text-teal-accent focus:ring-olive-green bg-dark-olive/50"
                />
                <span className="text-sm text-white/90">{t("loginRemember")}</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-teal-accent hover:text-white transition-colors">
                {t("loginForgot")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-olive-green text-white rounded-full hover:bg-dark-olive transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                t("login")
              )}
            </button>
          </form>

          <div className="mt-6 text-center relative z-10">
            <p className="text-sage-green-light">
              {t("loginDontHave")}{" "}
              <Link to={registerLink} className="text-teal-accent hover:text-white font-semibold transition-colors">
                {t("loginCreateOne")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

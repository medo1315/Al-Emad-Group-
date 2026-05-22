import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import logoImage from "../../imports/logo.png";
import { toast } from "sonner";

export function RegisterPage() {
  const { t, language } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const isRtl = language === "ar";
  const searchParams = new URLSearchParams(window.location.search);
  const redirectParam = searchParams.get("redirect");
  const loginLink = redirectParam ? "/login?redirect=" + redirectParam : "/login";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error(isRtl ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error(isRtl ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }

    if (!/\d/.test(formData.password)) {
      toast.error(isRtl ? "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل (0-9)" : "Password must contain at least one digit (0-9)");
      return;
    }

    if (!formData.terms) {
      toast.error(isRtl ? "يجب الموافقة على الشروط والأحكام" : "You must agree to the terms and conditions");
      return;
    }

    setLoading(true);
    const success = await register(formData.name, formData.email, formData.password);
    setLoading(false);

    if (success) {
      toast.success(isRtl ? "تم إنشاء الحساب بنجاح!" : "Account created successfully!");
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
            {t("registerTitle")}
          </h1>
          <p className="text-sage-green-light">
            {t("registerSubtitle")}
          </p>
        </div>

        <div className="bg-petroleum-blue/30 backdrop-blur-sm rounded-3xl p-8 border border-teal-accent/30 shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-olive-green/10 rounded-full blur-3xl pointer-events-none" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-white mb-2">{t("registerFullName")}</label>
              <div className="relative">
                <User className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-sage-green-light`} />
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 text-white font-sans placeholder-white/30 disabled:opacity-50`}
                  placeholder={t("registerPlaceholderName")}
                />
              </div>
            </div>

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
                  placeholder={t("registerPlaceholderPassword")}
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

            <div>
              <label className="block text-white mb-2">{t("registerConfirmPassword")}</label>
              <div className="relative">
                <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-sage-green-light`} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 text-white font-sans placeholder-white/30 disabled:opacity-50`}
                  placeholder={t("registerPlaceholderConfirm")}
                />
              </div>
            </div>

            <label className="flex items-start gap-2 cursor-pointer relative z-10">
              <input
                type="checkbox"
                required
                disabled={loading}
                checked={formData.terms}
                onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                className="w-4 h-4 mt-1 rounded border-teal-accent/30 text-teal-accent focus:ring-olive-green bg-dark-olive/50"
              />
              <span className="text-sm text-white/90">
                {t("registerAgree")}{" "}
                <Link to="#" className="text-teal-accent hover:text-white transition-colors">
                  {t("registerTerms")}
                </Link>{" "}
                {t("registerAnd")}{" "}
                <Link to="#" className="text-teal-accent hover:text-white transition-colors">
                  {t("registerPrivacy")}
                </Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-olive-green text-white rounded-full hover:bg-dark-olive transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                t("register")
              )}
            </button>
          </form>

          <div className="mt-6 text-center relative z-10">
            <p className="text-sage-green-light">
              {t("registerAlready")}{" "}
              <Link to={loginLink} className="text-teal-accent hover:text-white font-semibold transition-colors">
                {t("registerSignIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Mail, Lock, Eye, EyeOff, Shield, Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import logoImage from "../../imports/logo.png";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { language } = useLanguage();
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const isRtl = language === "ar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(formData.email, formData.password);
    
    if (success) {
      // Check if user has Admin role
      const savedUser = localStorage.getItem("al_emad_user");
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.roles && parsed.roles.includes("Admin")) {
            toast.success(isRtl ? "مرحباً بك مجدداً في لوحة التحكم!" : "Welcome back to the dashboard!");
            navigate("/admin");
            setIsLoading(false);
            return;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      // If we reached here, the login was successful but they are not an Admin!
      toast.error(isRtl ? "عذراً، هذا الحساب غير مصرح له بدخول لوحة التحكم." : "Access denied. Admin privileges required.");
    }
    
    setIsLoading(false);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-dark-olive via-olive-green to-sage-green flex items-center justify-center py-12 px-4 relative overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-sage-green/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-light-olive/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-accent/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8 animate-fade-in-blur">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-petroleum-blue/30 backdrop-blur-md border border-teal-accent/30 rounded-full shadow-2xl mb-6 hover:scale-105 transition-transform duration-300">
            <img
              src={logoImage}
              alt="AL EMAD GROUP"
              className="w-18 h-18 object-contain"
            />
          </div>
          <h1 className="font-display text-4xl text-white mb-2 tracking-wide">
            {isRtl ? "بوابة الإدارة" : "Admin Portal"}
          </h1>
          <p className="text-sage-green-light text-lg">
            {isRtl ? "لوحة تحكم مجموعة العماد" : "AL EMAD GROUP Dashboard"}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-petroleum-blue/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-teal-accent/30 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-olive-green/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-teal-accent/20 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-olive-green to-sage-green rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-2xl text-white">
                {isRtl ? "تسجيل دخول آمن" : "Secure Login"}
              </h2>
              <p className="text-sm text-sage-green-light">
                {isRtl ? "للمسؤولين المصرح لهم فقط" : "Authorized administrator access only"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div>
              <label className="block text-white mb-2 font-medium">
                {isRtl ? "البريد الإلكتروني" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-sage-green-light`} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 text-white transition-all placeholder:text-white/30`}
                  placeholder={isRtl ? "أدخل بريدك الإلكتروني" : "Enter your email address"}
                />
              </div>
            </div>

            <div>
              <label className="block text-white mb-2 font-medium">
                {isRtl ? "كلمة المرور" : "Password"}
              </label>
              <div className="relative">
                <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-sage-green-light`} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full ${isRtl ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 text-white transition-all placeholder:text-white/30`}
                  placeholder={isRtl ? "أدخل كلمة المرور" : "Enter your password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-sage-green-light hover:text-teal-accent transition-colors`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                  className="w-4 h-4 rounded border-teal-accent/30 text-olive-green focus:ring-olive-green bg-dark-olive/50"
                />
                <span className="text-sm text-sage-green-light">
                  {isRtl ? "تذكرني" : "Remember me"}
                </span>
              </label>
              <button 
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-teal-accent hover:text-white transition-colors"
              >
                {isRtl ? "نسيت كلمة المرور؟" : "Forgot password?"}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 flex items-center justify-center gap-2 rounded-full font-semibold bg-olive-green text-white hover:bg-dark-olive transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isRtl ? "جاري التحقق..." : "Authenticating..."}
                </>
              ) : (
                isRtl ? "تسجيل الدخول" : "Sign In"
              )}
            </button>
          </form>

          {/* Secure Note */}
          <div className="mt-6 pt-6 border-t border-teal-accent/25 relative z-10 flex items-center justify-center gap-2 text-xs text-sage-green-light">
            <Shield className="w-4 h-4 text-teal-accent" />
            <span>
              {isRtl 
                ? "محمي باتصال مشفر بالكامل ومطابق لمعايير الأمان المؤسسية" 
                : "Protected by enterprise-grade secure SSL connection"}
            </span>
          </div>

        </div>

        {/* Back to Store */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-white hover:text-sage-green-light transition-colors text-sm flex items-center justify-center gap-1 mx-auto"
          >
            {isRtl ? (
              <>
                <span>العودة للمتجر الرئيسي</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <ArrowLeft className="w-4 h-4" />
                <span>Back to main store</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

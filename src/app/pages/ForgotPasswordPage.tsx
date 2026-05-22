import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { useLanguage } from "../context/LanguageContext";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import logoImage from "../../imports/logo.png";
import { toast } from "sonner";
import { API_BASE_URL } from "../config";
import { translateError } from "../utils/errorTranslator";

type Step = "EMAIL" | "OTP" | "NEW_PASSWORD" | "SUCCESS";

export function ForgotPasswordPage() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<Step>("EMAIL");
  
  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Refs for OTP inputs to handle auto-focus
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Count down timer for Resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const isRtl = language === "ar";

  // Step 1: Submit Email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/account/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(translateError(data.message || "Failed to send reset code.", isRtl));
      }

      setStep("OTP");
      setResendTimer(30);
      toast.success(t("forgotOtpSentToast"));
    } catch (error: any) {
      toast.error(error.message || translateError("Connection failed.", isRtl));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP Input navigation
  const handleOtpChange = (value: string, index: number) => {
    // Only accept numeric inputs
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1); // keep last char
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const codeArray = pastedData.split("");
    setOtp(codeArray);
    otpRefs.current[5]?.focus();
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      toast.error(isRtl ? "يرجى إدخال الرمز كاملاً" : "Please enter the full code");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/account/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredOtp }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(translateError(data.message || "Invalid OTP code.", isRtl));
      }

      setStep("NEW_PASSWORD");
    } catch (error: any) {
      toast.error(error.message || translateError("OTP verification failed.", isRtl));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/account/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(translateError(data.message || "Failed to resend OTP.", isRtl));
      }

      setResendTimer(30);
      setOtp(["", "", "", "", "", ""]);
      otpRefs.current[0]?.focus();
      toast.success(t("forgotOtpSentToast"));
    } catch (error: any) {
      toast.error(error.message || translateError("Resend failed.", isRtl));
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error(isRtl ? "يجب أن تكون كلمة المرور 6 أحرف على الأقل" : "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(isRtl ? "كلمتا المرور غير متطابقتين" : "Passwords do not match");
      return;
    }

    setLoading(true);
    const enteredOtp = otp.join("");

    try {
      const response = await fetch(`${API_BASE_URL}/account/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredOtp, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(translateError(data.message || "Reset password failed.", isRtl));
      }

      setStep("SUCCESS");
      toast.success(t("forgotSuccessToast"));
    } catch (error: any) {
      toast.error(error.message || translateError("Reset password failed.", isRtl));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-petroleum-blue/30 backdrop-blur-sm py-12 flex items-center justify-center">
      <div className="max-w-md w-full px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <img
              src={logoImage}
              alt="AL EMAD GROUP"
              className="w-20 h-20 mx-auto mb-4 object-contain hover:scale-105 transition-transform"
            />
          </Link>
          <h1 className="font-display text-4xl text-white mb-2">
            {step === "EMAIL" && t("forgotTitle")}
            {step === "OTP" && t("forgotOtpTitle")}
            {step === "NEW_PASSWORD" && t("forgotNewPassTitle")}
            {step === "SUCCESS" && t("forgotSuccessTitle")}
          </h1>
          <p className="text-sage-green-light px-2">
            {step === "EMAIL" && t("forgotSubtitle")}
            {step === "OTP" && t("forgotOtpSubtitle")}
            {step === "NEW_PASSWORD" && t("forgotNewPassSubtitle")}
            {step === "SUCCESS" && t("forgotSuccessDesc")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-petroleum-blue/30 backdrop-blur-sm rounded-3xl p-8 border border-teal-accent/30 shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-olive-green/10 rounded-full blur-3xl pointer-events-none" />

          {/* STEP 1: Enter Email */}
          {step === "EMAIL" && (
            <form onSubmit={handleEmailSubmit} className="space-y-6 relative z-10">
              <div>
                <label className="block text-white mb-2">{t("loginEmail")}</label>
                <div className="relative">
                  <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-sage-green-light`} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 text-white font-sans placeholder-white/30`}
                    placeholder={t("loginPlaceholderEmail")}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-olive-green text-white rounded-full hover:bg-dark-olive transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  t("forgotBtn")
                )}
              </button>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-teal-accent hover:text-white transition-colors text-sm"
                >
                  {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  <span>{t("forgotBackToLogin")}</span>
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Enter Verification Code */}
          {step === "OTP" && (
            <form onSubmit={handleOtpVerify} className="space-y-6 relative z-10">
              <div>
                <label className="block text-white mb-3 text-center">{isRtl ? "رمز التحقق" : "Verification Code"}</label>
                <div className="flex gap-2 justify-center dir-ltr" style={{ direction: "ltr" }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-12 h-12 text-center text-xl font-bold text-white bg-dark-olive/50 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green transition-all"
                      required
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-olive-green text-white rounded-full hover:bg-dark-olive transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  t("forgotOtpVerifyBtn")
                )}
              </button>

              <div className="text-center space-y-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className="text-xs text-teal-accent hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-teal-accent"
                >
                  {resendTimer > 0
                    ? `${isRtl ? "إعادة الإرسال خلال" : "Resend in"} ${resendTimer}s`
                    : t("forgotOtpResend")}
                </button>

                <div>
                  <button
                    type="button"
                    onClick={() => setStep("EMAIL")}
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs"
                  >
                    {isRtl ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                    <span>{isRtl ? "تغيير البريد الإلكتروني" : "Change email address"}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: Create New Password */}
          {step === "NEW_PASSWORD" && (
            <form onSubmit={handleResetPassword} className="space-y-6 relative z-10">
              <div>
                <label className="block text-white mb-2">{isRtl ? "كلمة المرور الجديدة" : "New Password"}</label>
                <div className="relative">
                  <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-sage-green-light`} />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full ${isRtl ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 text-white font-sans placeholder-white/30`}
                    placeholder={t("forgotNewPassPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-sage-green-light hover:text-teal-accent`}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">{isRtl ? "تأكيد كلمة المرور" : "Confirm Password"}</label>
                <div className="relative">
                  <KeyRound className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-sage-green-light`} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full ${isRtl ? 'pr-12 pl-12' : 'pl-12 pr-12'} py-3 rounded-xl border border-teal-accent/30 focus:outline-none focus:ring-2 focus:ring-olive-green bg-dark-olive/50 text-white font-sans placeholder-white/30`}
                    placeholder={t("forgotConfirmPassPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-sage-green-light hover:text-teal-accent`}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-olive-green text-white rounded-full hover:bg-dark-olive transition-all shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  t("forgotResetBtn")
                )}
              </button>
            </form>
          )}

          {/* STEP 4: Success feedback */}
          {step === "SUCCESS" && (
            <div className="text-center py-6 relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-teal-accent/10 border border-teal-accent/30 flex items-center justify-center mb-6 animate-bounce">
                <CheckCircle2 className="w-8 h-8 text-teal-accent" />
              </div>
              
              <Link
                to="/login"
                className="w-full py-4 bg-olive-green text-white rounded-full hover:bg-dark-olive transition-all shadow-lg hover:shadow-xl font-semibold block"
              >
                {t("forgotBackToLogin")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

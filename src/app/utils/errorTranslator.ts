/**
 * Utility to translate backend API error messages to Arabic when in RTL mode.
 */
export function translateError(errorMsg: string, isRtl: boolean): string {
  if (!isRtl || !errorMsg) return errorMsg;

  const msg = errorMsg.toLowerCase();

  // 1. Duplicate / Registration Errors
  if (msg.includes("already registered") || msg.includes("already taken") || msg.includes("duplicateemail")) {
    return "البريد الإلكتروني مسجل بالفعل لدينا.";
  }

  // 2. Password Strength Rules
  if (msg.includes("must be at least 6 characters") || msg.includes("passwordtooshort")) {
    return "يجب أن تكون كلمة المرور من 6 خانات على الأقل.";
  }
  if (msg.includes("must have at least one digit") || msg.includes("passwordrequiresdigit")) {
    return "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل (0-9).";
  }
  if (msg.includes("must have at least one non alphanumeric character") || msg.includes("passwordrequiresnonalphanumeric")) {
    return "يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (مثل @، #، $).";
  }
  if (msg.includes("must have at least one uppercase") || msg.includes("passwordrequiresupper")) {
    return "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل (A-Z).";
  }
  if (msg.includes("must have at least one lowercase") || msg.includes("passwordrequireslower")) {
    return "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل (a-z).";
  }

  // 3. Login & Authentication Errors
  if (msg.includes("invalid email or password")) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
  }
  if (msg.includes("email address not registered")) {
    return "البريد الإلكتروني هذا غير مسجل لدينا.";
  }
  if (msg.includes("invalid or expired otp code")) {
    return "رمز التحقق غير صحيح أو انتهت صلاحيته.";
  }
  if (msg.includes("user not found")) {
    return "المستخدم غير موجود.";
  }
  
  // 4. Password Reset Errors
  if (msg.includes("password reset failed") || msg.includes("invalidtoken")) {
    return "فشلت عملية إعادة تعيين كلمة المرور. يرجى طلب رمز جديد.";
  }

  // 5. Registration failed wrapper handling
  if (msg.includes("registration failed:")) {
    const details = errorMsg.replace(/registration failed:/i, "").trim();
    // Split multiple errors if they are comma separated
    const translatedDetails = details
      .split(",")
      .map((err) => translateError(err.trim(), true))
      .join(" و ");
    return `فشل إنشاء الحساب: ${translatedDetails}`;
  }

  // Fallback if no translation matched
  return errorMsg;
}

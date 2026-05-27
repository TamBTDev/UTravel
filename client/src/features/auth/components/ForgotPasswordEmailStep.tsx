import { useState } from "react";
import { Alert } from "@mantine/core";
import { IconAlertCircle, IconMail, IconArrowRight, IconLock } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { sendForgotPasswordOtp, clearError } from "@/app/store/authSlice";

export const ForgotPasswordEmailStep = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setEmailError("Email là bắt buộc");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Email không hợp lệ");
      return;
    }
    setEmailError("");
    dispatch(clearError());
    dispatch(sendForgotPasswordOtp(email));
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Icon Indicator */}
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <IconLock size={32} className="text-primary" />
      </div>

      {/* Headers */}
      <h1 className="text-headline text-on-surface mb-2 text-center font-bold">
        Đặt lại mật khẩu
      </h1>
      <p className="text-body text-on-surface-variant text-center mb-8 max-w-[320px]">
        Nhập email liên kết với tài khoản của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
      </p>

      {error && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          variant="light"
          className="w-full mb-6 rounded-lg"
        >
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="mb-6">
          <label
            className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1"
            htmlFor="forgot-email"
          >
            Địa chỉ Email
          </label>
          <div className="relative group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-outline group-focus-within:text-primary transition-colors">
              <IconMail size={20} />
            </span>
            <input
              id="forgot-email"
              name="email"
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
                if (error) dispatch(clearError());
              }}
              className={`w-full pl-11 pr-4 py-3.5 bg-surface-container-lowest border ${
                emailError ? "border-error" : "border-outline-variant"
              } rounded-lg text-body text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm`}
            />
          </div>
          {emailError && (
            <p className="text-xs text-error mt-1 ml-1">{emailError}</p>
          )}
        </div>

        <button
          id="forgot-send-otp-btn"
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold rounded-lg py-3.5 px-4 transition-colors shadow-sm flex items-center justify-center gap-1.5 h-[52px]"
        >
          {isLoading ? (
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
          ) : (
            <>
              <span>Gửi mã OTP</span>
              <IconArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

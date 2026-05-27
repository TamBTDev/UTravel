import { useState } from "react";
import { PasswordInput, Alert } from "@mantine/core";
import { IconAlertCircle, IconLock, IconArrowRight } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { resetPasswordWithOtp, clearError } from "@/app/store/authSlice";

interface Props {
  otpCode: string;
}

export const ForgotPasswordNewStep = ({ otpCode }: Props) => {
  const dispatch = useAppDispatch();
  const {
    forgotEmail: email,
    isLoading,
    error,
  } = useAppSelector((s) => s.auth);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formErrors, setFormErrors] = useState<{
    new?: string;
    confirm?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};
    if (newPassword.length < 6) errors.new = "Mật khẩu phải có ít nhất 6 ký tự";
    if (newPassword !== confirmPassword) errors.confirm = "Mật khẩu không khớp";
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    dispatch(clearError());
    dispatch(resetPasswordWithOtp({ email, otpCode, newPassword }));
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Icon Indicator */}
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <IconLock size={32} className="text-primary" />
      </div>

      {/* Headers */}
      <h1 className="text-headline text-on-surface mb-2 text-center font-bold">
        Mật khẩu mới
      </h1>
      <p className="text-body text-on-surface-variant text-center mb-8 max-w-[320px]">
        Đặt lại mật khẩu mới bảo mật cho tài khoản của bạn.
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
        <div className="mb-4">
          <label
            className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1"
            htmlFor="new-password"
          >
            Mật khẩu mới
          </label>
          <PasswordInput
            id="new-password-input"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (formErrors.new) setFormErrors((prev) => ({ ...prev, new: undefined }));
              if (error) dispatch(clearError());
            }}
            error={formErrors.new}
            size="md"
            classNames={{
              input: "h-[50px] bg-surface-container-lowest focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all rounded-lg",
            }}
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1"
            htmlFor="confirm-password"
          >
            Xác nhận mật khẩu
          </label>
          <PasswordInput
            id="confirm-password-input"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (formErrors.confirm) setFormErrors((prev) => ({ ...prev, confirm: undefined }));
              if (error) dispatch(clearError());
            }}
            error={formErrors.confirm}
            size="md"
            classNames={{
              input: "h-[50px] bg-surface-container-lowest focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all rounded-lg",
            }}
          />
        </div>

        <button
          id="reset-password-btn"
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold rounded-lg py-3.5 px-4 transition-colors shadow-sm flex items-center justify-center gap-1.5 h-[52px]"
        >
          {isLoading ? (
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
          ) : (
            <>
              <span>Đặt lại mật khẩu</span>
              <IconArrowRight size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

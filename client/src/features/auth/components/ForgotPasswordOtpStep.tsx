import { useState } from "react";
import { PinInput, Alert } from "@mantine/core";
import { IconAlertCircle, IconKey, IconArrowRight } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { setForgotStep, clearError, verifyForgotPasswordOtp } from "@/app/store/authSlice";

interface Props {
  onOtpConfirmed: (otp: string) => void;
}

export const ForgotPasswordOtpStep = ({ onOtpConfirmed }: Props) => {
  const dispatch = useAppDispatch();
  const { forgotEmail, isLoading, error } = useAppSelector((s) => s.auth);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError("Vui lòng nhập đủ 6 chữ số");
      return;
    }
    setOtpError("");
    dispatch(clearError());
    dispatch(verifyForgotPasswordOtp({ email: forgotEmail, otpCode: otp }))
      .unwrap()
      .then(() => {
        onOtpConfirmed(otp);
      })
      .catch(() => {
        // Error is stored in authSlice and automatically displayed in Alert
      });
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Icon Indicator */}
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <IconKey size={32} className="text-primary" />
      </div>

      {/* Headers */}
      <h1 className="text-headline text-on-surface mb-2 text-center font-bold">
        Nhập mã OTP
      </h1>
      <p className="text-body text-on-surface-variant text-center mb-8 max-w-[320px]">
        Mã xác thực đã được gửi đến email <strong className="text-on-surface font-semibold">{forgotEmail}</strong>.
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
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center w-full">
          <PinInput
            id="forgot-otp-input"
            length={6}
            type="number"
            size="md"
            value={otp}
            onChange={(val) => {
              setOtp(val);
              if (otpError) setOtpError("");
              if (error) dispatch(clearError());
            }}
            error={!!otpError}
            classNames={{
              input: "focus:border-primary focus:ring-2 focus:ring-primary/20",
            }}
          />
          {otpError && (
            <p className="text-xs text-error mt-2 text-center">{otpError}</p>
          )}
        </div>

        <button
          id="forgot-verify-otp-btn"
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-hover text-white font-bold rounded-lg py-3.5 px-4 transition-colors shadow-sm flex items-center justify-center gap-1.5 h-[52px] mb-4"
        >
          {isLoading ? (
            <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
          ) : (
            <>
              <span>Xác nhận OTP</span>
              <IconArrowRight size={20} />
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            dispatch(setForgotStep("email"));
            dispatch(clearError());
          }}
          className="text-body-bold text-primary hover:underline transition-colors font-semibold"
        >
          Dùng email khác
        </button>
      </form>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Alert } from "@mantine/core";
import {
  IconArrowLeft,
  IconAlertCircle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { AppLayout } from "@/components/layout";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { resetForgotFlow, setForgotStep } from "@/app/store/authSlice";
import { ForgotPasswordEmailStep } from "../components/ForgotPasswordEmailStep";
import { ForgotPasswordOtpStep } from "../components/ForgotPasswordOtpStep";
import { ForgotPasswordNewStep } from "../components/ForgotPasswordNewStep";

export const ForgotPasswordPage = () => {
  const dispatch = useAppDispatch();
  const { forgotStep: step } = useAppSelector((s) => s.auth);
  const [confirmedOtp, setConfirmedOtp] = useState("");

  useEffect(
    () => () => {
      dispatch(resetForgotFlow());
    },
    [dispatch],
  );

  return (
    <AppLayout withContainer={false}>
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4 md:px-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-container-low via-surface-bright to-surface-bright relative min-h-[calc(100vh-140px)] overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="w-full max-w-[460px] z-10">
          <Alert
            mb="lg"
            color="blue"
            title="Lưu ý phát triển"
            icon={<IconAlertCircle size={16} />}
            className="rounded-lg shadow-sm"
          >
            Đang trong quá trình phát triển, tạm thời nhận mã OTP tại terminal
            của Server (Ethereal Email preview).
          </Alert>

          {/* Form Card */}
          <div className="bg-white dark:bg-inverse-surface rounded-xl border border-hairline dark:border-outline-variant shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>

            <div className="p-8 md:p-10 flex flex-col">
              {step === "email" && <ForgotPasswordEmailStep />}
              {step === "otp" && (
                <ForgotPasswordOtpStep
                  onOtpConfirmed={(otp) => {
                    setConfirmedOtp(otp);
                    dispatch(setForgotStep("newPassword"));
                  }}
                />
              )}
              {step === "newPassword" && (
                <ForgotPasswordNewStep otpCode={confirmedOtp} />
              )}
              {step === "success" && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                    <IconCircleCheck size={36} className="text-secondary" />
                  </div>
                  <h1 className="text-headline text-on-surface mb-2">
                    Thành công!
                  </h1>
                  <p className="text-body text-on-surface-variant mb-8 max-w-[320px]">
                    Mật khẩu của bạn đã được thay đổi. Hãy đăng nhập với mật
                    khẩu mới.
                  </p>
                  <Link
                    to="/login"
                    onClick={() => dispatch(resetForgotFlow())}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-bold rounded-lg py-3.5 px-4 text-center transition-colors shadow-sm block h-[52px] flex items-center justify-center"
                  >
                    Đăng nhập ngay
                  </Link>
                </div>
              )}
            </div>
          </div>

          {step !== "success" && (
            <div className="mt-6 text-center">
              <Link
                to="/login"
                onClick={() => dispatch(resetForgotFlow())}
                className="inline-flex items-center gap-1.5 text-ocean-slate hover:text-primary font-semibold transition-colors group"
              >
                <IconArrowLeft
                  size={18}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Quay lại đăng nhập
              </Link>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
};

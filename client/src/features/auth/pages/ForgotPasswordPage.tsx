import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Paper,
  Stack,
  ThemeIcon,
  Title,
  Text,
  Button,
  Box,
  Stepper,
  Alert,
} from "@mantine/core";
import { IconCheck, IconArrowLeft, IconAlertCircle } from "@tabler/icons-react";
import { AppLayout } from "../../../components/layout";
import { useAppDispatch, useAppSelector } from "../../../hooks/useAppStore";
import { resetForgotFlow } from "../../../app/store/authSlice";
import { ForgotPasswordEmailStep } from "../components/ForgotPasswordEmailStep";
import { ForgotPasswordOtpStep } from "../components/ForgotPasswordOtpStep";
import { ForgotPasswordNewStep } from "../components/ForgotPasswordNewStep";

const stepIndex: Record<string, number> = {
  email: 0,
  otp: 1,
  newPassword: 2,
  success: 3,
};

export const ForgotPasswordPage = () => {
  const dispatch = useAppDispatch();
  const { step } = useAppSelector((s) => s.auth);
  const [confirmedOtp, setConfirmedOtp] = useState("");

  // Reset khi rời trang
  useEffect(
    () => () => {
      dispatch(resetForgotFlow());
    },
    [dispatch],
  );

  return (
    <AppLayout withContainer={false}>
      <Box
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          opacity: 0.06,
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          height: 280,
          zIndex: -1,
        }}
      />

      <Container size="sm" py="xl">
        {/* Back to login */}
        <Button
          component={Link}
          to="/login"
          variant="subtle"
          color="dimmed"
          leftSection={<IconArrowLeft size={16} />}
          mb="md"
          onClick={() => dispatch(resetForgotFlow())}
        >
          Quay lại đăng nhập
        </Button>

        <Paper shadow="md" radius="lg" p="xl" withBorder>
          <Alert
            mb="xl"
            color="blue"
            title="Lưu ý phát triển"
            icon={<IconAlertCircle size={16} />}
          >
            Đang trong quá trình phát triển, tạm thời nhận mã OTP tại terminal
            của Server (Ethereal Email preview).
          </Alert>

          {step !== "success" ? (
            <Stack gap="xl">
              {/* Stepper progress */}
              <Stepper
                active={stepIndex[step]}
                size="sm"
                color="violet"
                completedIcon={<IconCheck size={14} />}
              >
                <Stepper.Step label="Email" description="Xác nhận tài khoản" />
                <Stepper.Step label="OTP" description="Nhập mã xác thực" />
                <Stepper.Step label="Mật khẩu" description="Đặt mật khẩu mới" />
              </Stepper>

              {/* Step content */}
              {step === "email" && <ForgotPasswordEmailStep />}
              {step === "otp" && (
                <ForgotPasswordOtpStep
                  onOtpConfirmed={(otp) => {
                    setConfirmedOtp(otp);
                    import("../../../app/store/authSlice").then(
                      ({ setForgotStep }) => {
                        /* eslint-disable-next-line */
                      },
                    );
                  }}
                />
              )}
              {step === "newPassword" && (
                <ForgotPasswordNewStep otpCode={confirmedOtp} />
              )}
            </Stack>
          ) : (
            // Success state
            <Stack align="center" gap="lg" py="md">
              <ThemeIcon
                size={80}
                radius="xl"
                variant="gradient"
                gradient={{ from: "teal", to: "green" }}
              >
                <IconCheck size={40} />
              </ThemeIcon>
              <div style={{ textAlign: "center" }}>
                <Title order={2} fw={700} mb="xs">
                  Thành công!
                </Title>
                <Text c="dimmed">
                  Mật khẩu của bạn đã được thay đổi. Hãy đăng nhập với mật khẩu
                  mới.
                </Text>
              </div>
              <Button
                component={Link}
                to="/login"
                variant="gradient"
                gradient={{ from: "teal", to: "green" }}
                size="md"
                onClick={() => dispatch(resetForgotFlow())}
              >
                Đăng nhập ngay
              </Button>
            </Stack>
          )}
        </Paper>
      </Container>
    </AppLayout>
  );
};

import { useState } from "react";
import {
  Button,
  PinInput,
  Stack,
  Text,
  Group,
  Center,
  Alert,
} from "@mantine/core";
import { AuthCard } from "./AuthCard";
import { useVerifyOtp } from "../hooks/useVerifyOtp";
import { Navigate } from "react-router-dom";
import { IconAlertCircle } from "@tabler/icons-react";

export const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const { email, userId, verifyOtp, isVerifying, resendOtp, isResending } =
    useVerifyOtp();

  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      verifyOtp(otp);
    }
  };

  return (
    <AuthCard>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 600 }}>
          Xác Thực Tài Khoản
        </h2>
        <Text c="dimmed" size="sm">
          Vui lòng nhập mã OTP 6 chữ số vừa được gửi đến email{" "}
          <Text span fw={600} c="dark">
            {email}
          </Text>
        </Text>
        <Alert
          mb="xl"
          color="blue"
          title="Lưu ý phát triển"
          icon={<IconAlertCircle size={16} />}
        >
          Đang trong quá trình phát triển, tạm thời nhận mã OTP tại terminal của
          Server (Ethereal Email preview).
        </Alert>
      </div>

      <form onSubmit={handleSubmit}>
        <Stack gap="xl">
          <Center>
            <PinInput
              length={6}
              value={otp}
              onChange={setOtp}
              disabled={isVerifying}
              size="lg"
              autoFocus
            />
          </Center>

          <Button
            type="submit"
            fullWidth
            loading={isVerifying}
            disabled={otp.length !== 6}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Xác Nhận OTP
          </Button>
        </Stack>
      </form>

      <Group justify="center" mt="xl">
        <Text size="sm" c="dimmed">
          Chưa nhận được mã?
        </Text>
        <Button
          variant="subtle"
          size="sm"
          loading={isResending}
          onClick={() => resendOtp()}
          style={{ padding: 0 }}
        >
          Gửi lại mã
        </Button>
      </Group>
    </AuthCard>
  );
};

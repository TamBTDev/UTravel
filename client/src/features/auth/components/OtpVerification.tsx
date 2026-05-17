import { useState } from "react";
import {
  Button,
  PinInput,
  Stack,
  Text,
  Group,
  Center,
  Alert,
  Container,
} from "@mantine/core";
import { AuthCard } from "./AuthCard";
import { useVerifyOtp } from "../hooks/useVerifyOtp";
import { Navigate } from "react-router-dom";
import { IconAlertCircle, IconMail } from "@tabler/icons-react";

export const OtpVerification = () => {
  const [otp, setOtp] = useState("");
  const { email, userId, verifyOtp, isVerifying, resendOtp, isResending } =
    useVerifyOtp();

  if (!userId) {
    return <Navigate to="/register" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      verifyOtp(otp);
    }
  };

  const displayEmail = email ? email : "của bạn";

  return (
    <AuthCard>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <h2 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 600 }}>
          🔐 Xác Thực Tài Khoản
        </h2>
        <Group justify="center" mb="md">
          <IconMail size={20} color="#667eea" />
          <Text c="dimmed" size="sm">
            Mã OTP đã được gửi đến:{" "}
            <Text span fw={600} c="dark">
              {displayEmail}
            </Text>
          </Text>
        </Group>
        <Alert
          mb="md"
          color="blue"
          title="💡 Hướng dẫn"
          icon={<IconAlertCircle size={16} />}
        >
          Nhập 6 chữ số mã OTP từ email hoặc console server. Mã có hiệu lực trong 10 phút.
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
              type="number"
            />
          </Center>

          <Button
            type="submit"
            fullWidth
            loading={isVerifying}
            disabled={otp.length !== 6 || isVerifying}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {isVerifying ? "Đang xác thực..." : "Xác Nhận OTP"}
          </Button>
        </Stack>
      </form>

      <Group justify="center" mt="xl" gap="xs">
        <Text size="sm" c="dimmed">
          Chưa nhận được mã?
        </Text>
        <Button
          variant="subtle"
          size="sm"
          loading={isResending}
          onClick={() => resendOtp()}
          style={{ padding: 0, height: "auto" }}
          disabled={isResending}
        >
          {isResending ? "Đang gửi..." : "Gửi lại mã"}
        </Button>
      </Group>
    </AuthCard>
  );
};

import { useState } from "react";
import {
  Button,
  PinInput,
  Stack,
  Text,
  Group,
  Center,
  Image,
} from "@mantine/core";

import { useVerifyOtp } from "../hooks/useVerifyOtp";
import { Navigate } from "react-router-dom";
import { IconMail } from "@tabler/icons-react";
import logo from "@/assets/logo.svg";

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
    <div style={{ padding: 0 }}>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <Center mb="lg">
          <Image src={logo} w={48} h={48} alt="UTravel" />
        </Center>

        <h2 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 700, color: "#0b63d6" }}>
          Xác Thực Tài Khoản
        </h2>
        <Group justify="center" mb="lg">
          <IconMail size={18} color="#6b7280" />
          <Text c="dimmed" size="sm">
            Mã OTP đã được gửi đến:{" "}
            <Text span fw={600} c="dark">
              {displayEmail}
            </Text>
          </Text>
        </Group>
        <Text c="dimmed" size="sm" mt="sm">
          Nhập 6 chữ số mã OTP từ email của bạn. Mã có hiệu lực trong 10 phút.
        </Text>
      </div>

      <form onSubmit={handleSubmit}>
        <Stack gap="xl">
          <Center>
            <PinInput
              length={6}
              value={otp}
              onChange={setOtp}
              disabled={isVerifying}
              size="xl"
              autoFocus
              type="number"
              styles={{
                input: {
                  backgroundColor: "#f8f9fa",
                  border: "1px solid #e5e7eb",
                  fontWeight: 600,
                  fontSize: 24,
                }
              }}
            />
          </Center>

          <Button
            type="submit"
            fullWidth
            loading={isVerifying}
            disabled={otp.length !== 6 || isVerifying}
            size="md"
            style={{
              backgroundColor: "#0b63d6",
              height: 46,
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
          style={{ padding: 0, height: "auto", color: "#0b63d6" }}
          disabled={isResending}
        >
          {isResending ? "Đang gửi..." : "Gửi lại mã"}
        </Button>
      </Group>
    </div>
  );
};

import { useState } from "react";
import {
  TextInput,
  Button,
  Stack,
  Text,
  Alert,
  Paper,
  Title,
  ThemeIcon,
  Group,
} from "@mantine/core";
import { IconMail, IconAlertCircle, IconSend } from "@tabler/icons-react";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../hooks/useAppStore";
import {
  sendForgotPasswordOtp,
  clearError,
} from "../../../app/store/authSlice";

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
    <Stack gap="lg">
      <Group gap="sm">
        <ThemeIcon size="lg" radius="md" variant="light" color="violet">
          <IconMail size={20} />
        </ThemeIcon>
        <div>
          <Title order={3} fw={600}>
            Quên mật khẩu
          </Title>
          <Text size="sm" c="dimmed">
            Nhập email để nhận mã OTP đặt lại mật khẩu
          </Text>
        </div>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            id="forgot-email"
            label="Email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={emailError}
            leftSection={<IconMail size={16} />}
            size="md"
          />
          <Button
            id="forgot-send-otp-btn"
            type="submit"
            loading={isLoading}
            leftSection={<IconSend size={16} />}
            fullWidth
            size="md"
            variant="gradient"
            gradient={{ from: "violet", to: "indigo" }}
          >
            Gửi mã OTP
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

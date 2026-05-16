import { useState } from "react";
import {
  PasswordInput,
  Button,
  Stack,
  Text,
  Alert,
  Title,
  ThemeIcon,
  Group,
} from "@mantine/core";
import { IconLock, IconAlertCircle } from "@tabler/icons-react";
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
    <Stack gap="lg">
      <Group gap="sm">
        <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
          <IconLock size={20} />
        </ThemeIcon>
        <div>
          <Title order={3} fw={600}>
            Mật khẩu mới
          </Title>
          <Text size="sm" c="dimmed">
            Đặt mật khẩu mới cho tài khoản của bạn
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
          <PasswordInput
            id="new-password-input"
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={formErrors.new}
            leftSection={<IconLock size={16} />}
            size="md"
          />
          <PasswordInput
            id="confirm-password-input"
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={formErrors.confirm}
            leftSection={<IconLock size={16} />}
            size="md"
          />
          <Button
            id="reset-password-btn"
            type="submit"
            loading={isLoading}
            fullWidth
            size="md"
            variant="gradient"
            gradient={{ from: "indigo", to: "violet" }}
          >
            Đặt lại mật khẩu
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

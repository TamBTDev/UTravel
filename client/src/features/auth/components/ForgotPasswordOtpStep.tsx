import { useState } from 'react';
import {
  PinInput,
  Button,
  Stack,
  Text,
  Alert,
  Title,
  ThemeIcon,
  Group,
  Anchor,
} from '@mantine/core';
import { IconShieldCheck, IconAlertCircle } from '@tabler/icons-react';
import { useAppDispatch, useAppSelector } from '../../../hooks/useAppStore';
import { setForgotStep, clearError } from '../../../app/store/authSlice';

interface Props {
  onOtpConfirmed: (otp: string) => void;
}

export const ForgotPasswordOtpStep = ({ onOtpConfirmed }: Props) => {
  const dispatch = useAppDispatch();
  const { email, isLoading, error } = useAppSelector((s) => s.auth);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError('Vui lòng nhập đủ 6 chữ số');
      return;
    }
    setOtpError('');
    dispatch(clearError());
    onOtpConfirmed(otp);
    dispatch(setForgotStep('newPassword'));
  };

  return (
    <Stack gap="lg">
      <Group gap="sm">
        <ThemeIcon size="lg" radius="md" variant="light" color="teal">
          <IconShieldCheck size={20} />
        </ThemeIcon>
        <div>
          <Title order={3} fw={600}>Nhập mã OTP</Title>
          <Text size="sm" c="dimmed">
            Mã đã được gửi đến <strong>{email}</strong>
          </Text>
        </div>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack gap="md" align="center">
          <PinInput
            id="forgot-otp-input"
            length={6}
            type="number"
            size="lg"
            value={otp}
            onChange={setOtp}
            error={!!otpError}
          />
          {otpError && (
            <Text size="xs" c="red">{otpError}</Text>
          )}

          <Button
            id="forgot-verify-otp-btn"
            type="submit"
            loading={isLoading}
            fullWidth
            size="md"
            variant="gradient"
            gradient={{ from: 'teal', to: 'cyan' }}
          >
            Xác nhận OTP
          </Button>

          <Anchor
            size="sm"
            onClick={() => {
              dispatch(setForgotStep('email'));
              dispatch(clearError());
            }}
            style={{ cursor: 'pointer' }}
          >
            ← Dùng email khác
          </Anchor>
        </Stack>
      </form>
    </Stack>
  );
};

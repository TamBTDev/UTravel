import { Title, Text, Stack, Divider } from '@mantine/core';

interface LoginHeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * Header component cho login form
 */
export const LoginHeader = ({
  title = 'Đăng nhập',
  subtitle = 'Nhập email và mật khẩu của bạn để tiếp tục',
}: LoginHeaderProps) => {
  return (
    <Stack gap="md" mb="lg">
      <div>
        <Title order={2} fw={700} mb="xs">
          {title}
        </Title>
        <Text size="sm" c="dimmed">
          {subtitle}
        </Text>
      </div>
      <Divider />
    </Stack>
  );
};

import { Group, Text, Center } from '@mantine/core';
import { Link } from 'react-router-dom';

interface AuthSignupLinkProps {
  action?: 'login' | 'register';
}

/**
 * Sign up / Sign in link component
 * Hiển thị link để chuyển hướng giữa login và register pages
 */
export const AuthSignupLink = ({ action = 'login' }: AuthSignupLinkProps) => {
  const isLogin = action === 'login';

  return (
    <Center>
      <Group gap={4}>
        <Text size="sm">
          {isLogin
            ? 'Bạn chưa có tài khoản?'
            : 'Bạn đã có tài khoản?'}
        </Text>
        <Link
          to={isLogin ? '/register' : '/login'}
          style={{ textDecoration: 'none' }}
        >
          <Text size="sm" c="blue" fw={500}>
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </Text>
        </Link>
      </Group>
    </Center>
  );
};

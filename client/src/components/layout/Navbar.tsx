import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Group,
  Button,
  Menu,
  Avatar,
  Text,
  Box,
  Burger,
  Drawer,
  Stack,
  Divider,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLogout, IconUser, IconDashboard } from '@tabler/icons-react';
import { useAuthContext } from '../../app/providers';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthContext();
  const [opened, { toggle, close }] = useDisclosure(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    close();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    close();
  };

  return (
    <>
      <Box
        component="header"
        h={70}
        style={{ borderBottom: '1px solid #e9ecef' }}
      >
        <Container size="xl" h="100%" px="md">
          <Group justify="space-between" align="center" h="100%">
            {/* Logo */}
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Group gap={8} wrap="nowrap">
                <Box
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '0.5rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                  }}
                >
                  ✈️
                </Box>
                <Text fw={700} size="lg" style={{ color: '#1a1a1a' }}>
                  UTravel
                </Text>
              </Group>
            </Link>

            {/* Desktop Navigation */}
            <Group gap="lg" visibleFrom="sm" component="nav">
              <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>
                <Text size="sm" fw={500} className="hover:text-blue-600">
                  Trang chủ
                </Text>
              </Link>
              <Link to="/hotels" style={{ textDecoration: 'none', color: '#555' }}>
                <Text size="sm" fw={500} className="hover:text-blue-600">
                  Khách sạn
                </Text>
              </Link>

              {isAuthenticated && (
                <Link to="/bookings" style={{ textDecoration: 'none', color: '#555' }}>
                  <Text size="sm" fw={500} className="hover:text-blue-600">
                    Đặt phòng của tôi
                  </Text>
                </Link>
              )}
            </Group>

            {/* User Menu / Auth Buttons */}
            <Group gap="md" wrap="nowrap">
              {isAuthenticated && user ? (
                <Menu shadow="md" position="bottom-end">
                  <Menu.Target>
                    <Button variant="subtle" p={0}>
                      <Group gap={8} wrap="nowrap">
                        <Avatar
                          src={user.avatar}
                          alt={user.name}
                          radius="xl"
                          size="sm"
                          color="blue"
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Text size="sm" fw={500} hiddenFrom="xs">
                          {user.name.split(' ')[0]}
                        </Text>
                      </Group>
                    </Button>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item disabled>
                      <Text size="xs" c="dimmed">
                        {user.email}
                      </Text>
                    </Menu.Item>
                    <Divider />
                    <Menu.Item
                      leftSection={<IconUser size={14} />}
                      onClick={() => handleNavigate('/profile')}
                    >
                      Hồ sơ của tôi
                    </Menu.Item>

                    {user.role === 'admin' && (
                      <Menu.Item
                        leftSection={<IconDashboard size={14} />}
                        onClick={() => handleNavigate('/admin')}
                      >
                        Bảng điều khiển
                      </Menu.Item>
                    )}

                    <Divider />
                    <Menu.Item
                      leftSection={<IconLogout size={14} />}
                      color="red"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Group gap="xs" wrap="nowrap">
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => navigate('/login')}
                  >
                    Đăng nhập
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/register')}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    Đăng ký
                  </Button>
                </Group>
              )}

              {/* Mobile Burger */}
              <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Mobile Navigation Drawer */}
      <Drawer opened={opened} onClose={close} title="Menu" padding="md">
        <Stack gap="md">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Text fw={500} onClick={close}>
              Trang chủ
            </Text>
          </Link>
          <Link to="/hotels" style={{ textDecoration: 'none' }}>
            <Text fw={500} onClick={close}>
              Khách sạn
            </Text>
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/bookings" style={{ textDecoration: 'none' }}>
                <Text fw={500} onClick={close}>
                  Đặt phòng của tôi
                </Text>
              </Link>
              <Divider />
              <Link to="/profile" style={{ textDecoration: 'none' }}>
                <Text fw={500} onClick={close}>
                  Hồ sơ
                </Text>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" style={{ textDecoration: 'none' }}>
                  <Text fw={500} onClick={close}>
                    Bảng điều khiển
                  </Text>
                </Link>
              )}
              <Button
                fullWidth
                color="red"
                variant="light"
                onClick={handleLogout}
                leftSection={<IconLogout size={16} />}
              >
                Đăng xuất
              </Button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Divider />
              <Button
                fullWidth
                variant="default"
                onClick={() => handleNavigate('/login')}
              >
                Đăng nhập
              </Button>
              <Button
                fullWidth
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
                onClick={() => handleNavigate('/register')}
              >
                Đăng ký
              </Button>
            </>
          )}
        </Stack>
      </Drawer>
    </>
  );
};

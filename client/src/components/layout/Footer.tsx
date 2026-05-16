import {
  Box,
  Container,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Divider,
  Grid,
} from "@mantine/core";
import {
  IconPhone,
  IconMail,
  IconMapPin,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandInstagram,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";

export const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      py="xl"
      style={{ borderTop: "1px solid #e9ecef", marginTop: "auto" }}
    >
      <Container size="xl">
        <Grid gutter="xl" mb="xl">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap="md">
              <Group gap={8}>
                <Text fw={700} size="lg">
                  UTravel
                </Text>
              </Group>
              <Text size="sm" c="dimmed">
                Nền tảng đặt phòng khách sạn trực tuyến hàng đầu, giúp bạn tìm
                kiếm và đặt khách sạn tuyệt vời trên toàn thế giới.
              </Text>
            </Stack>
          </Grid.Col>

          {/* Quick Links */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap="md">
              <Text fw={600} size="sm">
                Liên kết nhanh
              </Text>
              <Stack gap="xs">
                <Link to="/" style={{ textDecoration: "none" }}>
                  <Text size="sm" c="dimmed" className="hover:text-blue-600">
                    Trang chủ
                  </Text>
                </Link>
                <Link to="/hotels" style={{ textDecoration: "none" }}>
                  <Text size="sm" c="dimmed" className="hover:text-blue-600">
                    Khách sạn
                  </Text>
                </Link>
                <Link to="/bookings" style={{ textDecoration: "none" }}>
                  <Text size="sm" c="dimmed" className="hover:text-blue-600">
                    Đặt phòng của tôi
                  </Text>
                </Link>
                <Text
                  size="sm"
                  c="dimmed"
                  className="hover:text-blue-600"
                  component="div"
                >
                  Liên hệ
                </Text>
              </Stack>
            </Stack>
          </Grid.Col>

          {/* Support */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap="md">
              <Text fw={600} size="sm">
                Hỗ trợ
              </Text>
              <Stack gap="xs">
                <Text
                  size="sm"
                  c="dimmed"
                  className="hover:text-blue-600"
                  component="div"
                >
                  Câu hỏi thường gặp
                </Text>
                <Text
                  size="sm"
                  c="dimmed"
                  className="hover:text-blue-600"
                  component="div"
                >
                  Điều khoản dịch vụ
                </Text>
                <Text
                  size="sm"
                  c="dimmed"
                  className="hover:text-blue-600"
                  component="div"
                >
                  Chính sách bảo mật
                </Text>
                <Text
                  size="sm"
                  c="dimmed"
                  className="hover:text-blue-600"
                  component="div"
                >
                  Liên hệ hỗ trợ
                </Text>
              </Stack>
            </Stack>
          </Grid.Col>

          {/* Contact & Social */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap="md">
              <Text fw={600} size="sm">
                Liên hệ chúng tôi
              </Text>
              <Stack gap="sm">
                <Group gap="xs">
                  <ThemeIcon variant="light" size="lg" radius="md">
                    <IconPhone size={16} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">
                    +84 1234 567 890
                  </Text>
                </Group>
                <Group gap="xs">
                  <ThemeIcon variant="light" size="lg" radius="md">
                    <IconMail size={16} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">
                    support@utravel.com
                  </Text>
                </Group>
                <Group gap="xs">
                  <ThemeIcon variant="light" size="lg" radius="md">
                    <IconMapPin size={16} />
                  </ThemeIcon>
                  <Text size="sm" c="dimmed">
                    Hà Nội, Việt Nam
                  </Text>
                </Group>
              </Stack>

              {/* Social Links */}
              <Group gap="xs" mt="md">
                <ThemeIcon variant="light" size="lg" radius="md">
                  <IconBrandFacebook size={16} />
                </ThemeIcon>
                <ThemeIcon variant="light" size="lg" radius="md">
                  <IconBrandTwitter size={16} />
                </ThemeIcon>
                <ThemeIcon variant="light" size="lg" radius="md">
                  <IconBrandInstagram size={16} />
                </ThemeIcon>
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>

        <Divider my="lg" />

        {/* Copyright */}
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            © {currentYear} UTravel. Bảo lưu mọi quyền.
          </Text>
          <Group gap="md">
            <Text size="xs" c="dimmed" component="div">
              Chính sách bảo mật
            </Text>
            <Text size="xs" c="dimmed" component="div">
              Điều khoản dịch vụ
            </Text>
          </Group>
        </Group>
      </Container>
    </Box>
  );
};

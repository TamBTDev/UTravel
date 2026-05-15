import { Container, Grid, Box, Title, Text, Stack } from "@mantine/core";
import { AppLayout } from "@/components/layout";
import { LoginForm, AuthBenefits } from "../components";

/**
 * Login Page
 * Hiển thị form đăng nhập với benefits showcase
 */
export const LoginPage = () => {
  return (
    <AppLayout withContainer={false}>
      <Box
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          opacity: 0.05,
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          height: 300,
          zIndex: -1,
        }}
      />

      <Container size="lg" py="xl">
        <Grid gutter="xl" align="stretch">
          {/* Left side - Info */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="lg" justify="center" h="100%">
              <div>
                <Title
                  order={1}
                  size="h2"
                  fw={700}
                  mb="md"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Khám Phá Thế Giới
                </Title>
                <Text size="lg" c="dimmed" mb="xl">
                  Đăng nhập để bắt đầu tìm kiếm và đặt khách sạn tuyệt vời trên
                  toàn thế giới. Nhận thêm các ưu đãi độc quyền và quản lý đơn
                  đặt phòng của bạn dễ dàng.
                </Text>
              </div>

              <AuthBenefits />
            </Stack>
          </Grid.Col>

          {/* Right side - Form */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box h="100%" style={{ display: "flex", alignItems: "center" }}>
              <LoginForm />
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </AppLayout>
  );
};

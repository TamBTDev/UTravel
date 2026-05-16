import { Container, Grid, Box, Title, Text, Stack } from "@mantine/core";
import { AppLayout } from "../components/layout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const Login = () => {
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

              {/* Benefits */}
              <Stack gap="md">
                <BenefitItem
                  title="Ưu đãi độc quyền"
                  description="Nhận giá tốt nhất chỉ dành cho thành viên"
                />
                <BenefitItem
                  title="Đặt phòng an toàn"
                  description="Giao dịch được bảo vệ 100% bởi hệ thống mã hóa"
                />
                <BenefitItem
                  title="Hỗ trợ 24/7"
                  description="Đội hỗ trợ khách hàng sẵn sàng giúp bạn bất kỳ lúc nào"
                />
                <BenefitItem
                  title="Chương trình loyalty"
                  description="Tích lũy điểm và nhận phần thưởng từ mỗi đặt phòng"
                />
              </Stack>
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

/**
 * Benefit Item Component
 */
interface BenefitItemProps {
  title: string;
  description: string;
}

const BenefitItem = ({ title, description }: BenefitItemProps) => {
  return (
    <Box style={{ display: "flex", gap: "1rem" }}>
      <Box style={{ fontSize: "1.5rem" }}></Box>
      <Stack gap={0}>
        <Text fw={600} size="sm">
          {title}
        </Text>
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      </Stack>
    </Box>
  );
};

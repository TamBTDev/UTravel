import { Box, Stack, Text } from "@mantine/core";

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

/**
 * Auth benefits showcase component
 * Hiển thị lợi ích của việc đăng nhập
 */
export const AuthBenefits = () => {
  const benefits = [
    {
      title: "Ưu đãi độc quyền",
      description: "Nhận giá tốt nhất chỉ dành cho thành viên",
    },
    {
      title: "Đặt phòng an toàn",
      description: "Giao dịch được bảo vệ 100% bởi hệ thống mã hóa",
    },
    {
      title: "Hỗ trợ 24/7",
      description: "Đội hỗ trợ khách hàng sẵn sàng giúp bạn bất kỳ lúc nào",
    },
    {
      title: "Chương trình loyalty",
      description: "Tích lũy điểm và nhận phần thưởng từ mỗi đặt phòng",
    },
  ];

  return (
    <Stack gap="md">
      {benefits.map((benefit, index) => (
        <BenefitItem key={index} {...benefit} />
      ))}
    </Stack>
  );
};

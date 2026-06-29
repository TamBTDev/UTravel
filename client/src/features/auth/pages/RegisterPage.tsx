import { Box } from "@mantine/core";
import { AppLayout } from "@/components/layout";
import { RegisterForm, AuthLayout } from "../components";


export const RegisterPage = () => {
  return (
    <AppLayout withContainer={false}>
      <Box p={{ base: "sm", md: "md" }} style={{ backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 140px)" }}>
        <AuthLayout
          rightPanelType="image"
          imageUrl="https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200&auto=format&fit=crop"
          title="Khám phá thế giới cùng chúng tôi"

          description="Mở khóa hàng ngàn điểm đến tuyệt vời, những ưu đãi độc quyền và quản lý chuyến đi mượt mà. Đăng ký ngay để biến kỳ nghỉ trong mơ của bạn thành hiện thực."
        >
          <RegisterForm />
        </AuthLayout>
      </Box>
    </AppLayout>

  );
};

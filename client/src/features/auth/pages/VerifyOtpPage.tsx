import { Box } from "@mantine/core";
import { AppLayout } from "@/components/layout";
import { OtpVerification, AuthLayout } from "../components";


export const VerifyOtpPage = () => {
  return (
    <AppLayout withContainer={false}>
      <Box p={{ base: "sm", md: "md" }} style={{ backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 140px)" }}>
        <AuthLayout
          rightPanelType="image"
          imageUrl="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200&auto=format&fit=crop"
          title="Bảo Mật Tối Đa"
          description="Chúng tôi sử dụng xác thực qua email để đảm bảo tài khoản của bạn luôn được an toàn tuyệt đối. Vui lòng kiểm tra hộp thư của bạn."
        >
          <OtpVerification />
        </AuthLayout>
      </Box>
    </AppLayout>

  );
};

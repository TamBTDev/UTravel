import { Box } from "@mantine/core";
import { LoginForm, AuthLayout } from "../components";
import { AppLayout } from "@/components/layout";


/**
 * Login Page (Centered card on top of a clean white background)
 */
export const LoginPage = () => {
  return (
    <AppLayout withContainer={false}>
      <Box p={{ base: "sm", md: "md" }} style={{ backgroundColor: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 140px)" }}>
        <AuthLayout
          rightPanelType="image"
          imageUrl="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop"
          title="Khám phá những hành trình mới"
          description="Hàng ngàn du khách đã tin tưởng UTravel cho những chuyến đi liền mạch và khó quên trên toàn thế giới."
        >
          <LoginForm />
        </AuthLayout>
      </Box>
    </AppLayout>


  );
};
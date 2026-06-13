import { Box, Image } from "@mantine/core";
import { LoginForm } from "../components";
import logo from "@/assets/logo.svg";
import { AppLayout } from "@/components/layout";

/**
 * Login Page (Centered card on top of a clean white background)
 */
export const LoginPage = () => {
  return (
    <AppLayout withContainer={false}>
      <div
        className="login-page-centered"
        style={{
          minHeight: "100vh", // Chiếm toàn bộ chiều cao màn hình, xóa vệt trắng thừa ở đáy
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff", // Nền trắng tinh (Thay thế cho ảnh và lớp phủ xám cũ)
          padding: 24,
        }}
      >
        <div style={{ width: 420, maxWidth: "96%" }}>
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              flexDirection: "column", 
              gap: 8, 
              marginBottom: 12 
            }}
          >
            <Image src={logo} width={88} height={88} alt="UTravel" />
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#0b63d6" }}>UTravel</h1>
          </div>

          <LoginForm />
        </div>
      </div>
    </AppLayout>
  );
};
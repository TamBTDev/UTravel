import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, PasswordInput, TextInput, Stack, Text } from "@mantine/core";
import { RegisterInput, registerSchema } from "@shared/schemas/auth.schema";
import { useRegister } from "../hooks/useRegister";
import { AuthCard } from "./AuthCard";

export const RegisterForm = () => {
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const { register: registerUser, isLoading } = useRegister();

  const onSubmit = (data: RegisterInput) => {
    registerUser(data);
  };

  return (
    <AuthCard>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 600 }}>
          Đăng Ký Tài Khoản
        </h2>
        <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
          Tạo tài khoản mới để trải nghiệm dịch vụ
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Họ"
            placeholder="Nhập họ của bạn"
            {...formRegister("lastName")}
            error={errors.lastName?.message}
            disabled={isLoading}
            required
          />

          <TextInput
            label="Tên"
            placeholder="Nhập tên của bạn"
            {...formRegister("firstName")}
            error={errors.firstName?.message}
            disabled={isLoading}
            required
          />

          <TextInput
            label="Email"
            placeholder="Nhập email của bạn"
            {...formRegister("email")}
            error={errors.email?.message}
            disabled={isLoading}
            required
          />

          <PasswordInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            {...formRegister("password")}
            error={errors.password?.message}
            disabled={isLoading}
            required
          />

          <PasswordInput
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            {...formRegister("confirmPassword")}
            error={errors.confirmPassword?.message}
            disabled={isLoading}
            required
          />

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Đăng Ký
          </Button>
        </Stack>
      </form>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <Text size="sm">
          Đã có tài khoản?{" "}
          <Text
            component="a"
            href="/login"
            style={{
              color: "#667eea",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Đăng nhập ngay
          </Text>
        </Text>
      </div>
    </AuthCard>
  );
};

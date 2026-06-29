import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  PasswordInput,
  TextInput,
  Stack,
  Checkbox,
  Group,
  Text,
} from "@mantine/core";
import { LoginInput, loginSchema } from "@shared/schemas/auth.schema";
import { useLogin } from "../hooks";
import { AuthSignupLink } from "./index";
import logo from "@/assets/logo.svg";
import { Image } from "@mantine/core";


export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { login, isLoading } = useLogin();

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  return (
    <div style={{ padding: "0" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <Image src={logo} w={40} h={40} alt="UTravel" />
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0b63d6" }}>UTravel</h1>

        </div>
        <h2 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 800 }}>Đăng nhập</h2>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>Chào mừng trở lại! Vui lòng nhập thông tin để truy cập tài khoản.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          {/* Email */}
          <TextInput
            label="Địa chỉ Email"
            placeholder="name@example.com"
            {...register("email")}
            error={errors.email?.message}
            disabled={isLoading}
            size="md"
            required
          />

          {/* Password */}
          <PasswordInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            {...register("password")}
            error={errors.password?.message}
            disabled={isLoading}
            size="md"
            required
          />

          {/* Remember me & Forgot password */}
          <Group justify="space-between" align="center" mt="xs">
            <Checkbox label="Ghi nhớ đăng nhập" size="sm" />
            <Text component="a" href="/forgot-password" size="sm" style={{ color: "#0b63d6", cursor: "pointer", fontWeight: 500 }}>
              Quên mật khẩu?
            </Text>
          </Group>

          {/* Submit button */}
          <Button type="submit" fullWidth loading={isLoading} radius="md" size="md" mt="sm" style={{ backgroundColor: "#0b63d6", height: 46 }}>
            Đăng nhập
          </Button>
        </Stack>
      </form>

      {/* Signup link */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Text size="sm">
          Chưa có tài khoản?{" "}
          <Text component="a" href="/register" style={{ color: "#0b63d6", fontWeight: 600, textDecoration: "none" }}>
            Đăng ký ngay
          </Text>
        </Text>
      </div>
    </div>
  );
};

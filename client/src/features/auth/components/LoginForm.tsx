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
import { AuthCard, SocialLoginButtons, AuthSignupLink } from "./index";

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
    <AuthCard shadow="lg" padding="xl" radius="md" style={{ boxShadow: '0 18px 40px rgba(11,99,214,0.12)' }}>
      {/* Header */}
      <div style={{ marginBottom: 18, textAlign: 'center' }}>
        <h2 style={{ margin: "0 0 8px 0", fontSize: 20, fontWeight: 800 }}>Đăng nhập</h2>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 13 }}>Chào mừng trở lại — đăng nhập để tiếp tục.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="sm">
          {/* Email */}
          <TextInput
            label="Địa chỉ email"
            placeholder="name@example.com"
            {...register("email")}
            error={errors.email?.message}
            disabled={isLoading}
            required
          />

          {/* Password */}
          <PasswordInput
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            {...register("password")}
            error={errors.password?.message}
            disabled={isLoading}
            required
          />

          {/* Remember me & Forgot password */}
          <Group justify="space-between" align="center">
            <Checkbox label="Ghi nhớ đăng nhập" size="sm" />
            <Text component="a" href="/forgot-password" size="sm" style={{ color: "#0b63d6", cursor: "pointer" }}>
              Quên mật khẩu?
            </Text>
          </Group>

          {/* Submit button */}
          <Button type="submit" fullWidth loading={isLoading} radius="md" size="md" style={{ background: 'linear-gradient(90deg,#0b63d6,#4f46e5)', height: 46 }}>
            Đăng nhập
          </Button>
        </Stack>
      </form>

      {/* Signup link */}
      <div style={{ marginTop: 14, textAlign: 'center' }}>
        <AuthSignupLink />
      </div>
    </AuthCard>
  );
};

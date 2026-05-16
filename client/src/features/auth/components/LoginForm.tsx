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
    <AuthCard>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 600 }}>
          Đăng Nhập
        </h2>
        <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
          Đăng nhập để tiếp tục
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          {/* Email */}
          <TextInput
            label="Email"
            placeholder="Nhập email của bạn"
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
            <Checkbox label="Nhớ mật khẩu" size="sm" />
            <Text
              component="a"
              href="/forgot-password"
              size="sm"
              style={{ color: "#667eea", cursor: "pointer" }}
            >
              Quên mật khẩu?
            </Text>
          </Group>

          {/* Submit button */}
          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Đăng Nhập
          </Button>
        </Stack>
      </form>

      {/* Divider */}
      <div style={{ margin: "20px 0", position: "relative" }}>
        <div style={{ borderTop: "1px solid #e9ecef" }} />
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "-12px",
            transform: "translateX(-50%)",
            background: "white",
            padding: "0 8px",
            color: "#999",
            fontSize: 12,
          }}
        >
          hoặc
        </span>
      </div>

      {/* Social login */}
      <SocialLoginButtons />

      {/* Signup link */}
      <AuthSignupLink />
    </AuthCard>
  );
};

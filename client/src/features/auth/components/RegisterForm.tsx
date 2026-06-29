import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, PasswordInput, TextInput, Stack, Text, Image } from "@mantine/core";
import { RegisterInput, registerSchema } from "@shared/schemas/auth.schema";
import { useRegister } from "../hooks/useRegister";
import logo from "@/assets/logo.svg";


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
    <div style={{ padding: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <Image src={logo} w={40} h={40} alt="UTravel" />
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0b63d6" }}>UTravel</h1>

        </div>
        <h2 style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 800 }}>
          Tạo tài khoản
        </h2>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          Bắt đầu hành trình của bạn với UTravel ngay hôm nay.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap="md">
          <div style={{ display: "flex", gap: "16px" }}>
            <TextInput
              label="Họ"
              placeholder="Ví dụ: Nguyễn"
              {...formRegister("lastName")}
              error={errors.lastName?.message}
              disabled={isLoading}
              size="md"
              style={{ flex: 1 }}
              required
            />
            <TextInput
              label="Tên"
              placeholder="Ví dụ: Văn A"
              {...formRegister("firstName")}
              error={errors.firstName?.message}
              disabled={isLoading}
              size="md"
              style={{ flex: 1 }}
              required
            />
          </div>

          <TextInput
            label="Địa chỉ Email"
            placeholder="name@example.com"
            {...formRegister("email")}
            error={errors.email?.message}
            disabled={isLoading}
            size="md"
            required
          />

          <PasswordInput
            label="Mật khẩu"
            placeholder="Tạo mật khẩu"
            {...formRegister("password")}
            error={errors.password?.message}
            disabled={isLoading}
            size="md"
            required
          />

          <PasswordInput
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu"
            {...formRegister("confirmPassword")}
            error={errors.confirmPassword?.message}
            disabled={isLoading}
            size="md"
            required
          />

          <Button
            type="submit"
            fullWidth
            loading={isLoading}
            radius="md"
            size="md"
            mt="sm"
            style={{
              backgroundColor: "#0b63d6",
              height: 46,
            }}
          >
            Đăng Ký
          </Button>
        </Stack>
      </form>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <Text size="sm">
          Đã có tài khoản?{" "}
          <Text component="a" href="/login" style={{ color: "#0b63d6", fontWeight: 600, textDecoration: "none" }}>
            Đăng nhập ngay
          </Text>
        </Text>
      </div>
    </div>
  );
};

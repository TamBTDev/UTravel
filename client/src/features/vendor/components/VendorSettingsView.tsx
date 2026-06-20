import { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Textarea,
  Button,
  Paper,
  Title,
  Divider,
  Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX, IconDeviceFloppy } from "@tabler/icons-react";
import { vendorService } from "../../user/services/vendorService";

export const VendorSettingsView = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm({
    initialValues: {
      shopName: "",
      description: "",
      bankName: "",
      bankAccount: "",
      bankOwner: "",
      logo: "",
    },
    validate: {
      shopName: (value) =>
        value.length < 3 ? "Tên gian hàng phải từ 3 ký tự" : null,
      bankName: (value) => (!value ? "Vui lòng nhập tên ngân hàng" : null),
      bankAccount: (value) => (!value ? "Vui lòng nhập số tài khoản" : null),
      bankOwner: (value) => (!value ? "Vui lòng nhập tên chủ tài khoản" : null),
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setInitialLoading(true);
        const res = await vendorService.getVendorProfile();
        if (res.success && res.data) {
          form.setValues({
            shopName: res.data.shopName || "",
            description: res.data.description || "",
            bankName: res.data.bankName || "",
            bankAccount: res.data.bankAccount || "",
            bankOwner: res.data.bankOwner || "",
            logo: res.data.logo || "",
          });
        }
      } catch (err: any) {
        notifications.show({
          title: "Lỗi tải dữ liệu",
          message: err.message || "Không thể lấy thông tin Shop",
          color: "red",
          icon: <IconX size={16} />,
        });
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const res = await vendorService.updateVendorProfile(values);
      if (res.success) {
        notifications.show({
          title: "Thành công",
          message: "Cập nhật thông tin Shop thành công",
          color: "green",
          icon: <IconCheck size={16} />,
        });
      }
    } catch (err: any) {
      notifications.show({
        title: "Lỗi cập nhật",
        message: err.message || "Có lỗi xảy ra khi cập nhật thông tin Shop",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader size="lg" color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full">
      <Paper radius="md" p="xl" withBorder className="shadow-sm">
        <Title order={2} className="text-2xl font-bold text-primary mb-1">
          Cấu hình Shop (Settings)
        </Title>
        <p className="text-on-surface-variant text-sm mb-6">
          Quản lý thông tin hiển thị gian hàng và phương thức nhận thanh toán
          của bạn.
        </p>

        <Divider mb="xl" color="var(--color-outline-variant)" />

        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Title
                order={4}
                className="text-lg font-semibold text-on-surface"
              >
                Thông tin cơ bản
              </Title>
              <TextInput
                label="Tên gian hàng / Khách sạn"
                placeholder="Nhập tên hiển thị"
                required
                {...form.getInputProps("shopName")}
                classNames={{
                  input: "border-outline-variant focus:border-primary",
                }}
              />

              <TextInput
                label="Đường dẫn Logo"
                placeholder="https://example.com/logo.png"
                {...form.getInputProps("logo")}
                classNames={{
                  input: "border-outline-variant focus:border-primary",
                }}
              />

              <Textarea
                label="Mô tả gian hàng"
                placeholder="Giới thiệu ngắn gọn về khách sạn / chuỗi phòng của bạn"
                minRows={4}
                {...form.getInputProps("description")}
                classNames={{
                  input: "border-outline-variant focus:border-primary",
                }}
              />
            </div>

            <div className="space-y-4">
              <Title
                order={4}
                className="text-lg font-semibold text-on-surface"
              >
                Thông tin thanh toán (Ngân hàng)
              </Title>

              <TextInput
                label="Tên ngân hàng"
                placeholder="Ví dụ: Vietcombank, TPBank"
                required
                {...form.getInputProps("bankName")}
                classNames={{
                  input: "border-outline-variant focus:border-primary",
                }}
              />

              <TextInput
                label="Số tài khoản"
                placeholder="Nhập số tài khoản ngân hàng"
                required
                {...form.getInputProps("bankAccount")}
                classNames={{
                  input: "border-outline-variant focus:border-primary",
                }}
              />

              <TextInput
                label="Tên chủ tài khoản"
                placeholder="VI DU TEN CHU TAI KHOAN"
                required
                {...form.getInputProps("bankOwner")}
                classNames={{
                  input: "border-outline-variant focus:border-primary",
                }}
              />
            </div>
          </div>

          <Divider mt="xl" mb="md" color="var(--color-outline-variant)" />

          <div className="flex justify-end">
            <Button
              type="submit"
              loading={loading}
              leftSection={<IconDeviceFloppy size={18} />}
              className="bg-primary hover:bg-primary-hover"
            >
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
};

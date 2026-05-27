import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  TextInput,
  Select,
  Button,
  Grid,
  Alert,
  Text,
  Avatar,
  Group,
  Stack,
} from "@mantine/core";
import {
  IconUser,
  IconAlertCircle,
  IconCircleCheck,
  IconDeviceFloppy,
  IconArrowBackUp,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { updateProfile, clearProfileMessages } from "@/app/store/profileSlice";

// Định nghĩa Zod Schema cho việc xác thực
const profileSchema = z.object({
  firstName: z.string().min(1, "Tên không được để trống"),
  lastName: z.string().min(1, "Họ không được để trống"),
  email: z.string(),
  phone: z
    .string()
    .min(1, "Số điện thoại không được để trống")
    .regex(/^[0-9+\s-]{9,15}$/, "Số điện thoại không hợp lệ (9-15 chữ số)"),
  avatar: z.string().url("URL ảnh đại diện không hợp lệ").or(z.literal("")),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zip: z.string(),
  dateOfBirth: z.string(),
  gender: z.string(),
});

const getErrorMessage = (error: any): string | undefined => {
  if (!error) return undefined;
  if (typeof error === "object") {
    return error.message || error.toString();
  }
  return String(error);
};

export const ProfileEditForm = () => {
  const dispatch = useAppDispatch();
  const { profile, isSaving, error, successMessage } = useAppSelector(
    (s) => s.profile,
  );

  // Khởi tạo TanStack Form
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      avatar: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      dateOfBirth: "1990-05-15",
      gender: "Female",
    },
    validators: {
      onChange: profileSchema,
    },
    onSubmit: async ({ value }) => {
      const fullAddress = [value.street, value.city, value.state, value.zip]
        .map((s) => s?.trim())
        .filter(Boolean)
        .join(", ");

      dispatch(
        updateProfile({
          firstName: value.firstName,
          lastName: value.lastName,
          phone: value.phone,
          avatar: value.avatar,
          address: fullAddress,
        }),
      );
    },
  });

  // Đồng bộ hóa dữ liệu từ Redux Store vào Form
  useEffect(() => {
    if (profile) {
      const addressParts = profile.address ? profile.address.split(", ") : [];
      form.reset({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        avatar: profile.avatar ?? "",
        street: addressParts[0] ?? "",
        city: addressParts[1] ?? "",
        state: addressParts[2] ?? "",
        zip: addressParts[3] ?? "",
        dateOfBirth: "1990-05-15",
        gender: "Female",
      });
    }
  }, [profile]);

  const handleDiscard = () => {
    if (profile) {
      const addressParts = profile.address ? profile.address.split(", ") : [];
      form.reset({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        avatar: profile.avatar ?? "",
        street: addressParts[0] ?? "",
        city: addressParts[1] ?? "",
        state: addressParts[2] ?? "",
        zip: addressParts[3] ?? "",
        dateOfBirth: "1990-05-15",
        gender: "Female",
      });
      dispatch(clearProfileMessages());
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert
          icon={<IconCircleCheck size={16} />}
          color="teal"
          variant="light"
        >
          {successMessage}
        </Alert>
      )}

      {/* Avatar Preview & Input */}
      <form.Field
        name="avatar"
        children={(field) => (
          <Group gap="lg" className="border-b border-hairline pb-6">
            <Avatar
              src={field.state.value}
              size={72}
              radius="xl"
              color="var(--color-primary)"
            >
              <IconUser size={32} />
            </Avatar>
            <Stack gap={2} className="flex-1">
              <Text className="text-body-bold text-on-surface">
                Ảnh đại diện (URL)
              </Text>
              <TextInput
                placeholder="https://example.com/avatar.jpg"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.value);
                  if (error || successMessage) dispatch(clearProfileMessages());
                }}
                error={
                  field.state.meta.isTouched && field.state.meta.errors?.length
                    ? getErrorMessage(field.state.meta.errors[0])
                    : undefined
                }
                className="w-full"
              />
            </Stack>
          </Group>
        )}
      />

      {/* Name fields */}
      <Grid className="border-b border-hairline pb-6">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <form.Field
            name="firstName"
            children={(field) => (
              <TextInput
                label={
                  <span className="font-semibold text-on-surface">
                    Tên (First Name)
                  </span>
                }
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.value);
                  if (error || successMessage) dispatch(clearProfileMessages());
                }}
                error={
                  field.state.meta.isTouched && field.state.meta.errors?.length
                    ? getErrorMessage(field.state.meta.errors[0])
                    : undefined
                }
                placeholder="Alex"
                className="w-full"
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <form.Field
            name="lastName"
            children={(field) => (
              <TextInput
                label={
                  <span className="font-semibold text-on-surface">
                    Họ (Last Name)
                  </span>
                }
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.value);
                  if (error || successMessage) dispatch(clearProfileMessages());
                }}
                error={
                  field.state.meta.isTouched && field.state.meta.errors?.length
                    ? getErrorMessage(field.state.meta.errors[0])
                    : undefined
                }
                placeholder="Morgan"
                className="w-full"
              />
            )}
          />
        </Grid.Col>
      </Grid>

      {/* Email and Phone */}
      <Grid className="border-b border-hairline pb-6">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <form.Field
            name="email"
            children={(field) => (
              <TextInput
                label={
                  <span className="font-semibold text-on-surface">
                    Địa chỉ Email
                  </span>
                }
                value={field.state.value}
                disabled
                placeholder="alex.morgan@example.com"
                description="Không thể thay đổi email đăng nhập"
                className="w-full"
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <form.Field
            name="phone"
            children={(field) => (
              <TextInput
                label={
                  <span className="font-semibold text-on-surface">
                    Số điện thoại
                  </span>
                }
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.value);
                  if (error || successMessage) dispatch(clearProfileMessages());
                }}
                error={
                  field.state.meta.isTouched && field.state.meta.errors?.length
                    ? getErrorMessage(field.state.meta.errors[0])
                    : undefined
                }
                placeholder="+1 (555) 123-4567"
                className="w-full"
              />
            )}
          />
        </Grid.Col>
      </Grid>

      {/* Date of Birth and Gender */}
      <Grid className="border-b border-hairline pb-6">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <form.Field
            name="dateOfBirth"
            children={(field) => (
              <TextInput
                label={
                  <span className="font-semibold text-on-surface">
                    Ngày sinh
                  </span>
                }
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.currentTarget.value);
                  if (error || successMessage) dispatch(clearProfileMessages());
                }}
                error={
                  field.state.meta.isTouched && field.state.meta.errors?.length
                    ? getErrorMessage(field.state.meta.errors[0])
                    : undefined
                }
                className="w-full text-on-surface-variant"
              />
            )}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <form.Field
            name="gender"
            children={(field) => (
              <Select
                label={
                  <span className="font-semibold text-on-surface">
                    Giới tính
                  </span>
                }
                data={["Male", "Female", "Non-binary", "Prefer not to say"]}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(val) => {
                  field.handleChange(val || "Prefer not to say");
                  if (error || successMessage) dispatch(clearProfileMessages());
                }}
                error={
                  field.state.meta.isTouched && field.state.meta.errors?.length
                    ? getErrorMessage(field.state.meta.errors[0])
                    : undefined
                }
                className="w-full text-on-surface"
              />
            )}
          />
        </Grid.Col>
      </Grid>

      {/* Address block */}
      <Stack gap="md" className="border-b border-hairline pb-6">
        <form.Field
          name="street"
          children={(field) => (
            <TextInput
              label={
                <span className="font-semibold text-on-surface">Địa chỉ</span>
              }
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                field.handleChange(e.currentTarget.value);
                if (error || successMessage) dispatch(clearProfileMessages());
              }}
              error={
                field.state.meta.isTouched && field.state.meta.errors?.length
                  ? getErrorMessage(field.state.meta.errors[0])
                  : undefined
              }
              placeholder="123 Ocean View Drive, Suite 4B"
              className="w-full"
            />
          )}
        />
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <form.Field
              name="city"
              children={(field) => (
                <TextInput
                  placeholder="Thành phố (City)"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.currentTarget.value);
                    if (error || successMessage)
                      dispatch(clearProfileMessages());
                  }}
                  error={
                    field.state.meta.isTouched &&
                    field.state.meta.errors?.length
                      ? getErrorMessage(field.state.meta.errors[0])
                      : undefined
                  }
                  className="w-full"
                />
              )}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <form.Field
              name="state"
              children={(field) => (
                <TextInput
                  placeholder="Bang/Tỉnh (State)"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.currentTarget.value);
                    if (error || successMessage)
                      dispatch(clearProfileMessages());
                  }}
                  error={
                    field.state.meta.isTouched &&
                    field.state.meta.errors?.length
                      ? getErrorMessage(field.state.meta.errors[0])
                      : undefined
                  }
                  className="w-full"
                />
              )}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 6, md: 3 }}>
            <form.Field
              name="zip"
              children={(field) => (
                <TextInput
                  placeholder="Mã bưu chính (ZIP)"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.currentTarget.value);
                    if (error || successMessage)
                      dispatch(clearProfileMessages());
                  }}
                  error={
                    field.state.meta.isTouched &&
                    field.state.meta.errors?.length
                      ? getErrorMessage(field.state.meta.errors[0])
                      : undefined
                  }
                  className="w-full"
                />
              )}
            />
          </Grid.Col>
        </Grid>
      </Stack>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-2">
        <Button
          variant="outline"
          color="var(--color-primary)"
          onClick={handleDiscard}
          leftSection={<IconArrowBackUp size={16} />}
          className="px-6 h-12"
          disabled={isSaving}
        >
          Hủy thay đổi (Discard)
        </Button>
        <Button
          type="submit"
          loading={isSaving}
          leftSection={<IconDeviceFloppy size={16} />}
          className="px-6 h-12 bg-primary hover:bg-primary-hover text-white transition-colors"
        >
          Lưu thiết lập (Save)
        </Button>
      </div>
    </form>
  );
};

import { useState, useEffect } from "react";
import {
  TextInput,
  Textarea,
  Button,
  Stack,
  Grid,
  Alert,
  Text,
  Divider,
  Group,
} from "@mantine/core";
import {
  IconUser,
  IconPhone,
  IconMapPin,
  IconLink,
  IconAlertCircle,
  IconCircleCheck,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { updateProfile, clearProfileMessages } from "@/app/store/profileSlice";

export const ProfileEditForm = () => {
  const dispatch = useAppDispatch();
  const { profile, isSaving, error, successMessage } = useAppSelector(
    (s) => s.profile,
  );

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    avatar: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName ?? "",
        lastName: profile.lastName ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        avatar: profile.avatar ?? "",
      });
    }
  }, [profile]);

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (error || successMessage) dispatch(clearProfileMessages());
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v !== ""),
    );
    dispatch(updateProfile(payload));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Divider
          label={
            <Text size="sm" fw={500} c="dimmed">
              Thông tin cá nhân
            </Text>
          }
          labelPosition="left"
        />

        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
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

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              id="profile-first-name"
              label="Tên"
              placeholder="Nhập tên của bạn"
              value={form.firstName}
              onChange={handleChange("firstName")}
              leftSection={<IconUser size={16} />}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              id="profile-last-name"
              label="Họ"
              placeholder="Nhập họ của bạn"
              value={form.lastName}
              onChange={handleChange("lastName")}
              leftSection={<IconUser size={16} />}
            />
          </Grid.Col>
        </Grid>

        <TextInput
          id="profile-phone"
          label="Số điện thoại"
          placeholder="VD: 0912345678"
          value={form.phone}
          onChange={handleChange("phone")}
          leftSection={<IconPhone size={16} />}
        />

        <Textarea
          id="profile-address"
          label="Địa chỉ"
          placeholder="Nhập địa chỉ của bạn"
          value={form.address}
          onChange={handleChange("address")}
          rows={2}
          leftSection={<IconMapPin size={16} />}
        />

        <TextInput
          id="profile-avatar"
          label="URL Ảnh đại diện"
          placeholder="https://example.com/avatar.jpg"
          value={form.avatar}
          onChange={handleChange("avatar")}
          leftSection={<IconLink size={16} />}
        />

        <Group justify="flex-end" mt="sm">
          <Button
            id="save-profile-btn"
            type="submit"
            loading={isSaving}
            leftSection={<IconDeviceFloppy size={16} />}
            variant="gradient"
            gradient={{ from: "violet", to: "indigo" }}
          >
            Lưu thay đổi
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

import { useEffect } from "react";
import {
  Container,
  Paper,
  Stack,
  Skeleton,
  Alert,
  Tabs,
  Text,
  ThemeIcon,
  Group,
  Title,
} from "@mantine/core";
import {
  IconUser,
  IconSettings,
  IconAlertCircle,
  IconCalendar,
} from "@tabler/icons-react";
import { AppLayout } from "@/components/layout";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { fetchProfile } from "@/app/store/profileSlice";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileEditForm } from "../components/ProfileEditForm";

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <Group
    justify="space-between"
    py="xs"
    style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
  >
    <Text size="sm" c="dimmed" fw={500}>
      {label}
    </Text>
    <Text size="sm" fw={400}>
      {value || "Chưa cập nhật"}
    </Text>
  </Group>
);

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { profile, isLoading, error } = useAppSelector((s) => s.profile);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  return (
    <AppLayout withContainer={false}>
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          opacity: 0.06,
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          height: 260,
          zIndex: -1,
        }}
      />

      <Container size="md" py="xl">
        <Group gap="sm" mb="lg">
          <ThemeIcon
            size="xl"
            radius="md"
            variant="gradient"
            gradient={{ from: "violet", to: "indigo" }}
          >
            <IconUser size={22} />
          </ThemeIcon>
          <div>
            <Title order={2} fw={700}>
              Hồ sơ của tôi
            </Title>
            <Text size="sm" c="dimmed">
              Quản lý thông tin tài khoản cá nhân
            </Text>
          </div>
        </Group>

        {error && !profile && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        <Stack gap="lg">
          <Paper shadow="sm" radius="lg" p="xl" withBorder>
            <ProfileHeader profile={profile} isLoading={isLoading} />
          </Paper>

          <Paper shadow="sm" radius="lg" p="xl" withBorder>
            {isLoading ? (
              <Stack gap="md">
                <Skeleton height={16} width={100} />
                <Skeleton height={40} />
                <Skeleton height={40} />
                <Skeleton height={40} />
              </Stack>
            ) : (
              <Tabs defaultValue="info" color="violet">
                <Tabs.List mb="lg">
                  <Tabs.Tab value="info" leftSection={<IconUser size={14} />}>
                    Thông tin
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="edit"
                    leftSection={<IconSettings size={14} />}
                  >
                    Chỉnh sửa
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="info">
                  <Stack gap={0}>
                    <InfoRow label="Email" value={profile?.email} />
                    <InfoRow label="Tên" value={profile?.firstName} />
                    <InfoRow label="Họ" value={profile?.lastName} />
                    <InfoRow label="Điện thoại" value={profile?.phone} />
                    <InfoRow label="Địa chỉ" value={profile?.address} />
                    <Group justify="space-between" py="xs">
                      <Text size="sm" c="dimmed" fw={500}>
                        <IconCalendar
                          size={14}
                          style={{ marginRight: 4, verticalAlign: "middle" }}
                        />
                        Thành viên từ
                      </Text>
                      <Text size="sm">
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString(
                              "vi-VN",
                            )
                          : "—"}
                      </Text>
                    </Group>
                  </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="edit">
                  <ProfileEditForm />
                </Tabs.Panel>
              </Tabs>
            )}
          </Paper>
        </Stack>
      </Container>
    </AppLayout>
  );
};

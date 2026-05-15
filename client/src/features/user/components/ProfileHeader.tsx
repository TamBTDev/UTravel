import { Avatar, Group, Stack, Text, Badge, Skeleton } from "@mantine/core";
import { IconUser, IconShieldCheck } from "@tabler/icons-react";
import { UserProfile } from "@/app/store/profileSlice";

interface Props {
  profile: UserProfile | null;
  isLoading: boolean;
}

export const ProfileHeader = ({ profile, isLoading }: Props) => {
  const fullName = profile
    ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() ||
      "Chưa cập nhật"
    : "";

  if (isLoading) {
    return (
      <Group gap="lg" align="flex-start">
        <Skeleton circle height={80} />
        <Stack gap="xs" flex={1}>
          <Skeleton height={24} width={200} />
          <Skeleton height={16} width={160} />
          <Skeleton height={22} width={80} radius="xl" />
        </Stack>
      </Group>
    );
  }

  return (
    <Group gap="lg" align="flex-start" wrap="wrap">
      <Avatar src={profile?.avatar} size={80} radius="xl" color="violet">
        <IconUser size={36} />
      </Avatar>
      <Stack gap={4}>
        <Text fw={700} size="xl">
          {fullName}
        </Text>
        <Text c="dimmed" size="sm">
          {profile?.email}
        </Text>
        <Group gap="xs" mt={4}>
          <Badge
            variant="light"
            color={profile?.status === "VERIFIED" ? "teal" : "orange"}
            leftSection={
              profile?.status === "VERIFIED" ? (
                <IconShieldCheck size={12} />
              ) : undefined
            }
          >
            {profile?.status === "VERIFIED" ? "Đã xác thực" : "Chưa xác thực"}
          </Badge>
          <Badge variant="outline" color="violet">
            {profile?.role}
          </Badge>
        </Group>
      </Stack>
    </Group>
  );
};

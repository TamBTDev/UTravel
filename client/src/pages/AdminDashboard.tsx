import { Container, Title, Paper, Stack, Grid, Text } from '@mantine/core';
import { AppLayout } from '../components/layout';

export const AdminDashboard = () => {
  const stats = [
    { label: 'Tổng khách hàng', value: '1,234' },
    { label: 'Đặt phòng hôm nay', value: '42' },
    { label: 'Doanh thu tuần', value: '$12,500' },
    { label: 'Phòng trống', value: '156' },
  ];

  return (
    <AppLayout>
      <Container size="lg">
        <Title mb="xl">Dashboard Quản Lý</Title>

        {/* Stats */}
        <Grid mb="xl">
          {stats.map((stat) => (
            <Grid.Col key={stat.label} span={{ base: 12, md: 6, lg: 3 }}>
              <Paper p="md" radius="md" withBorder>
                <Text size="sm" c="dimmed" mb="xs">
                  {stat.label}
                </Text>
                <Text size="xl" fw={700}>
                  {stat.value}
                </Text>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>

        {/* Charts placeholder */}
        <Paper p="md" radius="md" withBorder mb="xl">
          <Title order={3} mb="md">
            Thống kê doanh thu
          </Title>
          <div style={{
            height: '300px',
            background: '#f0f0f0',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}>
            Biểu đồ sẽ được hiển thị ở đây
          </div>
        </Paper>

        {/* Recent activity */}
        <Paper p="md" radius="md" withBorder>
          <Title order={3} mb="md">
            Hoạt động gần đây
          </Title>
          <Stack gap="sm">
            <Text size="sm">Không có hoạt động nào gần đây</Text>
          </Stack>
        </Paper>
      </Container>
    </AppLayout>
  );
};

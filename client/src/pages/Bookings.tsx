import { Container, Title, Table, Badge, Button, Group } from '@mantine/core';
import { AppLayout } from '../components/layout';

export const Bookings = () => {
  const bookings = [
    {
      id: '1',
      hotel: 'Khách sạn A',
      checkIn: '2024-05-15',
      checkOut: '2024-05-20',
      status: 'confirmed',
      total: '$500',
    },
    {
      id: '2',
      hotel: 'Khách sạn B',
      checkIn: '2024-06-01',
      checkOut: '2024-06-05',
      status: 'pending',
      total: '$400',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      confirmed: { color: 'green', label: 'Xác nhận' },
      pending: { color: 'yellow', label: 'Đang chờ' },
      cancelled: { color: 'red', label: 'Hủy' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap];
    return <Badge color={statusInfo?.color}>{statusInfo?.label}</Badge>;
  };

  return (
    <AppLayout>
      <Container>
        <Title mb="xl">Các đơn đặt phòng của tôi</Title>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Khách sạn</Table.Th>
              <Table.Th>Nhận phòng</Table.Th>
              <Table.Th>Trả phòng</Table.Th>
              <Table.Th>Trạng thái</Table.Th>
              <Table.Th>Tổng cộng</Table.Th>
              <Table.Th>Hành động</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {bookings.map((booking) => (
              <Table.Tr key={booking.id}>
                <Table.Td>{booking.hotel}</Table.Td>
                <Table.Td>{booking.checkIn}</Table.Td>
                <Table.Td>{booking.checkOut}</Table.Td>
                <Table.Td>{getStatusBadge(booking.status)}</Table.Td>
                <Table.Td fw={600}>{booking.total}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button size="xs" variant="light">
                      Chi tiết
                    </Button>
                    <Button size="xs" color="red" variant="light">
                      Hủy
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Container>
    </AppLayout>
  );
};

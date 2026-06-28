import { useState, useEffect } from "react";
import { Loader, Alert, Table, Badge, Pagination, Select } from "@mantine/core";
import { IconAlertCircle, IconCalendarEvent } from "@tabler/icons-react";
import { adminService } from "../services/adminService";
import dayjs from "dayjs";

export const AdminBookingsView = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAllAdminBookings(page, 10, statusFilter);
      if (res.success) {
        setBookings(res.data);
        setTotalPages(res.totalPages);
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi tải danh sách đơn đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED": return "green";
      case "PENDING": return "orange";
      case "CANCELLED": return "red";
      case "COMPLETED": return "blue";
      default: return "gray";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border-hairline rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-bold text-on-surface">Quản lý Đơn đặt phòng Toàn sàn</h3>
        <p className="text-sm text-outline mt-0.5 font-medium">Giám sát toàn bộ giao dịch đặt phòng đang diễn ra trên nền tảng UTravel.</p>
      </div>

      <div className="bg-white rounded-xl border border-border-hairline p-4 shadow-sm flex items-center justify-between">
        <div className="w-64">
          <Select
            label="Trạng thái đơn hàng"
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val || "ALL"); setPage(1); }}
            data={[
              { value: "ALL", label: "Tất cả trạng thái" },
              { value: "PENDING", label: "Chờ xác nhận" },
              { value: "CONFIRMED", label: "Đã xác nhận" },
              { value: "COMPLETED", label: "Hoàn thành" },
              { value: "CANCELLED", label: "Đã hủy" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <Loader color="var(--color-primary)" size="md" />
          <p className="text-sm text-on-surface-variant font-medium mt-3">Đang tải danh sách đơn đặt phòng...</p>
        </div>
      ) : error ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
            <IconCalendarEvent size={32} />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">Chưa có đơn đặt phòng nào</h3>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border-hairline overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead className="bg-surface-container-lowest">
                <Table.Tr>
                  <Table.Th>Mã Đơn</Table.Th>
                  <Table.Th>Khách hàng</Table.Th>
                  <Table.Th>Khách sạn (Đối tác)</Table.Th>
                  <Table.Th>Check-in / Check-out</Table.Th>
                  <Table.Th>Tổng tiền</Table.Th>
                  <Table.Th>Trạng thái</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bookings.map((booking) => (
                  <Table.Tr key={booking.id}>
                    <Table.Td className="font-semibold text-primary">#{booking.id}</Table.Td>
                    <Table.Td>
                      <div className="font-medium text-sm">{booking.user?.firstName} {booking.user?.lastName}</div>
                      <div className="text-xs text-outline">{booking.user?.email}</div>
                    </Table.Td>
                    <Table.Td>
                      <div className="font-medium text-sm">{booking.room?.hotel?.name}</div>
                      <div className="text-xs text-outline">Thuộc: {booking.room?.hotel?.vendor?.shopName}</div>
                    </Table.Td>
                    <Table.Td>
                      <div className="text-sm">{dayjs(booking.checkInDate).format("DD/MM/YYYY")}</div>
                      <div className="text-xs text-outline">đến {dayjs(booking.checkOutDate).format("DD/MM/YYYY")}</div>
                    </Table.Td>
                    <Table.Td className="font-bold text-on-surface">
                      {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(booking.totalPrice)}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={getStatusColor(booking.status)} variant="light">
                        {booking.status}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-border-hairline flex justify-center">
              <Pagination total={totalPages} value={page} onChange={setPage} color="var(--color-primary)" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

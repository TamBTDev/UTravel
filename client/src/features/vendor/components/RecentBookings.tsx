import { useState, useEffect } from "react";
import { Badge, Loader } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { vendorService, VendorBooking } from "../../user/services/vendorService";

interface RecentBookingsProps {
  onViewAll?: () => void;
}

export const RecentBookings = ({ onViewAll }: RecentBookingsProps) => {
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await vendorService.getVendorBookings();
        if (res.success) {
          // Sort by createdAt descending to get the most recent ones first
          const sorted = [...res.data].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setBookings(sorted.slice(0, 5));
        }
      } catch (err: any) {
        console.error("Error fetching recent bookings:", err);
        setError(err.message || "Không thể tải đặt phòng gần đây");
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
    });
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Đã xác nhận";
      case "PENDING":
        return "Chờ xử lý";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "green";
      case "PENDING":
        return "yellow";
      case "COMPLETED":
        return "blue";
      case "CANCELLED":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border-hairline shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-border-hairline flex justify-between items-center">
        <h2 className="text-title-sm font-semibold text-on-surface">
          Đặt phòng gần đây
        </h2>
        <button
          onClick={onViewAll}
          className="text-primary font-bold text-sm hover:underline"
        >
          Xem tất cả
        </button>
      </div>

      <div className="flex-1 p-4 space-y-4 min-h-[250px] flex flex-col justify-start">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2">
            <Loader size="sm" color="var(--color-primary)" />
            <span className="text-xs text-outline font-medium">Đang tải...</span>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center p-4 text-center text-xs text-red-600 font-medium">
            {error}
          </div>
        ) : bookings.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center text-outline">
            <IconCalendar size={32} className="mb-2 text-outline/50" />
            <p className="text-xs">Chưa có đặt phòng nào</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <div
              key={booking.id}
              onClick={onViewAll}
              className="flex gap-4 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors duration-200 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-outline-variant flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {booking.user.firstName?.[0] || booking.room.roomNumber}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-body-bold font-bold text-on-surface truncate">
                    {booking.room.hotel.name}
                  </h4>
                  <Badge
                    color={getStatusBadgeColor(booking.status)}
                    variant="light"
                    size="xs"
                    className="shrink-0"
                  >
                    {translateStatus(booking.status)}
                  </Badge>
                </div>
                <p className="text-xs text-outline mt-0.5 truncate">
                  Phòng {booking.room.roomNumber} • {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                </p>
                <p className="text-sm font-bold text-primary mt-1">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(booking.totalPrice)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import { Badge, Loader, Menu } from "@mantine/core";
import { IconDotsVertical, IconCheck, IconX, IconUser } from "@tabler/icons-react";
import { VendorBooking } from "../../../user/services/vendorService";

interface BookingRowProps {
  booking: VendorBooking;
  actionLoadingId: number | null;
  onUpdateStatus: (bookingId: number, status: string) => void;
}

export const BookingRow = ({ booking, actionLoadingId, onUpdateStatus }: BookingRowProps) => {
  const guestNameInitials = `${booking.user.firstName?.[0] || ""}${booking.user.lastName?.[0] || ""}`.toUpperCase();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "short",
    });
  };

  const getNights = (checkIn: string, checkOut: string) => {
    const diffTime = Math.abs(new Date(checkOut).getTime() - new Date(checkIn).getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "COMPLETED":
        return "bg-blue-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-outline-variant";
    }
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
    <div className="bg-white border border-border-hairline rounded-xl md:rounded-none md:-mt-1 p-5 hover:shadow transition-all relative overflow-hidden group">
      {/* Left status color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getStatusBorderColor(booking.status)}`}></div>

      <div className="flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center">
        {/* Mobile-only status badge */}
        <div className="md:hidden self-end absolute top-4 right-4">
          <Badge color={getStatusBadgeColor(booking.status)} variant="light">
            {translateStatus(booking.status)}
          </Badge>
        </div>

        {/* Detail Column */}
        <div className="md:col-span-3 flex flex-col w-full">
          <span className="text-xs font-bold text-outline mb-1">ID: #UT-{booking.id}</span>
          <h4 className="font-bold text-on-surface line-clamp-1 text-sm md:text-base">
            {booking.room.hotel.name}
          </h4>
          <span className="text-xs text-on-surface-variant font-medium mt-0.5">
            Phòng {booking.room.roomNumber} ({booking.room.type})
          </span>
        </div>

        {/* Guest Column */}
        <div className="md:col-span-3 flex items-center gap-3 w-full mt-2 md:mt-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {guestNameInitials || <IconUser size={18} />}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-on-surface text-sm">
              {booking.user.firstName} {booking.user.lastName}
            </span>
            <span className="text-xs text-outline">{booking.user.phone}</span>
          </div>
        </div>

        {/* Dates Column */}
        <div className="md:col-span-3 flex flex-col w-full mt-2 md:mt-0">
          <span className="font-bold text-on-surface text-sm">
            {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
          </span>
          <span className="text-xs text-outline mt-0.5">{getNights(booking.checkInDate, booking.checkOutDate)} đêm</span>
        </div>

        {/* Price Column */}
        <div className="md:col-span-2 flex flex-col w-full mt-2 md:mt-0">
          <span className="font-extrabold text-primary text-base md:text-lg">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(booking.totalPrice)}
          </span>
          <div className="hidden md:block mt-1">
            <Badge color={getStatusBadgeColor(booking.status)} variant="light" size="xs">
              {translateStatus(booking.status)}
            </Badge>
          </div>
        </div>

        {/* Actions Column */}
        <div className="md:col-span-1 flex items-center justify-end w-full mt-4 md:mt-0 gap-2">
          {actionLoadingId === booking.id ? (
            <Loader size="xs" color="var(--color-primary)" />
          ) : (
            <Menu shadow="md" width={180}>
              <Menu.Target>
                <button className="text-outline hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container-low">
                  <IconDotsVertical size={20} />
                </button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Trạng thái đơn</Menu.Label>
                {booking.status === "PENDING" && (
                  <>
                    <Menu.Item
                      color="green"
                      leftSection={<IconCheck size={14} />}
                      onClick={() => onUpdateStatus(booking.id, "CONFIRMED")}
                    >
                      Xác nhận đơn
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconX size={14} />}
                      onClick={() => onUpdateStatus(booking.id, "CANCELLED")}
                    >
                      Từ chối đơn
                    </Menu.Item>
                  </>
                )}
                {booking.status === "CONFIRMED" && (
                  <>
                    <Menu.Item
                      color="blue"
                      leftSection={<IconCheck size={14} />}
                      onClick={() => onUpdateStatus(booking.id, "COMPLETED")}
                    >
                      Hoàn thành đặt phòng
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconX size={14} />}
                      onClick={() => onUpdateStatus(booking.id, "CANCELLED")}
                    >
                      Hủy đặt phòng
                    </Menu.Item>
                  </>
                )}
                {booking.status !== "PENDING" && booking.status !== "CONFIRMED" && (
                  <Menu.Item disabled>Không có thao tác</Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
        </div>
      </div>
    </div>
  );
};

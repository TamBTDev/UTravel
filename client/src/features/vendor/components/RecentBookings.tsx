import { Badge } from "@mantine/core";
import { IconPhoto } from "@tabler/icons-react";

interface BookingItem {
  id: string;
  roomName: string;
  status: "Đã xác nhận" | "Chờ xử lý" | "Đã hủy";
  dates: string;
  guests: number;
  price: string;
  imageUrl?: string;
}

export const RecentBookings = () => {
  // TODO: add data later
  const bookings: BookingItem[] = [
    {
      id: "1",
      roomName: "Oceanview Suite",
      status: "Đã xác nhận",
      dates: "12 Th10 - 15 Th10",
      guests: 2,
      price: "10.500.000 ₫",
      imageUrl:
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=150&auto=format&fit=crop&q=60",
    },
    {
      id: "2",
      roomName: "Downtown Loft",
      status: "Chờ xử lý",
      dates: "18 Th10 - 20 Th10",
      guests: 1,
      price: "4.800.000 ₫",
      imageUrl:
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=150&auto=format&fit=crop&q=60",
    },
    {
      id: "3",
      roomName: "Garden Bungalow",
      status: "Đã xác nhận",
      dates: "22 Th10 - 29 Th10",
      guests: 4,
      price: "28.000.000 ₫",
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-border-hairline shadow-sm flex flex-col h-full">
      <div className="p-6 border-b border-border-hairline flex justify-between items-center">
        <h2 className="text-title-sm font-semibold text-on-surface">
          Đặt phòng gần đây
        </h2>
        <button className="text-primary font-bold text-sm hover:underline">
          Xem tất cả
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex gap-4 p-2.5 rounded-xl hover:bg-surface-container-low transition-colors duration-200 cursor-pointer"
          >
            {booking.imageUrl ? (
              <img
                alt={booking.roomName}
                className="w-16 h-16 rounded-lg object-cover border border-outline-variant shadow-sm shrink-0"
                src={booking.imageUrl}
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-surface-container-high border border-outline-variant flex items-center justify-center text-outline shrink-0">
                <IconPhoto size={24} />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h4 className="text-body-bold font-bold text-on-surface truncate">
                  {booking.roomName}
                </h4>
                <Badge
                  color={booking.status === "Đã xác nhận" ? "green" : "yellow"}
                  variant="light"
                  size="xs"
                  className="shrink-0"
                >
                  {booking.status}
                </Badge>
              </div>
              <p className="text-sm text-outline mt-1 truncate">
                {booking.dates} • {booking.guests} Khách
              </p>
              <p className="text-sm font-bold text-primary mt-1">
                {booking.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Loader, Alert } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconSearch,
  IconDownload,
  IconAlertCircle,
} from "@tabler/icons-react";
import { vendorService, VendorBooking } from "../../user/services/vendorService";
import { BookingFilterSidebar } from "./bookings/BookingFilterSidebar";
import { BookingRow } from "./bookings/BookingRow";

export const VendorBookingsView = () => {
  const [bookings, setBookings] = useState<VendorBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    ALL: true,
    CONFIRMED: false,
    PENDING: false,
    CANCELLED: false,
    COMPLETED: false,
  });
  const [selectedHotels, setSelectedHotels] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vendorService.getVendorBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Lỗi khi tải danh sách đơn đặt phòng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (bookingId: number, status: string) => {
    setActionLoadingId(bookingId);
    try {
      const res = await vendorService.updateVendorBookingStatus(bookingId, status);
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: status as any } : b))
        );
      }
    } catch (err: any) {
      alert(err.message || "Không thể cập nhật trạng thái đơn đặt phòng");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Extract unique hotels dynamically
  const uniqueHotels = Array.from(new Set(bookings.map((b) => b.room.hotel.name)));

  // Calculate status counts
  const getStatusCount = (status: string) => {
    if (status === "ALL") return bookings.length;
    return bookings.filter((b) => b.status === status).length;
  };

  const statusCounts = {
    ALL: getStatusCount("ALL"),
    CONFIRMED: getStatusCount("CONFIRMED"),
    PENDING: getStatusCount("PENDING"),
    CANCELLED: getStatusCount("CANCELLED"),
    COMPLETED: getStatusCount("COMPLETED"),
  };

  const handleStatusFilterChange = (status: string) => {
    if (status === "ALL") {
      setStatusFilters({
        ALL: true,
        CONFIRMED: false,
        PENDING: false,
        CANCELLED: false,
        COMPLETED: false,
      });
    } else {
      setStatusFilters((prev) => {
        const updated = { ...prev, ALL: false, [status]: !prev[status] };
        const anyChecked = Object.keys(updated).some((k) => k !== "ALL" && updated[k]);
        if (!anyChecked) {
          return { ALL: true, CONFIRMED: false, PENDING: false, CANCELLED: false, COMPLETED: false };
        }
        return updated;
      });
    }
  };

  const handleHotelFilterChange = (hotelName: string) => {
    setSelectedHotels((prev) =>
      prev.includes(hotelName) ? prev.filter((h) => h !== hotelName) : [...prev, hotelName]
    );
  };

  const removeVietnameseTones = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((booking) => {
    // Status check
    const matchesStatus = statusFilters.ALL || statusFilters[booking.status];

    // Hotel check
    const matchesHotel = selectedHotels.length === 0 || selectedHotels.includes(booking.room.hotel.name);

    // Date range check (check-in falls in range)
    let matchesDate = true;
    const [start, end] = dateRange;
    if (start || end) {
      const checkIn = new Date(booking.checkInDate);
      // Reset hours to start of day for accurate comparison
      checkIn.setHours(0, 0, 0, 0);

      if (start) {
        const sDate = new Date(start);
        sDate.setHours(0, 0, 0, 0);
        if (checkIn < sDate) matchesDate = false;
      }
      if (end) {
        const eDate = new Date(end);
        eDate.setHours(23, 59, 59, 999);
        if (checkIn > eDate) matchesDate = false;
      }
    }

    // Search check (Accent-insensitive)
    const normalizedQuery = removeVietnameseTones(searchQuery.toLowerCase());
    const fullName = `${booking.user.firstName} ${booking.user.lastName}`.toLowerCase();
    
    const matchesSearch =
      removeVietnameseTones(fullName).includes(normalizedQuery) ||
      removeVietnameseTones(booking.user.email.toLowerCase()).includes(normalizedQuery) ||
      booking.user.phone.includes(searchQuery) ||
      removeVietnameseTones(booking.room.hotel.name.toLowerCase()).includes(normalizedQuery) ||
      removeVietnameseTones(booking.room.roomNumber.toLowerCase()).includes(normalizedQuery) ||
      `#UT-${booking.id}`.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesHotel && matchesDate && matchesSearch;
  });

  // Export Filtered Bookings to CSV
  const handleExportCSV = () => {
    if (filteredBookings.length === 0) {
      alert("Không có đơn hàng nào để xuất!");
      return;
    }

    const headers = [
      "Mã đơn hàng",
      "Khách sạn",
      "Phòng",
      "Loại phòng",
      "Khách hàng",
      "Số điện thoại",
      "Email",
      "Ngày Check-In",
      "Ngày Check-Out",
      "Tổng thanh toán (VND)",
      "Trạng thái",
    ];

    const rows = filteredBookings.map((b) => [
      `UT-${b.id}`,
      b.room.hotel.name,
      b.room.roomNumber,
      b.room.type,
      `${b.user.firstName} ${b.user.lastName}`,
      b.user.phone,
      b.user.email,
      b.checkInDate.split("T")[0],
      b.checkOutDate.split("T")[0],
      b.totalPrice,
      b.status,
    ]);

    const csvContent =
      "\uFEFF" + // BOM for UTF-8 Support in Excel
      [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `UTravel_DanhSachDonHang_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top filter row */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 lg:max-w-2xl">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, tên khách, email, khách sạn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-border-hairline rounded-lg text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm font-medium"
          />
        </div>

        {/* Date filter & Export button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-64">
            <DatePickerInput
              type="range"
              placeholder="Chọn khoảng ngày lưu trú"
              value={dateRange}
              onChange={(val) => setDateRange(val as [Date | null, Date | null])}
              clearable
              className="w-full"
            />
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-border-hairline rounded-lg text-on-surface font-semibold hover:shadow transition-all text-sm shrink-0"
          >
            <IconDownload size={18} />
            <span>Xuất file CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left filters, Right results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filters - Desktop Sticky */}
        <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
          <BookingFilterSidebar
            statusFilters={statusFilters}
            onStatusFilterChange={handleStatusFilterChange}
            uniqueHotels={uniqueHotels}
            selectedHotels={selectedHotels}
            onHotelFilterChange={handleHotelFilterChange}
            statusCounts={statusCounts}
          />
        </aside>

        {/* Right Results list */}
        <section className="lg:col-span-9 space-y-3">
          {/* Table Header (Desktop Only) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-low rounded-t-xl border-b border-border-hairline text-outline font-bold text-xs uppercase tracking-wider">
            <div className="col-span-3">Chi tiết đặt phòng</div>
            <div className="col-span-3">Khách hàng</div>
            <div className="col-span-3">Ngày lưu trú</div>
            <div className="col-span-2">Tổng thanh toán</div>
            <div className="col-span-1 text-right">Thao tác</div>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
              <Loader color="var(--color-primary)" size="md" />
              <p className="text-sm text-on-surface-variant font-medium mt-3">Đang tải dữ liệu đơn đặt phòng...</p>
            </div>
          ) : error ? (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" className="rounded-lg">
              {error}
            </Alert>
          ) : filteredBookings.length === 0 ? (
            <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
                <IconSearch size={32} />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-1">Không tìm thấy đơn hàng nào</h3>
              <p className="text-on-surface-variant max-w-sm">
                Vui lòng đổi bộ lọc hoặc từ khóa tìm kiếm để hiển thị kết quả.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <BookingRow
                  key={booking.id}
                  booking={booking}
                  actionLoadingId={actionLoadingId}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

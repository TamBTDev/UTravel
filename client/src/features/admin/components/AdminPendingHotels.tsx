import { useState, useEffect } from "react";
import { Loader, Alert } from "@mantine/core";
import {
  IconCheck,
  IconX,
  IconAlertCircle,
  IconBuilding,
  IconMapPin,
  IconBuildingStore,
  IconStar,
} from "@tabler/icons-react";
import { adminService, PendingHotel } from "../services/adminService";
import dayjs from "dayjs";

export const AdminPendingHotels = () => {
  const [hotels, setHotels] = useState<PendingHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAllAdminHotels(undefined, filterStatus === "ALL" ? undefined : filterStatus, undefined);
      if (res.success) {
        setHotels(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.error || err.message || "Lỗi khi tải danh sách khách sạn chờ duyệt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [filterStatus]);

  const handleStatusUpdate = async (hotelId: number, status: "APPROVED" | "REJECTED") => {
    let rejectReason = "";
    if (status === "REJECTED") {
      const reason = window.prompt("Nhập lý do từ chối khách sạn này:");
      if (reason === null) return; // Cancelled
      rejectReason = reason.trim() || "Không đạt tiêu chuẩn duyệt của hệ thống";
    } else {
      if (!window.confirm("Bạn có chắc chắn muốn Duyệt khách sạn này lên sàn?")) return;
    }

    setActionId(hotelId);
    try {
      const res = await adminService.updateHotelStatus(hotelId, status, rejectReason);
      if (res.success) {
        setHotels((prev) => prev.filter((h) => h.id !== hotelId));
      }
    } catch (err: any) {
      alert(err.error || err.message || "Lỗi khi cập nhật trạng thái khách sạn");
    } finally {
      setActionId(null);
    }
  };

  const getHotelImage = (imagesStr: string) => {
    try {
      const parsed = JSON.parse(imagesStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
    } catch (e) {
      // Not a JSON or empty
    }
    // Default premium hotel fallback image
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <div className="absolute top-3 left-3 px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold tracking-wider uppercase rounded-md shadow-sm border border-yellow-200">CHỜ DUYỆT</div>;
      case "APPROVED":
        return <div className="absolute top-3 left-3 px-2.5 py-1 bg-green-100 text-green-800 text-[10px] font-bold tracking-wider uppercase rounded-md shadow-sm border border-green-200">ĐÃ DUYỆT</div>;
      case "REJECTED":
        return <div className="absolute top-3 left-3 px-2.5 py-1 bg-red-100 text-red-800 text-[10px] font-bold tracking-wider uppercase rounded-md shadow-sm border border-red-200">BỊ TỪ CHỐI</div>;
      case "DRAFT":
        return <div className="absolute top-3 left-3 px-2.5 py-1 bg-gray-100 text-gray-800 text-[10px] font-bold tracking-wider uppercase rounded-md shadow-sm border border-gray-200">BẢN NHÁP</div>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border-hairline rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Quản lý Khách sạn Toàn sàn</h3>
          <p className="text-sm text-outline mt-0.5 font-medium">Theo dõi, kiểm duyệt và quản lý tất cả các khách sạn trên hệ thống UTravel.</p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-border-hairline rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="ALL">Tất cả khách sạn</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt (Đang hoạt động)</option>
          <option value="REJECTED">Bị từ chối</option>
          <option value="DRAFT">Bản nháp</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <Loader color="var(--color-primary)" size="md" />
          <p className="text-sm text-on-surface-variant font-medium mt-3">Đang tải danh sách khách sạn...</p>
        </div>
      ) : error ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" className="rounded-lg">
          {error}
        </Alert>
      ) : hotels.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
            <IconBuilding size={32} />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">Không có khách sạn nào chờ duyệt</h3>
          <p className="text-on-surface-variant max-w-sm">
            Hiện tại không có khách sạn mới nào được đối tác đăng tải gửi duyệt.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => {
            let amenities: string[] = [];
            try {
              amenities = JSON.parse(hotel.amenities);
            } catch (e) {
              amenities = [];
            }

            return (
              <div
                key={hotel.id}
                className="bg-white rounded-xl border border-border-hairline overflow-hidden transition-all duration-200 hover:shadow-lg flex flex-col h-full shadow-sm"
              >
                {/* Image and status badge */}
                <div className="relative h-48 w-full bg-surface-container-high">
                  <img
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    src={getHotelImage(hotel.images)}
                  />
                  {getStatusBadge(hotel.approvalStatus)}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] text-white font-semibold">
                    Đăng ngày: {dayjs(hotel.createdAt).format("DD/MM/YYYY")}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-grow gap-3.5">
                  <div>
                    {/* Hotel name and rating */}
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-bold text-on-surface text-base line-clamp-1" title={hotel.name}>
                        {hotel.name}
                      </h4>
                      <div className="flex items-center gap-0.5 text-yellow-500 bg-yellow-50 px-1.5 py-0.5 rounded text-xs font-bold shrink-0">
                        <IconStar size={13} fill="currentColor" />
                        <span>{hotel.rating}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-outline">
                      <IconMapPin size={14} className="shrink-0" />
                      <span className="text-xs font-semibold truncate">
                        {hotel.location}, {hotel.city}
                      </span>
                    </div>
                  </div>

                  {/* Vendor Storefront info */}
                  <div className="flex items-center gap-1.5 border-b border-border-hairline pb-2.5">
                    <IconBuildingStore size={15} className="text-primary shrink-0" />
                    <span className="text-xs text-primary font-bold">
                      {hotel.vendor.shopName}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-outline font-medium line-clamp-2 leading-relaxed" title={hotel.description}>
                    {hotel.description || "Chưa có mô tả chi tiết."}
                  </p>

                  {/* Amenities Badges */}
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {amenities.slice(0, 4).map((item, index) => (
                      <span
                        key={index}
                        className="text-[10px] bg-surface-container-high border border-border-hairline px-2 py-0.5 rounded text-outline font-bold uppercase tracking-wider"
                      >
                        {item}
                      </span>
                    ))}
                    {amenities.length > 4 && (
                      <span className="text-[10px] bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded font-bold">
                        +{amenities.length - 4} tiện ích
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  {hotel.approvalStatus === "PENDING" && (
                    <div className="pt-4 border-t border-border-hairline flex gap-2">
                      <button
                        disabled={actionId === hotel.id}
                        onClick={() => handleStatusUpdate(hotel.id, "APPROVED")}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
                      >
                        <IconCheck size={14} />
                        Phê duyệt
                      </button>
                      <button
                        disabled={actionId === hotel.id}
                        onClick={() => handleStatusUpdate(hotel.id, "REJECTED")}
                        className="px-3 flex items-center justify-center bg-red-50 hover:bg-red-100 disabled:bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition-colors shadow-sm disabled:cursor-not-allowed"
                        title="Từ chối duyệt"
                      >
                        <IconX size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

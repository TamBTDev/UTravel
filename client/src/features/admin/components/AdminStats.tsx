import { useState, useEffect } from "react";
import { Loader, Alert } from "@mantine/core";
import {
  IconUsers,
  IconBuildingStore,
  IconCoin,
  IconTrendingUp,
  IconAlertCircle,
  IconMapPin,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  adminService,
  AdminStats as StatsType,
  PendingVendor,
} from "../services/adminService";

export const AdminStats = () => {
  const [stats, setStats] = useState<StatsType | null>(null);
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, vendorsRes] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getPendingVendors(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (vendorsRes.success) {
        setPendingVendors(vendorsRes.data.slice(0, 3)); // show top 3 pending
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Lỗi khi tải thông tin bảng điều khiển");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVendorStatusUpdate = async (
    vendorId: number,
    status: "APPROVED" | "REJECTED",
  ) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn ${status === "APPROVED" ? "Phê duyệt" : "Từ chối"} đối tác này?`,
      )
    )
      return;

    setActionId(vendorId);
    try {
      const res = await adminService.updateVendorStatus(vendorId, status);
      if (res.success) {
        setPendingVendors((prev) => prev.filter((v) => v.id !== vendorId));
        // Refresh stats since vendor count changes
        const statsRes = await adminService.getAdminStats();
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err: any) {
      alert(err.message || "Lỗi khi cập nhật trạng thái");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
        <Loader color="var(--color-primary)" size="md" />
        <p className="text-sm text-on-surface-variant font-medium mt-3">
          Đang tải dữ liệu tổng quan...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        color="red"
        variant="light"
        className="rounded-lg"
      >
        {error}
      </Alert>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* System Health & High-Level KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-white border border-border-hairline rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-sm">
              Người dùng đang hoạt động
            </span>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IconUsers size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface">
              {stats.totalUsers.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1 text-green-600">
              <IconTrendingUp size={15} />
              <span className="font-bold text-xs">
                +12.5% so với tháng trước
              </span>
            </div>
          </div>
        </div>

        {/* Business Partners */}
        <div className="bg-white border border-border-hairline rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-sm">
              Tổng nhà cung cấp
            </span>
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IconBuildingStore size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface">
              {stats.totalVendors.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1 text-green-600">
              <IconTrendingUp size={15} />
              <span className="font-bold text-xs">
                +4.2% so với tháng trước
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white border border-border-hairline rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-sm">
              Doanh thu hoa hồng
            </span>
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IconCoin size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface">
              {stats.totalRevenue.toLocaleString("vi-VN")}{" "}
              <span className="text-sm font-semibold">VND</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-green-600">
              <IconTrendingUp size={15} />
              <span className="font-bold text-xs">
                +8.1% so với tháng trước
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Partner Approvals */}
        <section className="lg:col-span-2 bg-white border border-border-hairline rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-5 border-b border-border-hairline flex justify-between items-center bg-surface-container-low/30">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
              Yêu cầu đối tác đang chờ duyệt
            </h3>
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-bold">
              {pendingVendors.length} mới
            </span>
          </div>

          <div className="divide-y divide-border-hairline flex-1">
            {pendingVendors.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center text-outline h-full">
                <IconBuildingStore size={40} className="stroke-[1.5] mb-2" />
                <p className="text-xs font-semibold">
                  Tất cả yêu cầu đăng ký đối tác đã được duyệt.
                </p>
              </div>
            ) : (
              pendingVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="p-6 flex items-start gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0 text-base">
                    {vendor.shopName.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-on-surface text-base truncate">
                          {vendor.shopName}
                        </h4>
                        <p className="text-outline text-xs font-semibold flex items-center gap-1 mt-0.5">
                          <IconMapPin size={13} />
                          Đại diện: {vendor.user.firstName}{" "}
                          {vendor.user.lastName} • {vendor.user.email}
                        </p>
                      </div>
                      <span className="bg-yellow-50 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-100 uppercase tracking-wide shrink-0">
                        Chờ xem xét
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-outline font-medium line-clamp-2 leading-relaxed">
                      {vendor.description ||
                        "Đăng ký mở gian hàng cung cấp dịch vụ lưu trú khách sạn trên nền tảng UTravel."}
                    </p>

                    <div className="mt-3 flex gap-2">
                      <button
                        disabled={actionId === vendor.id}
                        onClick={() =>
                          handleVendorStatusUpdate(vendor.id, "APPROVED")
                        }
                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 text-xs shadow-sm"
                      >
                        <IconCheck size={14} />
                        Phê duyệt
                      </button>
                      <button
                        disabled={actionId === vendor.id}
                        onClick={() =>
                          handleVendorStatusUpdate(vendor.id, "REJECTED")
                        }
                        className="border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 disabled:bg-red-50 px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 text-xs shadow-sm"
                      >
                        <IconX size={14} />
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Column: Recent Activity & System Health */}
        <div className="space-y-6">
          {/* System Health */}
          <section className="bg-white border border-border-hairline rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider mb-4">
              Trạng thái hệ thống
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-outline">Thời gian hoạt động API</span>
                  <span className="font-bold text-green-600">99.9%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-green-600 h-1.5 rounded-full"
                    style={{ width: "99.9%" }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-outline">Tải máy chủ</span>
                  <span className="font-bold text-orange-600">42%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-orange-500 h-1.5 rounded-full"
                    style={{ width: "42%" }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 p-3 bg-green-50/50 rounded-lg border border-green-100">
                <IconCheck size={16} className="text-green-600 shrink-0" />
                <span className="text-[11px] text-green-800 font-bold">
                  Tất cả các dịch vụ đang hoạt động bình thường.
                </span>
              </div>
            </div>
          </section>

          {/* Recent Activity Log */}
          <section className="bg-white border border-border-hairline rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border-hairline bg-surface-container-low/30">
              <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
                Hoạt động gần đây
              </h3>
            </div>
            <div className="p-5">
              <div className="relative border-l-2 border-slate-100 ml-2 space-y-5">
                {/* Log Item 1 */}
                <div className="relative pl-5">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-600 border border-white"></div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-on-surface">
                      Quản trị viên
                    </span>
                    <span className="text-[10px] text-outline font-medium">
                      2 phút trước
                    </span>
                  </div>
                  <p className="text-xs text-outline font-medium">
                    Đã cập nhật cài đặt chính sách hoàn hủy toàn hệ thống.
                  </p>
                </div>
                {/* Log Item 2 */}
                <div className="relative pl-5">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-green-600 border border-white"></div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-on-surface">
                      Hệ thống
                    </span>
                    <span className="text-[10px] text-outline font-medium">
                      15 phút trước
                    </span>
                  </div>
                  <p className="text-xs text-outline font-medium">
                    Đồng bộ doanh thu hàng ngày thành công với cổng thanh toán
                    Stripe.
                  </p>
                </div>
                {/* Log Item 3 */}
                <div className="relative pl-5">
                  <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-orange-600 border border-white"></div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-on-surface">
                      Nguyễn Văn A
                    </span>
                    <span className="text-[10px] text-outline font-medium">
                      1 giờ trước
                    </span>
                  </div>
                  <p className="text-xs text-outline font-medium">
                    Đã phê duyệt hồ sơ đối tác mới: "Saigon Stays".
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

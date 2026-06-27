import { useState, useEffect } from "react";
import { Drawer, Loader } from "@mantine/core";
import {
  IconMenu2,
  IconDownload,
  IconBed,
  IconBookmark,
  IconStar,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { io } from "socket.io-client";
import { useAppSelector } from "@/hooks/useAppStore";
import { VendorSidebar } from "../components/VendorSidebar";
import { KpiCard } from "../components/KpiCard";
import { RevenueChart } from "../components/RevenueChart";
import { RecentBookings } from "../components/RecentBookings";
import { VendorBookingsView } from "../components/VendorBookingsView";
import { VendorRevenueView } from "../components/VendorRevenueView";
import { VendorReviewsView } from "../components/VendorReviewsView";
import {
  vendorService,
  VendorDashboardStats,
  VendorProfile,
} from "../../user/services/vendorService";
import { VendorListingsView } from "../components/VendorListingsView";
import { VendorSettingsView } from "../components/VendorSettingsView";
import { VendorPromotionsView } from "../components/VendorPromotionsView";

export const VendorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAppSelector((s) => s.auth.user);

  const [stats, setStats] = useState<VendorDashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [profile, setProfile] = useState<VendorProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await vendorService.getVendorProfile();
        if (res.success) {
          setProfile(res.data);

          // Connect to Socket.IO when profile is loaded
          const socket = io(
            import.meta.env.VITE_API_URL || "http://localhost:3000",
          );

          socket.on("connect", () => {
            console.log("Connected to Websocket Server");
            socket.emit("join_vendor_room", res.data.id);
          });

          socket.on("new_booking", (data: any) => {
            notifications.show({
              title: "🎉 Đơn Đặt Phòng Mới!",
              message: `Khách hàng ${data.customerName} vừa đặt phòng tại ${data.hotelName}. Giá trị: ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(data.totalPrice)}`,
              color: "blue",
              autoClose: 10000,
            });
          });

          socket.on("new_review", (data: any) => {
            notifications.show({
              title: "⭐ Đánh Giá Mới!",
              message: `Khách hàng ${data.reviewerName} vừa đánh giá ${data.rating} sao cho ${data.hotelName}.`,
              color: "yellow",
              autoClose: 10000,
            });
          });

          return () => {
            socket.disconnect();
          };
        }
      } catch (e) {}
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === "dashboard") {
      const fetchStats = async () => {
        setLoadingStats(true);
        setStatsError(null);
        try {
          const res = await vendorService.getVendorDashboardStats();
          if (res.success) {
            setStats(res.data);
          }
        } catch (err: any) {
          console.error("Error fetching vendor dashboard stats:", err);
          setStatsError(err.message || "Không thể tải dữ liệu thống kê");
        } finally {
          setLoadingStats(false);
        }
      };
      fetchStats();
    }
  }, [activeTab]);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return "Bảng điều khiển";
      case "listings":
        return "Danh sách khách sạn";
      case "bookings":
        return "Quản lý đặt phòng";
      case "earnings":
        return "Báo cáo doanh thu";
      case "reviews":
        return "Quản lý bình luận";
      case "promotions":
        return "Quản lý khuyến mãi";
      case "settings":
        return "Cài đặt hệ thống";
      default:
        return "Chi tiết";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <VendorSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        profile={profile}
      />

      {/* Mobile Drawer Navigation */}
      <Drawer
        opened={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        size="280px"
        padding="0"
        withCloseButton={false}
        className="md:hidden"
      >
        <div className="h-full">
          <VendorSidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              // setSelectedHotel(null);
              setMobileMenuOpen(false);
            }}
            profile={profile}
          />
        </div>
      </Drawer>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 bg-background overflow-y-auto flex flex-col h-full">
        {/* Top Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-border-hairline shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="text-primary hover:bg-surface-container-low p-1.5 rounded-lg transition-colors"
            >
              <IconMenu2 size={24} />
            </button>
            <h1 className="text-title-sm font-semibold text-primary">
              {profile?.shopName || "Kênh Đối Tác"}
            </h1>
          </div>
          <img
            alt="Vendor Profile"
            className="w-8 h-8 rounded-full object-cover border border-outline-variant"
            src={
              profile?.logo ||
              user?.avatar ||
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60"
            }
          />
        </div>

        <div className="max-w-7xl mx-auto w-full p-6 md:p-8 flex flex-col gap-8">
          {/* Header */}
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-primary tracking-tight md:text-4xl">
                {getTabTitle(activeTab)}
              </h1>
              <p className="text-sm md:text-base text-on-surface-variant mt-1">
                Chào mừng quay trở lại, {user?.firstName || "Đối tác"}. Dưới đây
                là tình hình hoạt động của các khách sạn hôm nay.
              </p>
            </div>
            {activeTab === "dashboard" && (
              <div className="flex items-center gap-3">
                <button className="bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 text-sm">
                  <IconDownload size={16} /> Xuất báo cáo
                </button>
              </div>
            )}
          </header>

          {activeTab === "dashboard" && (
            <>
              {/* KPI Bento Grid */}
              {loadingStats ? (
                <div className="bg-white rounded-xl border border-hairline p-8 flex flex-col items-center justify-center min-h-[140px] shadow-sm">
                  <Loader size="sm" color="var(--color-primary)" />
                  <span className="text-xs text-outline font-medium mt-2">
                    Đang tải dữ liệu thống kê...
                  </span>
                </div>
              ) : statsError ? (
                <div className="bg-red-50/50 border border-red-200 rounded-xl p-4 flex items-center justify-center text-xs text-error font-medium shadow-sm">
                  {statsError}
                </div>
              ) : (
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <KpiCard
                    title="Phòng trống"
                    value={stats?.availableRooms ?? 0}
                    badgeText="Hoạt động"
                    badgeType="neutral"
                    subtext="Sẵn sàng đón khách hôm nay"
                    icon={<IconBed size={36} className="text-primary" />}
                  />
                  <KpiCard
                    title="Đặt phòng mới"
                    value={stats?.newBookingsCount ?? 0}
                    badgeText="24h qua"
                    badgeType="neutral"
                    subtext="Trong 24 giờ qua"
                    icon={<IconBookmark size={36} className="text-secondary" />}
                  />
                  <KpiCard
                    title="Đánh giá trung bình"
                    value={stats?.averageRating ?? 0}
                    badgeText={`${stats?.averageRating ? "Đánh giá" : "Chưa có"}`}
                    badgeType="neutral"
                    subtext="Từ tất cả các khách sạn"
                    icon={<IconStar size={36} className="text-yellow-500" />}
                  />
                </section>
              )}

              {/* Data & Analytics Section */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Overview Chart */}
                <div className="lg:col-span-2">
                  <RevenueChart />
                </div>
                {/* Recent Bookings List */}
                <div>
                  <RecentBookings onViewAll={() => setActiveTab("bookings")} />
                </div>
              </section>
            </>
          )}

          {activeTab === "listings" && <VendorListingsView />}

          {activeTab === "bookings" && <VendorBookingsView />}

          {activeTab === "earnings" && <VendorRevenueView />}

          {activeTab === "reviews" && <VendorReviewsView />}

          {activeTab === "promotions" && <VendorPromotionsView />}

          {activeTab === "settings" && <VendorSettingsView />}

          {activeTab !== "dashboard" &&
            activeTab !== "bookings" &&
            activeTab !== "earnings" &&
            activeTab !== "reviews" &&
            activeTab !== "listings" &&
            activeTab !== "promotions" &&
            activeTab !== "settings" && (
              <div className="bg-white p-12 rounded-xl border border-hairline text-center flex flex-col items-center justify-center min-h-[300px]">
                <h3 className="text-lg font-bold text-on-surface mb-2">
                  Tính năng "{getTabTitle(activeTab)}" đang được phát triển
                </h3>
                <p className="text-on-surface-variant max-w-sm">
                  Vui lòng quay lại sau khi tính năng này được hoàn thiện đầy
                  đủ.
                </p>
              </div>
            )}
        </div>
      </main>
    </div>
  );
};

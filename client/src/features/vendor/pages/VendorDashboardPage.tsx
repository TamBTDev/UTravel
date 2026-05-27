import { useState } from "react";
import { Drawer } from "@mantine/core";
import {
  IconMenu2,
  IconDownload,
  IconBed,
  IconBookmark,
  IconStar,
} from "@tabler/icons-react";
import { useAppSelector } from "@/hooks/useAppStore";
import { VendorSidebar } from "../components/VendorSidebar";
import { KpiCard } from "../components/KpiCard";
import { RevenueChart } from "../components/RevenueChart";
import { RecentBookings } from "../components/RecentBookings";

export const VendorDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAppSelector((s) => s.auth.user);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return "Bảng điều khiển";
      case "listings":
        return "Danh sách chỗ nghỉ";
      case "bookings":
        return "Quản lý đặt phòng";
      case "earnings":
        return "Báo cáo doanh thu";
      case "settings":
        return "Cài đặt hệ thống";
      default:
        return "Chi tiết";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <VendorSidebar activeTab={activeTab} onTabChange={setActiveTab} />

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
              setMobileMenuOpen(false);
            }}
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
            <h1 className="text-title-sm font-semibold text-primary">Kênh Đối Tác</h1>
          </div>
          <img
            alt="Vendor Profile"
            className="w-8 h-8 rounded-full object-cover border border-outline-variant"
            src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60"}
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
                Chào mừng quay trở lại, {user?.firstName || "Đối tác"}. Dưới đây là tình hình hoạt động của các chỗ nghỉ hôm nay.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-white border border-outline-variant hover:bg-surface-container-low text-on-surface font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 text-sm">
                <IconDownload size={16} /> Xuất báo cáo
              </button>
            </div>
          </header>

          {activeTab === "dashboard" ? (
            <>
              {/* KPI Bento Grid */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <KpiCard
                  title="Phòng trống"
                  value={24}
                  badgeText="12%"
                  badgeType="up"
                  subtext="Sẵn sàng đón khách hôm nay"
                  icon={<IconBed size={36} className="text-primary" />}
                />
                <KpiCard
                  title="Đặt phòng mới"
                  value={8}
                  badgeText="3%"
                  badgeType="up"
                  subtext="Trong 24 giờ qua"
                  icon={<IconBookmark size={36} className="text-secondary" />}
                />
                <KpiCard
                  title="Đánh giá trung bình"
                  value={4.8}
                  badgeText="0%"
                  badgeType="neutral"
                  subtext="Từ tất cả các chỗ nghỉ"
                  icon={<IconStar size={36} className="text-yellow-500" />}
                />
              </section>

              {/* Data & Analytics Section */}
              <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Overview Chart */}
                <div className="lg:col-span-2">
                  <RevenueChart />
                </div>
                {/* Recent Bookings List */}
                <div>
                  <RecentBookings />
                </div>
              </section>
            </>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-hairline text-center flex flex-col items-center justify-center min-h-[300px]">
              <h3 className="text-lg font-bold text-on-surface mb-2">
                Tính năng "{getTabTitle(activeTab)}" đang được phát triển
              </h3>
              <p className="text-on-surface-variant max-w-sm">
                Vui lòng quay lại sau khi tính năng này được hoàn thiện đầy đủ.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

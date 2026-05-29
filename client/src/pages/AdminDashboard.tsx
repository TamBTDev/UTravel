import { useState } from "react";
import { Drawer } from "@mantine/core";
import { IconMenu2, IconBell, IconSearch } from "@tabler/icons-react";
import { useAppSelector } from "@/hooks/useAppStore";
import { AdminSidebar } from "../features/admin/components/AdminSidebar";
import { AdminStats } from "../features/admin/components/AdminStats";
import { AdminPendingVendors } from "../features/admin/components/AdminPendingVendors";
import { AdminPendingHotels } from "../features/admin/components/AdminPendingHotels";
import { AdminUsersView } from "../features/admin/components/AdminUsersView";

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = useAppSelector((s) => s.auth.user);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return "Tổng quan hệ thống";
      case "vendors":
        return "Duyệt đối tác đăng ký";
      case "hotels":
        return "Duyệt tin đăng khách sạn";
      case "users":
        return "Quản lý người dùng";
      default:
        return "Chi tiết";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Desktop Sidebar */}
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

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
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setMobileMenuOpen(false);
            }}
          />
        </div>
      </Drawer>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 bg-[#f8fafc] overflow-y-auto flex flex-col h-full">
        {/* Top App Bar Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-border-hairline h-20 flex items-center justify-between px-6 md:px-8 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-primary hover:bg-surface-container-low p-2 rounded-lg transition-colors"
            >
              <IconMenu2 size={22} />
            </button>
            <h2 className="text-xl font-bold text-on-surface">
              {getTabTitle(activeTab)}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Search input preview matching mockup */}
            <div className="relative hidden lg:block w-72">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#f8fafc] border border-border-hairline rounded-lg text-xs font-semibold placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>

            {/* Notification Badge */}
            <button className="relative text-outline hover:text-primary transition-colors p-1.5 rounded-full hover:bg-surface-container-low/60">
              <IconBell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2.5 pl-4 border-l border-border-hairline">
              <img
                alt="Admin Profile"
                className="w-8 h-8 rounded-full object-cover border border-border-hairline shadow-sm"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
              />
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <div className="max-w-7xl mx-auto w-full p-6 md:p-8 flex flex-col gap-6">
          {/* Welcome subtitle */}
          <div className="-mb-2">
            <p className="text-sm font-semibold text-outline">
              Chào mừng quay trở lại, <span className="text-primary font-bold">{user?.firstName || "Quản trị viên"}</span>. Dưới đây là tình hình hoạt động của hệ thống hôm nay.
            </p>
          </div>

          {/* Tab Renderings */}
          {activeTab === "dashboard" && <AdminStats />}
          {activeTab === "vendors" && <AdminPendingVendors />}
          {activeTab === "hotels" && <AdminPendingHotels />}
          {activeTab === "users" && <AdminUsersView />}
        </div>
      </main>
    </div>
  );
};

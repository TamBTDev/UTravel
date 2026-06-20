import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { logout } from "@/app/store/authSlice";
import { useNavigate } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconBuilding,
  IconCalendar,
  IconTrendingUp,
  IconSettings,
  IconHelp,
  IconLogout,
  IconPlus,
  IconMessage2,
} from "@tabler/icons-react";

import { VendorProfile } from "../../user/services/vendorService";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  profile?: VendorProfile | null;
}

export const VendorSidebar = ({ activeTab = "dashboard", onTabChange, profile }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Bảng điều khiển", icon: <IconLayoutDashboard size={20} /> },
    { id: "listings", label: "Khách sạn", icon: <IconBuilding size={20} /> },
    { id: "bookings", label: "Đơn đặt phòng", icon: <IconCalendar size={20} /> },
    { id: "earnings", label: "Doanh thu", icon: <IconTrendingUp size={20} /> },
    { id: "reviews", label: "Bình luận", icon: <IconMessage2 size={20} /> },
    { id: "settings", label: "Cài đặt", icon: <IconSettings size={20} /> },
  ];

  return (
    <nav className="hidden md:flex flex-col bg-surface-container-low w-64 h-full border-r border-border-hairline fixed left-0 top-0 p-4 shrink-0 z-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <img
          alt="Vendor Profile"
          className="w-10 h-10 rounded-full object-cover border border-outline-variant"
          src={profile?.logo || user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60"}
        />
        <div>
          <h2 className="text-title-sm font-semibold text-primary" title={profile?.shopName}>
            {profile?.shopName || "Kênh Đối Tác"}
          </h2>
          <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant line-clamp-1">
            {user?.firstName} {user?.lastName}
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange?.(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-secondary-container text-on-secondary-container font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Links */}
      <div className="mt-auto pt-4 border-t border-border-hairline">
        <ul className="space-y-1">
          <li>
            <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-on-surface-variant font-medium hover:bg-surface-container-high transition-all duration-200">
              <IconHelp size={20} />
              Trợ giúp
            </button>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-error font-medium hover:bg-error-container/20 transition-all duration-200"
            >
              <IconLogout size={20} />
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

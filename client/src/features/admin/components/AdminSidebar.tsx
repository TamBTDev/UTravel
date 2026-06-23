import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { logout } from "@/app/store/authSlice";
import { useNavigate } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconBuilding,
  IconUsers,
  IconCertificate,
  IconLogout,
  IconArrowBackUp,
  IconCashBanknote,
} from "@tabler/icons-react";

interface AdminSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AdminSidebar = ({ activeTab = "dashboard", onTabChange }: AdminSidebarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard", label: "Bảng điều khiển", icon: <IconLayoutDashboard size={20} /> },
    { id: "vendors", label: "Duyệt đối tác", icon: <IconCertificate size={20} /> },
    { id: "hotels", label: "Duyệt khách sạn", icon: <IconBuilding size={20} /> },
    { id: "users", label: "Quản lý người dùng", icon: <IconUsers size={20} /> },
    { id: "withdraw-requests", label: "Yêu cầu rút tiền", icon: <IconCashBanknote size={20} /> },
  ];

  return (
    <nav className="hidden md:flex flex-col bg-white w-64 h-full border-r border-border-hairline fixed left-0 top-0 py-6 px-4 shrink-0 z-20 shadow-sm">
      {/* Header Logo */}
      <div className="mb-6 px-2">
        <h1 className="text-xl font-black text-primary tracking-wide">
          UTravel Admin
        </h1>
      </div>

      {/* Admin Profile Card */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-surface-container-low/40 rounded-xl border border-border-hairline/60">
        <img
          alt="Ảnh đại diện quản trị viên"
          className="w-10 h-10 rounded-full object-cover border border-border-hairline shadow-sm"
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
        />
        <div className="min-w-0">
          <div className="font-bold text-on-surface text-sm truncate">
            {user ? `${user.firstName} ${user.lastName}` : "Quản trị viên"}
          </div>
          <div className="text-[10px] text-outline font-bold uppercase tracking-wider mt-0.5">
            Quản lý hệ thống
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? "bg-primary text-white font-bold shadow-sm"
                  : "text-outline hover:text-on-surface hover:bg-surface-container-low/60 font-semibold"
              }`}
            >
              <span className={`shrink-0 ${isActive ? "text-white" : "text-outline group-hover:text-on-surface"}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Footer Links */}
      <div className="mt-auto pt-4 border-t border-border-hairline space-y-1">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-outline font-semibold hover:text-on-surface hover:bg-surface-container-low/60 transition-all duration-200"
        >
          <IconArrowBackUp size={20} className="text-outline" />
          Về trang chủ
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-600 font-bold hover:bg-red-50 transition-all duration-200"
        >
          <IconLogout size={20} className="text-red-500" />
          Đăng xuất
        </button>
      </div>
    </nav>
  );
};

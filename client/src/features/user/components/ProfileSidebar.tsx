import { IconUser, IconLock, IconLink, IconBell, IconCreditCard, IconBuildingStore } from "@tabler/icons-react";
import { useAppSelector } from "@/hooks/useAppStore";

interface ProfileSidebarProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

export const ProfileSidebar = ({ activeTab, onTabChange }: ProfileSidebarProps) => {
  const user = useAppSelector((s) => s.auth.user);
  const isVendor = user?.role === "VENDOR";

  const menuItems = [
    { id: "personal", label: "Thông tin cá nhân", icon: IconUser },
    { id: "security", label: "Mật khẩu & Bảo mật", icon: IconLock },
    { id: "linked", label: "Tài khoản liên kết", icon: IconLink },
    { id: "notifications", label: "Thông báo", icon: IconBell },
    { id: "payments", label: "Phương thức thanh toán", icon: IconCreditCard },
    {
      id: "register-vendor",
      label: isVendor ? "Quản lý đối tác" : "Đăng ký đối tác",
      icon: IconBuildingStore,
    },
  ];

  return (
    <aside className="w-64 hidden md:flex flex-col gap-2">
      <div className="mb-6 px-4">
        <h2 className="text-headline text-primary">Tài khoản</h2>
      </div>
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          return (
            <a
              key={item.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-secondary-container text-on-secondary-container font-semibold"
                  : "text-on-surface-variant hover:bg-surface-high font-medium"
              }`}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (onTabChange) onTabChange(item.id);
              }}
            >
              <Icon size={20} />
              {item.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
};

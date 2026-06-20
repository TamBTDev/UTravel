import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Avatar, Burger, Drawer, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout, IconUser, IconDashboard, IconStar, IconWallet } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { logout } from "@/app/store/authSlice";
import { USER_ROLES } from "@shared/constants/roles";
import { userService } from "@/features/user/services/userService";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.svg";

const formatVND = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [opened, { toggle, close }] = useDisclosure(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      userService.getWallet().then((w) => setWalletBalance(w?.balance ?? 0)).catch(() => {});
    } else {
      setWalletBalance(null);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
    close();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    close();
  };

  const fullName = user ? `${user.firstName} ${user.lastName}` : "";
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="h-[72px] bg-white border-b border-hairline sticky top-0 z-50">
        <div className="page-container h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <img
              alt="UTravel Logo"
              className="h-10 w-10 rounded-md transition-transform group-hover:scale-105"
              src={logo}
            />
            <span className="text-headline font-extrabold text-primary tracking-tight">
              UTravel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`transition-colors cursor-pointer ${
                isActive("/")
                  ? "text-primary text-body-bold border-b-2 border-primary pb-1"
                  : "text-on-surface-variant font-semibold hover:text-primary pb-1 border-b-2 border-transparent"
              }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/hotels"
              className={`transition-colors cursor-pointer ${
                isActive("/hotels")
                  ? "text-primary text-body-bold border-b-2 border-primary pb-1"
                  : "text-on-surface-variant font-semibold hover:text-primary pb-1 border-b-2 border-transparent"
              }`}
            >
              Khách sạn
            </Link>
            {isAuthenticated && (
              <Link
                to="/bookings"
                className={`transition-colors cursor-pointer ${
                  isActive("/bookings")
                    ? "text-primary text-body-bold border-b-2 border-primary pb-1"
                    : "text-on-surface-variant font-semibold hover:text-primary pb-1 border-b-2 border-transparent"
                }`}
              >
                Đặt phòng
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <Menu shadow="md" position="bottom-end" radius="md">
                <Menu.Target>
                  <button className="flex items-center gap-2 hover:bg-surface-low px-2 py-1.5 rounded-lg transition-colors">
                    <Avatar
                      src={user.avatar}
                      alt={fullName}
                      radius="xl"
                      size="sm"
                      color="blue"
                    >
                      {user.firstName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-body-bold text-on-surface">
                        {user.firstName}
                      </span>
                      <span className="text-xs text-yellow-600 font-medium flex items-center gap-1">
                         <IconStar size={12} className="text-yellow-500 fill-yellow-500" />
                         {((user as any).rewardPoints) || 0} điểm
                      </span>
                      {walletBalance !== null && (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <IconWallet size={11} />
                          {formatVND(walletBalance)}
                        </span>
                      )}
                    </div>
                  </button>
                </Menu.Target>

                <Menu.Dropdown className="border-hairline shadow-lg">
                  <Menu.Item disabled>
                    <span className="text-label-caps text-on-surface-variant">
                      {user.email}
                    </span>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconUser size={16} className="text-outline" />}
                    onClick={() => handleNavigate("/profile")}
                    className="text-body text-on-surface hover:text-primary"
                  >
                    Hồ sơ của tôi
                  </Menu.Item>

                  <Menu.Item
                    leftSection={<IconWallet size={16} className="text-outline" />}
                    onClick={() => handleNavigate("/profile?tab=wallet")}
                    className="text-body text-on-surface hover:text-primary"
                    rightSection={
                      walletBalance !== null ? (
                        <span className="text-xs font-bold text-emerald-600">{formatVND(walletBalance)}</span>
                      ) : null
                    }
                  >
                    Ví UTravel
                  </Menu.Item>

                  {(user.role === USER_ROLES.ADMIN || user.role === USER_ROLES.MANAGER) && (
                    <Menu.Item
                      leftSection={
                        <IconDashboard size={16} className="text-outline" />
                      }
                      onClick={() => handleNavigate("/admin")}
                      className="text-body text-on-surface hover:text-primary"
                    >
                      Kênh quản trị
                    </Menu.Item>
                  )}

                  {user.role === USER_ROLES.VENDOR && (
                    <Menu.Item
                      leftSection={
                        <IconDashboard size={16} className="text-outline" />
                      }
                      onClick={() => handleNavigate("/vendor/dashboard")}
                      className="text-body text-on-surface hover:text-primary"
                    >
                      Kênh đối tác
                    </Menu.Item>
                  )}

                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconLogout size={16} />}
                    color="red"
                    onClick={handleLogout}
                    className="text-body"
                  >
                    Đăng xuất
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-body-bold text-primary hover:text-primary-hover hover:bg-surface-low rounded-lg transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="px-6 py-2 text-body-bold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors shadow-sm"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>

          {/* Mobile Burger */}
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="md"
            size="sm"
            color="#475467"
          />
        </div>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        padding="md"
        position="right"
        title={<span className="text-headline text-midnight">Menu</span>}
      >
        <div className="flex flex-col gap-4 mt-4">
          <Link
            to="/"
            className={`text-title p-2 rounded-md ${isActive("/") ? "bg-primary/10 text-primary" : "text-on-surface"}`}
            onClick={close}
          >
            Trang chủ
          </Link>
          <Link
            to="/hotels"
            className={`text-title p-2 rounded-md ${isActive("/hotels") ? "bg-primary/10 text-primary" : "text-on-surface"}`}
            onClick={close}
          >
            Khách sạn
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/bookings"
                className={`text-title p-2 rounded-md ${isActive("/bookings") ? "bg-primary/10 text-primary" : "text-on-surface"}`}
                onClick={close}
              >
                Đặt phòng
              </Link>
              <Divider my="sm" color="#eaecf0" />
              <Link
                to="/profile"
                className="text-title text-on-surface p-2"
                onClick={close}
              >
                Hồ sơ
              </Link>
              {(user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.MANAGER) && (
                <Link
                  to="/admin"
                  className="text-title text-on-surface p-2"
                  onClick={close}
                >
                  Kênh quản trị
                </Link>
              )}
              {user?.role === USER_ROLES.VENDOR && (
                <Link
                  to="/vendor/dashboard"
                  className="text-title text-on-surface p-2"
                  onClick={close}
                >
                  Kênh đối tác
                </Link>
              )}
              <button
                className="mt-4 w-full flex items-center justify-center gap-2 bg-error/10 text-error p-3 rounded-lg text-title hover:bg-error/20 transition-colors"
                onClick={handleLogout}
              >
                <IconLogout size={18} />
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Divider my="sm" color="#eaecf0" />
              <button
                className="w-full p-3 text-title text-on-surface bg-surface-low rounded-lg hover:bg-surface-high transition-colors"
                onClick={() => handleNavigate("/login")}
              >
                Đăng nhập
              </button>
              <button
                className="w-full p-3 text-title text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
                onClick={() => handleNavigate("/register")}
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </Drawer>
    </>
  );
};

import { useEffect, useState } from "react";
import { Loader } from "@mantine/core";
import { AppLayout } from "@/components/layout";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppStore";
import { fetchProfile } from "@/app/store/profileSlice";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { ProfileEditForm } from "../components/ProfileEditForm";
import { RegisterVendorForm } from "../components/RegisterVendorForm";

export const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.profile);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const getPageHeader = () => {
    switch (activeTab) {
      case "personal":
        return {
          title: "Thông tin cá nhân",
          desc: "Cập nhật thông tin chi tiết và cách chúng tôi có thể liên hệ với bạn.",
        };
      case "register-vendor":
        return {
          title: "Đăng ký / Quản lý đối tác",
          desc: "Đăng ký bán hàng hoặc quản lý thông tin cửa hàng, tài khoản ngân hàng liên kết.",
        };
      default:
        return {
          title: "Tài khoản",
          desc: "Quản lý thiết lập tài khoản và các tùy chọn cá nhân hóa.",
        };
    }
  };

  const headerInfo = getPageHeader();

  return (
    <AppLayout withContainer={false}>
      <div className="flex flex-1 w-full max-w-[1200px] mx-auto px-8 py-8 gap-8">
        {/* Cột trái: Sidebar điều hướng */}
        <ProfileSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Cột phải: Khung nội dung chính */}
        <main className="flex-1 max-w-[800px]">
          <div className="mb-8">
            <h1 className="text-display text-on-surface mb-2">{headerInfo.title}</h1>
            <p className="text-body text-on-surface-variant">
              {headerInfo.desc}
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader color="var(--color-primary)" size="lg" />
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-hairline p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              {activeTab === "personal" ? (
                <ProfileEditForm />
              ) : activeTab === "register-vendor" ? (
                <RegisterVendorForm />
              ) : (
                <div className="py-16 text-center text-on-surface-variant font-medium">
                  Tính năng đang được phát triển...
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );
};

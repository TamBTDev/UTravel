import { useState, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Alert, Loader, Badge, Select } from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconBuildingStore,
  IconCreditCard,
  IconFileText,
  IconWallet,
  IconUser,
  IconChevronRight,
} from "@tabler/icons-react";
import { modals } from '@mantine/modals';
import { useAppDispatch } from "@/hooks/useAppStore";
import { vendorService, VendorProfile } from "../services/vendorService";
import { fetchProfile } from "@/app/store/profileSlice";
import { updateUserRole } from "@/app/store/authSlice";

const registerVendorSchema = z.object({
  shopName: z.string().min(3, "Tên cửa hàng phải có ít nhất 3 ký tự"),
  description: z.string().optional(),
  businessLicense: z.string().optional(),
  bankName: z.string().min(2, "Vui lòng nhập tên ngân hàng"),
  bankOwner: z.string().min(2, "Vui lòng nhập tên chủ tài khoản"),
  bankAccount: z.string().regex(/^\d+$/, "Số tài khoản phải là các chữ số"),
});

type FormValues = z.infer<typeof registerVendorSchema>;

interface FormInputProps {
  label: string;
  field: any;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const getErrorMessage = (error: any): string => {
  if (!error) return "";
  
  if (typeof error === "string") return error;
  
  if (typeof error === "object") {
    if (error.response?.data) {
      return getErrorMessage(error.response.data);
    }
    if (error.error) {
      if (typeof error.error === "string") return error.error;
      if (error.error.message && typeof error.error.message === "string") {
        return error.error.message;
      }
    }
    if (error.message) {
      if (typeof error.message === "string") return error.message;
      if (Array.isArray(error.message)) {
        return error.message
          .map((m: any) => (typeof m === "object" ? getErrorMessage(m) : String(m)))
          .join(", ");
      }
      if (typeof error.message === "object") {
        return getErrorMessage(error.message);
      }
    }
    if (Array.isArray(error)) {
      return error.map((e: any) => getErrorMessage(e)).join(", ");
    }
    if (error.toString && error.toString() !== "[object Object]") {
      return error.toString();
    }
    return JSON.stringify(error);
  }
  
  return String(error);
};

const FormInput = ({
  label,
  field,
  placeholder,
  type = "text",
  icon,
  disabled = false,
}: FormInputProps) => {
  const rawError = field.state.meta.errors?.[0];
  const errorMsg = rawError ? getErrorMessage(rawError) : null;

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-outline group-focus-within:text-primary transition-colors">
            {icon}
          </span>
        )}
        <input
          name={field.name}
          value={field.state.value ?? ""}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          className={`w-full ${
            icon ? "pl-11" : "px-4"
          } pr-4 py-3 bg-surface-container-lowest border ${
            errorMsg
              ? "border-error focus:ring-error/20 focus:border-error"
              : "border-outline-variant focus:border-primary focus:ring-primary/20"
          } rounded-lg text-body text-on-surface placeholder:text-outline outline-none transition-all shadow-sm ${
            disabled
              ? "opacity-75 cursor-not-allowed bg-surface-variant/5 border-outline-variant"
              : ""
          }`}
        />
      </div>
      {errorMsg && <p className="text-xs text-error mt-1.5 ml-1 font-medium">{errorMsg}</p>}
    </div>
  );
};

export const RegisterVendorForm = () => {
  const dispatch = useAppDispatch();
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(
    null,
  );
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [bankList, setBankList] = useState<{value: string, label: string}[]>([]);

  useEffect(() => {
    fetch("https://api.vietqr.io/v2/banks")
      .then((res) => res.json())
      .then((data) => {
        if (data.code === "00") {
          setBankList(
            data.data.map((b: any) => ({
              value: b.shortName,
              label: `${b.shortName} - ${b.name}`,
            }))
          );
        }
      })
      .catch((err) => console.error("Error fetching banks:", err));
  }, []);

  const fetchVendorDetails = async () => {
    setLoadingProfile(true);
    setApiError(null);
    try {
      const res = await vendorService.getVendorProfile();
      if (res.success) {
        setVendorProfile(res.data);
      }
    } catch (err: any) {
      console.log("No vendor profile found or error fetching profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  const handleResetProfile = () => {
    modals.openConfirmModal({
      title: 'Xác nhận đặt lại',
      children: 'Bạn có chắc chắn muốn đặt lại hồ sơ? Thao tác này sẽ xóa hồ sơ hiện tại để bạn nộp lại từ đầu.',
      labels: { confirm: 'Đặt lại', cancel: 'Hủy' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setSubmitting(true);
        setApiError(null);
        try {
          const res = await vendorService.resetVendorProfile();
          if (res.success) {
            setVendorProfile(null);
            dispatch(updateUserRole("USER"));
            dispatch(fetchProfile());
            form.reset();
          }
        } catch (err: any) {
          setApiError(getErrorMessage(err) || "Đặt lại hồ sơ thất bại");
        } finally {
          setSubmitting(false);
        }
      }
    });
  };

  const form = useForm({
    defaultValues: {
      shopName: "",
      description: "",
      businessLicense: "",
      bankName: "",
      bankOwner: "",
      bankAccount: "",
    } as FormValues,
    validators: {
      onChange: registerVendorSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitting(true);
      setApiError(null);
      setSuccessMsg(null);
      try {
        const res = await vendorService.registerVendor(value);
        if (res.success) {
          setSuccessMsg(res.message);
          setVendorProfile(res.data);
          dispatch(updateUserRole("VENDOR"));
          dispatch(fetchProfile());
        }
      } catch (err: any) {
        setApiError(getErrorMessage(err) || "Đăng ký đối tác thất bại");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Sync profile details if already exists
  useEffect(() => {
    if (vendorProfile) {
      form.reset({
        shopName: vendorProfile.shopName ?? "",
        description: vendorProfile.description ?? "",
        businessLicense: vendorProfile.businessLicense ?? "",
        bankName: vendorProfile.bankName ?? "",
        bankOwner: vendorProfile.bankOwner ?? "",
        bankAccount: vendorProfile.bankAccount ?? "",
      });
    }
  }, [vendorProfile]);

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Loader color="var(--color-primary)" size="md" />
        <p className="text-body text-on-surface-variant font-medium">
          Đang tải dữ liệu đối tác...
        </p>
      </div>
    );
  }

  const isFormDisabled = !!vendorProfile || submitting;

  return (
    <div className="flex flex-col gap-8">
      {/* Top Header & Status Cards */}
      <div>
        <h2 className="text-title text-on-surface mb-1.5 flex items-center gap-2">
          <IconBuildingStore size={22} className="text-primary" />
          {vendorProfile
            ? `Cửa hàng đối tác: ${vendorProfile.shopName}`
            : "Đăng ký trở thành đối tác kinh doanh"}
        </h2>
        <p className="text-body text-on-surface-variant">
          {vendorProfile
            ? "Thông tin hồ sơ và trạng thái hợp tác của bạn trên hệ thống UTravel."
            : "Hợp tác với UTravel để đưa các khách sạn, dịch vụ lưu trú của bạn đến hàng ngàn khách hàng tiềm năng."}
        </p>

        {vendorProfile && (
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">
              Trạng thái:
            </span>
            {vendorProfile.status === "PENDING" && (
              <Badge color="yellow" variant="light" size="md">
                Đang chờ phê duyệt
              </Badge>
            )}
            {vendorProfile.status === "APPROVED" && (
              <Badge color="green" variant="light" size="md">
                Đã hoạt động
              </Badge>
            )}
            {vendorProfile.status === "REJECTED" && (
              <Badge color="red" variant="light" size="md">
                Từ chối phê duyệt
              </Badge>
            )}
          </div>
        )}
      </div>

      {vendorProfile && vendorProfile.status === "PENDING" && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="yellow"
          variant="light"
          className="rounded-lg"
        >
          Hồ sơ đăng ký đối tác của bạn đang được Quản trị viên kiểm duyệt. Quá
          trình này thường diễn ra trong vòng 24 giờ làm việc.
        </Alert>
      )}

      {vendorProfile && vendorProfile.status === "REJECTED" && (
        <div className="flex flex-col gap-4 bg-red-50/50 p-6 rounded-xl border border-red-200 shadow-sm">
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            className="rounded-lg font-medium"
          >
            Hồ sơ đăng ký đối tác của bạn đã bị từ chối bởi Quản trị viên. Lý do
            có thể do thông tin giấy phép, ngân hàng hoặc mô tả chưa chính xác.
            Bạn có thể nhấn nút đặt lại bên dưới để gửi lại hồ sơ đăng ký mới.
          </Alert>
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleResetProfile}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors duration-200"
            >
              Đặt lại và Đăng ký lại
            </button>
          </div>
        </div>
      )}

      {vendorProfile && vendorProfile.status === "APPROVED" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary/5 rounded-xl p-5 border border-primary/10 flex flex-col gap-1.5 relative overflow-hidden">
            <IconWallet className="absolute right-4 bottom-4 text-primary/10 w-16 h-16 pointer-events-none" />
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Số dư ví
            </span>
            <span className="text-headline text-primary font-bold">
              {new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(vendorProfile.wallet?.balance || 0)}
            </span>
          </div>
          <div className="bg-secondary/5 rounded-xl p-5 border border-secondary/10 flex flex-col gap-1.5 relative overflow-hidden">
            <IconFileText className="absolute right-4 bottom-4 text-secondary/10 w-16 h-16 pointer-events-none" />
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Chiết khấu hệ thống
            </span>
            <span className="text-headline text-secondary font-bold">
              {vendorProfile.commissionRate}%
            </span>
          </div>
          <div className="bg-neutral-light rounded-xl p-5 border border-hairline flex flex-col gap-1.5 justify-center">
            <a
              href="/vendor/dashboard"
              className="flex items-center justify-between text-body-bold text-primary hover:underline font-semibold"
            >
              Quản lý Khách sạn
              <IconChevronRight size={18} />
            </a>
          </div>
        </div>
      )}

      {apiError && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          variant="light"
          className="rounded-lg"
        >
          {apiError}
        </Alert>
      )}

      {successMsg && (
        <Alert
          icon={<IconCheck size={16} />}
          color="green"
          variant="light"
          className="rounded-lg"
        >
          {successMsg}
        </Alert>
      )}

      <div className="relative">
        {isFormDisabled && (
          <div className="absolute inset-0 z-10 bg-surface/40 backdrop-blur-[1px] rounded-xl flex items-center justify-center">
            {submitting && <Loader color="var(--color-primary)" />}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className={`flex flex-col gap-6 ${isFormDisabled ? 'pointer-events-none' : ''}`}
        >
        {/* Section 1: Shop Profile */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-hairline flex flex-col gap-5">
          <h3 className="text-body-bold font-bold text-primary border-b border-hairline pb-2 mb-1 flex items-center gap-2">
            <IconBuildingStore size={18} />
            Thông tin gian hàng
          </h3>

          <form.Field name="shopName">
            {(field) => (
              <FormInput
                label="Tên gian hàng / Khách sạn đại diện"
                placeholder="Ví dụ: UTravel Luxury Hotel"
                field={field}
                disabled={isFormDisabled}
                icon={<IconBuildingStore size={20} />}
              />
            )}
          </form.Field>

          <form.Field name="businessLicense">
            {(field) => (
              <FormInput
                label="Mã số doanh nghiệp / Giấy phép kinh doanh (Không bắt buộc)"
                placeholder="Ví dụ: 0102030405"
                field={field}
                disabled={isFormDisabled}
                icon={<IconFileText size={20} />}
              />
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
                  Mô tả hoạt động kinh doanh
                </label>
                <textarea
                  name={field.name}
                  value={field.state.value ?? ""}
                  placeholder="Giới thiệu sơ lược về dịch vụ, vị trí, tiện ích nổi bật của chuỗi khách sạn của bạn..."
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isFormDisabled}
                  rows={4}
                  className={`w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-primary/20 rounded-lg text-body text-on-surface placeholder:text-outline outline-none transition-all shadow-sm resize-y ${
                    isFormDisabled
                      ? "opacity-75 cursor-not-allowed bg-surface-variant/5 border-outline-variant"
                      : ""
                  }`}
                />
              </div>
            )}
          </form.Field>
        </div>

        {/* Section 2: Banking Info */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-hairline flex flex-col gap-5">
          <h3 className="text-body-bold font-bold text-primary border-b border-hairline pb-2 mb-1 flex items-center gap-2">
            <IconCreditCard size={18} />
            Tài khoản nhận tiền (Đối soát doanh thu)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <form.Field name="bankName">
              {(field) => {
                const rawError = field.state.meta.errors?.[0];
                const errorMsg = rawError ? getErrorMessage(rawError) : null;
                return (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 ml-1">
                      Tên Ngân hàng
                    </label>
                    <Select
                      placeholder="Chọn ngân hàng"
                      data={bankList}
                      searchable
                      value={field.state.value}
                      onChange={(val) => field.handleChange(val || "")}
                      disabled={isFormDisabled}
                      error={errorMsg}
                      classNames={{
                        input: `w-full px-4 py-[22px] bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-primary/20 rounded-lg text-body text-on-surface placeholder:text-outline outline-none transition-all shadow-sm`,
                      }}
                    />
                  </div>
                );
              }}
            </form.Field>

            <form.Field name="bankOwner">
              {(field) => (
                <FormInput
                  label="Tên Chủ tài khoản (Không dấu)"
                  placeholder="Ví dụ: NGUYEN VAN A"
                  field={field}
                  disabled={isFormDisabled}
                  icon={<IconUser size={20} />}
                />
              )}
            </form.Field>

            <div className="md:col-span-2">
              <form.Field name="bankAccount">
                {(field) => (
                  <FormInput
                    label="Số Tài khoản"
                    placeholder="Nhập số tài khoản ngân hàng"
                    field={field}
                    disabled={isFormDisabled}
                    icon={<IconCreditCard size={20} />}
                  />
                )}
              </form.Field>
            </div>
          </div>
        </div>

        {/* Submit Button (only show if registration hasn't happened yet) */}
        {!isFormDisabled && (
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto bg-primary hover:bg-primary-hover text-white font-bold rounded-lg py-3.5 px-8 transition-colors shadow-sm flex items-center justify-center gap-2 min-w-[200px]"
            >
              {submitting ? (
                <Loader color="white" size="xs" />
              ) : (
                <>
                  <span>Gửi hồ sơ đăng ký</span>
                  <IconCheck size={18} />
                </>
              )}
            </button>
          </div>
        )}
        </form>
      </div>
    </div>
  );
};

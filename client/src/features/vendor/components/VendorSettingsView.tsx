import { useState, useEffect } from "react";
import { TextInput, Textarea, Loader, Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBuilding, IconBuildingBank, IconCheck } from "@tabler/icons-react";
import { vendorService } from "../../user/services/vendorService";

export const VendorSettingsView = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    description: "",
    bankName: "",
    bankOwner: "",
    bankAccount: "",
  });
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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await vendorService.getVendorProfile();
        if (res.data) {
          setProfile(res.data);
          setForm({
            description: res.data.description || "",
            bankName: res.data.bankName || "",
            bankOwner: res.data.bankOwner || "",
            bankAccount: res.data.bankAccount || "",
          });
        }
      } catch (e: any) {
        notifications.show({ title: "Lỗi", message: e.message, color: "red" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await vendorService.updateVendorProfile(form);
      notifications.show({ title: "Đã lưu!", message: "Thông tin hồ sơ đã được cập nhật.", color: "green" });
    } catch (e: any) {
      notifications.show({ title: "Lỗi", message: e.message || "Có lỗi xảy ra", color: "red" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 48, display: "flex", justifyContent: "center" }}>
      <Loader size="sm" />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 640 }}>
      {/* Shop Info */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
          <IconBuilding size={18} color="#0b63d6" /> Thông tin thương hiệu
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6b7280" }}>Thông tin hiển thị trên sàn UTravel</p>

        {profile && (
          <div style={{ background: "#f9fafb", borderRadius: 9, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
            <span style={{ color: "#6b7280" }}>Tên thương hiệu: </span>
            <span style={{ fontWeight: 700, color: "#111827" }}>{profile.shopName}</span>
            <span style={{ marginLeft: 12 }}>·</span>
            <span style={{ color: "#6b7280", marginLeft: 8 }}>Trạng thái: </span>
            <span style={{ fontWeight: 600, color: profile.status === "APPROVED" ? "#065f46" : "#d97706" }}>
              {profile.status === "APPROVED" ? "✓ Đã phê duyệt" : profile.status}
            </span>
            <span style={{ marginLeft: 12 }}>·</span>
            <span style={{ color: "#6b7280", marginLeft: 8 }}>Hoa hồng: </span>
            <span style={{ fontWeight: 600 }}>{profile.commissionRate}%</span>
          </div>
        )}

        <Textarea
          label="Giới thiệu thương hiệu"
          placeholder="Mô tả ngắn về dịch vụ của bạn..."
          value={form.description}
          onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          rows={4}
        />
      </div>

      {/* Bank Info */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }}>
          <IconBuildingBank size={18} color="#0b63d6" /> Thông tin ngân hàng
        </h3>
        <p style={{ margin: "0 0 20px", fontSize: 13, color: "#6b7280" }}>Dùng để nhận tiền khi tạo yêu cầu rút tiền từ ví</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Select 
            label="Tên ngân hàng" 
            placeholder="Chọn ngân hàng" 
            data={bankList}
            searchable
            value={form.bankName} 
            onChange={val => setForm(p => ({ ...p, bankName: val || "" }))} 
          />
          <TextInput label="Số tài khoản" placeholder="Nhập số tài khoản..." value={form.bankAccount} onChange={e => setForm(p => ({ ...p, bankAccount: e.target.value }))} />
          <TextInput label="Tên chủ tài khoản" placeholder="NGUYEN VAN A" value={form.bankOwner} onChange={e => setForm(p => ({ ...p, bankOwner: e.target.value }))} />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{ alignSelf: "flex-start", background: saving ? "#9ca3af" : "#0b63d6", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}
      >
        {saving ? <Loader size={16} color="white" /> : <IconCheck size={16} />}
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
};

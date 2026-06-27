import { useState, useEffect } from "react";
import { Modal, Loader, TextInput, Textarea, MultiSelect, NumberInput, Select, Switch, FileInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBuilding, IconPlus, IconEdit, IconTrash, IconBed,
  IconChevronDown, IconChevronRight,
  IconCheck,
} from "@tabler/icons-react";
import { vendorService } from "../../user/services/vendorService";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { DatePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { IconCalendarEvent } from "@tabler/icons-react";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  DRAFT:    { label: "Bản nháp",    bg: "#f3f4f6", color: "#6b7280" },
  PENDING:  { label: "Chờ duyệt",   bg: "#fef3c7", color: "#d97706" },
  APPROVED: { label: "Đã duyệt",    bg: "#d1fae5", color: "#065f46" },
  REJECTED: { label: "Bị từ chối",  bg: "#fee2e2", color: "#991b1b" },
};

const AMENITY_OPTIONS = ["WiFi","Hồ bơi","Gym","Spa","Nhà hàng","Bar","Điều hòa","TV","Minibar","Bãi đậu xe","Sân vườn","View biển","View núi"];
const ROOM_AMENITY_OPTIONS = ["Điều hòa","TV","WiFi","Minibar","Bếp nhỏ","Ban công","Bồn tắm","Két sắt","Tủ lạnh","Máy pha cà phê"];
const ROOM_TYPES = ["single","double","twin","triple","suite","deluxe","family","studio"];

// ── Hotel Form Modal ──────────────────────────────────────
const HotelFormModal = ({ opened, onClose, hotel, onSave }: any) => {
  const [form, setForm] = useState({
    name: "", description: "", location: "", city: "", country: "Vietnam", amenities: [] as string[], imageLink: "",
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    setImageFile(null);
    if (hotel) {
      setForm({
        name: hotel.name || "",
        description: hotel.description || "",
        location: hotel.location || "",
        city: hotel.city || "",
        country: hotel.country || "Vietnam",
        amenities: (() => { try { return JSON.parse(hotel.amenities || "[]"); } catch { return []; } })(),
        imageLink: (() => { try { const imgs = JSON.parse(hotel.images || "[]"); return Array.isArray(imgs) ? imgs[0] || "" : ""; } catch { return ""; } })(),
      });
    } else {
      setForm({ name: "", description: "", location: "", city: "", country: "Vietnam", amenities: [], imageLink: "" });
    }
  }, [hotel, opened]);

  const handleSave = async () => {
    if (!form.name || !form.location || !form.city) {
      notifications.show({ title: "Thiếu thông tin", message: "Vui lòng điền tên, địa điểm và thành phố", color: "red" });
      return;
    }
    setSaving(true);
    try {
      let finalImageUrl = form.imageLink;
      if (imageFile) {
        finalImageUrl = await uploadImageToCloudinary(imageFile);
      }
      
      const payload = { ...form, images: finalImageUrl ? [finalImageUrl] : [] };
      if (hotel) {
        await vendorService.updateVendorHotel(hotel.id, payload);
        notifications.show({ title: "Đã cập nhật!", message: "Thông tin khách sạn đã được lưu.", color: "green" });
      } else {
        await vendorService.createVendorHotel(payload);
        notifications.show({ title: "Đã tạo!", message: "Khách sạn mới đang chờ Admin phê duyệt.", color: "teal" });
      }
      onSave();
      onClose();
    } catch (e: any) {
      notifications.show({ title: "Lỗi", message: e.message || "Có lỗi xảy ra", color: "red" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<span style={{ fontWeight: 700, fontSize: 16 }}>{hotel ? "Sửa thông tin khách sạn" : "Thêm chỗ nghỉ mới"}</span>} size="lg" radius="lg">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <TextInput label="Tên chỗ nghỉ *" placeholder="VD: Khách sạn Grand Hà Nội" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput label="Thành phố *" placeholder="VD: Hà Nội" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
          <TextInput label="Quốc gia" placeholder="Vietnam" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
        </div>
        <TextInput label="Địa chỉ cụ thể *" placeholder="VD: 123 Phố Huế, Quận Hai Bà Trưng" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
        
        <FileInput 
          label="Ảnh khách sạn" 
          placeholder={form.imageLink ? "Đã có ảnh. Bấm để chọn ảnh mới..." : "Chọn ảnh để tải lên..."}
          accept="image/png,image/jpeg,image/webp" 
          value={imageFile} 
          onChange={setImageFile} 
          clearable 
        />
        {form.imageLink && !imageFile && (
          <div style={{ marginTop: -8, fontSize: 12, color: "#6b7280" }}>
            Ảnh hiện tại: <a href={form.imageLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">Xem ảnh</a>
          </div>
        )}

        <Textarea label="Mô tả" placeholder="Mô tả ngắn về chỗ nghỉ..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
        <MultiSelect label="Tiện ích" data={AMENITY_OPTIONS} value={form.amenities} onChange={v => setForm(p => ({ ...p, amenities: v }))} placeholder="Chọn tiện ích..." searchable />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Hủy</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: saving ? "#9ca3af" : "#0b63d6", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            {saving ? <Loader size={14} color="white" /> : <IconCheck size={14} />}
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Room Form Modal ──────────────────────────────────────
const RoomFormModal = ({ opened, onClose, hotelId, room, onSave }: any) => {
  const [form, setForm] = useState({ roomNumber: "", type: "double", price: 0, capacity: 2, description: "", amenities: [] as string[] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (room) {
      setForm({
        roomNumber: room.roomNumber || "",
        type: room.type || "double",
        price: room.price || 0,
        capacity: room.capacity || 2,
        description: room.description || "",
        amenities: (() => { try { return JSON.parse(room.amenities || "[]"); } catch { return []; } })(),
      });
    } else {
      setForm({ roomNumber: "", type: "double", price: 0, capacity: 2, description: "", amenities: [] });
    }
  }, [room, opened]);

  const handleSave = async () => {
    if (!form.roomNumber || !form.type || !form.price) {
      notifications.show({ title: "Thiếu thông tin", message: "Vui lòng điền số phòng, loại phòng và giá", color: "red" });
      return;
    }
    setSaving(true);
    try {
      if (room) {
        await vendorService.updateVendorRoom(hotelId, room.id, form);
        notifications.show({ title: "Đã cập nhật!", message: "Thông tin phòng đã được lưu.", color: "green" });
      } else {
        await vendorService.createVendorRoom(hotelId, form);
        notifications.show({ title: "Đã thêm!", message: "Phòng mới đã được thêm thành công.", color: "teal" });
      }
      onSave();
      onClose();
    } catch (e: any) {
      notifications.show({ title: "Lỗi", message: e.message || "Có lỗi xảy ra", color: "red" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<span style={{ fontWeight: 700, fontSize: 16 }}>{room ? "Sửa thông tin phòng" : "Thêm phòng mới"}</span>} size="md" radius="lg">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <TextInput label="Số phòng *" placeholder="VD: 101" value={form.roomNumber} onChange={e => setForm(p => ({ ...p, roomNumber: e.target.value }))} />
          <Select label="Loại phòng *" data={ROOM_TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))} value={form.type} onChange={v => setForm(p => ({ ...p, type: v || "double" }))} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <NumberInput label="Giá/đêm (VNĐ) *" placeholder="500000" value={form.price} onChange={v => setForm(p => ({ ...p, price: Number(v) }))} min={0} thousandSeparator="," />
          <NumberInput label="Sức chứa (người)" value={form.capacity} onChange={v => setForm(p => ({ ...p, capacity: Number(v) }))} min={1} max={20} />
        </div>
        <Textarea label="Mô tả phòng" placeholder="Mô tả ngắn về phòng..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} />
        <MultiSelect label="Tiện ích phòng" data={ROOM_AMENITY_OPTIONS} value={form.amenities} onChange={v => setForm(p => ({ ...p, amenities: v }))} placeholder="Chọn tiện ích..." searchable />
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Hủy</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: saving ? "#9ca3af" : "#0b63d6", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            {saving ? <Loader size={14} color="white" /> : <IconCheck size={14} />}
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ── Room Calendar Modal ──────────────────────────────────
const RoomCalendarModal = ({ opened, onClose, room }: any) => {
  if (!room) return null;

  const isBooked = (date: any) => {
    if (!room.bookings || room.bookings.length === 0) return false;
    const current = dayjs(date).startOf("day").valueOf();
    return room.bookings.some((b: any) => {
      const start = dayjs(b.checkInDate).startOf("day").valueOf();
      const end = dayjs(b.checkOutDate).startOf("day").valueOf();
      return current >= start && current < end;
    });
  };

  return (
    <Modal opened={opened} onClose={onClose} title={<span style={{ fontWeight: 700, fontSize: 16 }}>Lịch phòng {room.roomNumber}</span>} centered>
      <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
        <DatePicker
          renderDay={(date: any) => {
            const booked = isBooked(date);
            return (
              <div
                style={{
                  width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: booked ? "#fee2e2" : "transparent",
                  color: booked ? "#dc2626" : "inherit",
                  borderRadius: 4, fontWeight: booked ? 600 : 400
                }}
                title={booked ? "Đã được đặt" : "Còn trống"}
              >
                {dayjs(date).date()}
              </div>
            );
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280" }}>
          <div style={{ width: 14, height: 14, background: "#fee2e2", borderRadius: 3 }}></div> Đã đặt
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280" }}>
          <div style={{ width: 14, height: 14, border: "1px solid #e5e7eb", borderRadius: 3 }}></div> Còn trống
        </div>
      </div>
    </Modal>
  );
};

// ── Main View ──────────────────────────────────────────────
export const VendorListingsView = () => {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedHotel, setExpandedHotel] = useState<number | null>(null);
  const [rooms, setRooms] = useState<Record<number, any[]>>({});
  const [loadingRooms, setLoadingRooms] = useState<Record<number, boolean>>({});

  const [hotelModal, setHotelModal] = useState(false);
  const [editHotel, setEditHotel] = useState<any>(null);
  const [roomModal, setRoomModal] = useState<{ opened: boolean; hotelId: number | null; room: any }>({ opened: false, hotelId: null, room: null });
  const [calendarModal, setCalendarModal] = useState<{ opened: boolean; room: any }>({ opened: false, room: null });
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const data = await vendorService.getVendorHotels();
      setHotels(data || []);
    } catch (e: any) {
      notifications.show({ title: "Lỗi", message: e.message || "Không thể tải danh sách chỗ nghỉ", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHotels(); }, []);

  const loadRooms = async (hotelId: number, force = false) => {
    if (!force && rooms[hotelId]) return;
    setLoadingRooms(p => ({ ...p, [hotelId]: true }));
    try {
      const data = await vendorService.getVendorRooms(hotelId);
      setRooms(p => ({ ...p, [hotelId]: data || [] }));
    } catch { } finally {
      setLoadingRooms(p => ({ ...p, [hotelId]: false }));
    }
  };

  const toggleExpand = (hotelId: number) => {
    if (expandedHotel === hotelId) { setExpandedHotel(null); }
    else { setExpandedHotel(hotelId); loadRooms(hotelId); }
  };

  const handleDeleteHotel = async (hotel: any) => {
    if (!confirm(`Xóa khách sạn "${hotel.name}"? Hành động này không thể hoàn tác.`)) return;
    setDeleting(hotel.id);
    try {
      await vendorService.deleteVendorHotel(hotel.id);
      notifications.show({ title: "Đã xóa!", message: "Khách sạn đã được xóa thành công.", color: "green" });
      loadHotels();
    } catch (e: any) {
      notifications.show({ title: "Không thể xóa", message: e.message || "Có lỗi xảy ra", color: "red" });
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteRoom = async (hotelId: number, room: any) => {
    if (!confirm(`Xóa phòng "${room.roomNumber}"?`)) return;
    try {
      await vendorService.deleteVendorRoom(hotelId, room.id);
      notifications.show({ title: "Đã xóa!", message: "Phòng đã được xóa.", color: "green" });
      setRooms(p => ({ ...p, [hotelId]: (p[hotelId] || []).filter(r => r.id !== room.id) }));
    } catch (e: any) {
      notifications.show({ title: "Không thể xóa", message: e.message || "Có lỗi xảy ra", color: "red" });
    }
  };

  const handleToggleActive = async (hotel: any) => {
    try {
      await vendorService.updateVendorHotel(hotel.id, { isActive: !hotel.isActive });
      setHotels(p => p.map(h => h.id === hotel.id ? { ...h, isActive: !h.isActive } : h));
    } catch (e: any) {
      notifications.show({ title: "Lỗi", message: e.message, color: "red" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Danh sách chỗ nghỉ</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{hotels.length} chỗ nghỉ đang quản lý</p>
        </div>
        <button
          onClick={() => { setEditHotel(null); setHotelModal(true); }}
          style={{ background: "#0b63d6", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}
        >
          <IconPlus size={16} /> Thêm chỗ nghỉ
        </button>
      </div>

      {loading ? (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 48, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <Loader size="sm" />
          <span style={{ color: "#6b7280", fontSize: 13 }}>Đang tải danh sách...</span>
        </div>
      ) : hotels.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 14, border: "2px dashed #e5e7eb", padding: 64, textAlign: "center" }}>
          <IconBuilding size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
          <h3 style={{ color: "#374151", margin: "0 0 8px", fontWeight: 700 }}>Chưa có chỗ nghỉ nào</h3>
          <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 20 }}>Bắt đầu bằng cách thêm chỗ nghỉ đầu tiên của bạn</p>
          <button onClick={() => { setEditHotel(null); setHotelModal(true); }} style={{ background: "#0b63d6", color: "#fff", border: "none", borderRadius: 9, padding: "10px 24px", cursor: "pointer", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, margin: "0 auto" }}>
            <IconPlus size={16} /> Thêm chỗ nghỉ đầu tiên
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {hotels.map(hotel => {
            const st = STATUS_MAP[hotel.approvalStatus] || STATUS_MAP.DRAFT;
            const isExpanded = expandedHotel === hotel.id;
            return (
              <div key={hotel.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                {/* Hotel row */}
                <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                  {/* Expand toggle */}
                  <button onClick={() => toggleExpand(hotel.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 4, borderRadius: 6, display: "flex" }}>
                    {isExpanded ? <IconChevronDown size={18} /> : <IconChevronRight size={18} />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{hotel.name}</span>
                      <span style={{ background: st.bg, color: st.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>{st.label}</span>
                      {!hotel.isActive && <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>Đã ẩn</span>}
                    </div>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280" }}>
                      📍 {hotel.city} · {hotel._count?.rooms || 0} phòng · {hotel._count?.reviews || 0} đánh giá
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Switch size="sm" checked={hotel.isActive} onChange={() => handleToggleActive(hotel)} label={hotel.isActive ? "Hiển thị" : "Ẩn"} styles={{ label: { fontSize: 12, color: "#6b7280" } }} />
                    <button onClick={() => { setEditHotel(hotel); setHotelModal(true); }} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 7, padding: "6px 12px", cursor: "pointer", color: "#1d4ed8", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <IconEdit size={13} /> Sửa
                    </button>
                    {hotel.approvalStatus !== "APPROVED" && (
                      <button onClick={() => handleDeleteHotel(hotel)} disabled={deleting === hotel.id} style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 7, padding: "6px 12px", cursor: "pointer", color: "#dc2626", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                        <IconTrash size={13} /> Xóa
                      </button>
                    )}
                  </div>
                </div>

                {/* Rooms panel */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #f3f4f6", background: "#f9fafb", padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Danh sách phòng</span>
                      <button onClick={() => setRoomModal({ opened: true, hotelId: hotel.id, room: null })} style={{ background: "#0b63d6", color: "#fff", border: "none", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                        <IconPlus size={13} /> Thêm phòng
                      </button>
                    </div>

                    {loadingRooms[hotel.id] ? (
                      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}><Loader size="xs" /></div>
                    ) : (rooms[hotel.id] || []).length === 0 ? (
                      <div style={{ textAlign: "center", padding: "20px 0", color: "#9ca3af", fontSize: 13 }}>
                        <IconBed size={28} color="#d1d5db" style={{ marginBottom: 6 }} />
                        <p style={{ margin: 0 }}>Chưa có phòng nào. Nhấn "Thêm phòng" để bắt đầu.</p>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 10 }}>
                        {(rooms[hotel.id] || []).map(room => (
                          <div key={room.id} style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: "12px 14px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                              <div>
                                <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>Phòng {room.roomNumber}</span>
                                <span style={{ marginLeft: 6, background: "#eff6ff", color: "#1d4ed8", fontSize: 11, padding: "1px 7px", borderRadius: 20, fontWeight: 600 }}>{room.type}</span>
                              </div>
                              <div style={{ display: "flex", gap: 4 }}>
                                <button onClick={() => setRoomModal({ opened: true, hotelId: hotel.id, room })} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 7px", cursor: "pointer", color: "#374151" }}><IconEdit size={12} /></button>
                                <button onClick={() => handleDeleteRoom(hotel.id, room)} style={{ background: "none", border: "1px solid #fca5a5", borderRadius: 6, padding: "3px 7px", cursor: "pointer", color: "#dc2626" }}><IconTrash size={12} /></button>
                              </div>
                            </div>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#0b63d6" }}>{formatVND(room.price)}<span style={{ fontWeight: 400, fontSize: 12, color: "#9ca3af" }}>/đêm</span></p>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                              <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>👥 {room.capacity} người</p>
                              <button 
                                onClick={() => setCalendarModal({ opened: true, room })}
                                style={{ background: "#f3f4f6", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 4 }}
                              >
                                <IconCalendarEvent size={14} /> Xem lịch
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <HotelFormModal
        opened={hotelModal}
        onClose={() => setHotelModal(false)}
        hotel={editHotel}
        onSave={() => { loadHotels(); setRooms({}); }}
      />
      <RoomFormModal
        opened={roomModal.opened}
        onClose={() => setRoomModal({ opened: false, hotelId: null, room: null })}
        hotelId={roomModal.hotelId}
        room={roomModal.room}
        onSave={() => {
          if (roomModal.hotelId) {
            loadRooms(roomModal.hotelId, true);
          }
        }}
      />
      <RoomCalendarModal
        opened={calendarModal.opened}
        onClose={() => setCalendarModal({ opened: false, room: null })}
        room={calendarModal.room}
      />
    </div>
  );
};

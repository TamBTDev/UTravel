import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { notifications } from '@mantine/notifications';
import { getBookingDetail } from "@/features/booking/services/bookingService";
import { reviewService } from "../services/reviewService";
import { IconStar, IconUpload, IconX, IconCalendarEvent, IconBed, IconCircleCheck, IconPhoto } from "@tabler/icons-react";
import { uploadImagesToCloudinary } from "@/lib/cloudinary";
import { AppLayout } from "@/components/layout";
import dayjs from "dayjs";

const HIGH_LIGHT_OPTIONS = [
  { label: "Nhân viên thân thiện", value: "Friendly Staff" },
  { label: "Tầm nhìn đẹp", value: "Great View" },
  { label: "Yên tĩnh", value: "Quiet" },
  { label: "Phòng rộng rãi", value: "Spacious Room" },
  { label: "WiFi nhanh", value: "Fast WiFi" },
  { label: "Hồ bơi tuyệt vời", value: "Excellent Pool" },
  { label: "Sạch sẽ", value: "Clean" },
  { label: "Bữa sáng ngon", value: "Good Breakfast" },
];

const SUB_RATING_LABELS: Record<string, string> = {
  cleanlinessRating: "Vệ sinh",
  serviceRating: "Dịch vụ",
  locationRating: "Vị trí",
  valueRating: "Giá trị",
};

const RATING_LABELS = ["", "Tệ", "Không tốt", "Bình thường", "Tốt", "Xuất sắc"];

const parseImg = (val: any): string => {
  if (!val) return '';
  if (Array.isArray(val)) return val[0] || '';
  if (typeof val === 'string') { try { const p = JSON.parse(val); return Array.isArray(p) ? p[0] : ''; } catch { return val; } }
  return '';
};

export default function CreateReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [subRatings, setSubRatings] = useState({
    cleanlinessRating: 0,
    serviceRating: 0,
    locationRating: 0,
    valueRating: 0,
  });
  const [subHover, setSubHover] = useState<Record<string, number>>({});
  const [comment, setComment] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingDetail(id!);
        setBooking(data);
      } catch {
        notifications.show({ title: 'Lỗi', message: "Không thể tải thông tin đặt phòng", color: 'red' });
        navigate("/bookings");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id, navigate]);

  const toggleHighlight = (val: string) => {
    setHighlights(prev =>
      prev.includes(val) ? prev.filter(h => h !== val) : [...prev, val]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      // Validate file size (max 5MB each)
      const valid = files.filter(f => {
        if (f.size > 5 * 1024 * 1024) {
          notifications.show({ title: 'Ảnh quá lớn', message: `"${f.name}" vượt quá 5MB`, color: 'orange' });
          return false;
        }
        return true;
      });
      const previews = valid.map(f => URL.createObjectURL(f));
      setImageFiles(prev => [...prev, ...valid]);
      setImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      notifications.show({ title: 'Lỗi', message: "Vui lòng chọn điểm đánh giá tổng thể", color: 'red' });
      return;
    }
    setSubmitting(true);
    try {
      // Upload ảnh lên Cloudinary
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setUploading(true);
        try {
          imageUrls = await uploadImagesToCloudinary(imageFiles);
        } catch (uploadErr: any) {
          notifications.show({ title: 'Lỗi tải ảnh', message: uploadErr.message || 'Không thể tải ảnh lên', color: 'red' });
          setSubmitting(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }
      const hotelId = booking.room?.hotel?.id ?? booking.hotelId;
      if (!hotelId) {
        notifications.show({ title: 'Lỗi', message: 'Không tìm thấy thông tin khách sạn', color: 'red' });
        return;
      }

      await reviewService.createReview({
        bookingId: parseInt(id!),
        hotelId,
        rating,
        comment: comment.trim() || undefined,
        cleanlinessRating: subRatings.cleanlinessRating > 0 ? subRatings.cleanlinessRating : undefined,
        serviceRating: subRatings.serviceRating > 0 ? subRatings.serviceRating : undefined,
        locationRating: subRatings.locationRating > 0 ? subRatings.locationRating : undefined,
        valueRating: subRatings.valueRating > 0 ? subRatings.valueRating : undefined,
        highlights: highlights.length > 0 ? highlights : undefined,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
      notifications.show({ title: 'Thành công', message: "Đánh giá của bạn đã được gửi thành công!", color: 'green' });
      navigate("/bookings");
    } catch (error: any) {
      notifications.show({ title: 'Lỗi', message: error.response?.data?.error || "Không thể gửi đánh giá", color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#0b63d6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ color: '#6b7280' }}>Đang tải...</p>
          </div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </AppLayout>
    );
  }
  if (!booking) return null;

  const hotelImg = parseImg(booking.room?.hotel?.images);
  const nights = Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000);
  const activeRating = hoverRating || rating;

  return (
    <AppLayout>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: '0 0 6px' }}>Chia sẻ trải nghiệm của bạn</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: 15 }}>Đánh giá của bạn giúp hàng triệu du khách tìm được nơi lưu trú hoàn hảo.</p>
        </div>

        {/* Booking Card */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, overflow: 'hidden', marginBottom: 24, display: 'flex', alignItems: 'stretch' }}>
          <div style={{ width: 200, flexShrink: 0 }}>
            <img
              src={hotelImg || 'https://images.unsplash.com/photo-1564501049714-8f6a89519604?w=400&q=80'}
              alt="Hotel"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>{booking.room?.hotel?.name}</h2>
              <div style={{ background: '#dcfce7', color: '#166534', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <IconCircleCheck size={14} /> Hoàn thành
              </div>
            </div>
            <p style={{ color: '#6b7280', fontSize: 13, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconCalendarEvent size={15} color="#6b7280" />
              {dayjs(booking.checkInDate).format('DD/MM/YYYY')} — {dayjs(booking.checkOutDate).format('DD/MM/YYYY')} ({nights} đêm)
            </p>
            <p style={{ color: '#374151', fontSize: 13, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <IconBed size={15} color="#6b7280" />
              {booking.room?.type}
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 32, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Overall + Sub ratings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, paddingBottom: 28, borderBottom: '1px solid #f3f4f6' }}>
            {/* Overall */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Đánh giá tổng thể</h3>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.1s', transform: activeRating >= star ? 'scale(1.15)' : 'scale(1)' }}
                  >
                    <IconStar
                      size={36}
                      style={{
                        fill: star <= activeRating ? '#facc15' : 'transparent',
                        color: star <= activeRating ? '#facc15' : '#d1d5db',
                        transition: 'all 0.15s',
                      }}
                    />
                  </button>
                ))}
              </div>
              {activeRating > 0 && (
                <p style={{ color: '#0b63d6', fontWeight: 600, fontSize: 14, margin: 0 }}>
                  {RATING_LABELS[activeRating]}
                </p>
              )}
            </div>

            {/* Sub ratings */}
            <div style={{ borderLeft: '1px solid #f3f4f6', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Object.keys(subRatings).map(key => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{SUB_RATING_LABELS[key]}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setSubHover(prev => ({ ...prev, [key]: star }))}
                        onMouseLeave={() => setSubHover(prev => ({ ...prev, [key]: 0 }))}
                        onClick={() => setSubRatings(prev => ({ ...prev, [key]: star }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1 }}
                      >
                        <IconStar
                          size={20}
                          style={{
                            fill: star <= (subHover[key] || (subRatings as any)[key]) ? '#facc15' : 'transparent',
                            color: star <= (subHover[key] || (subRatings as any)[key]) ? '#facc15' : '#e5e7eb',
                            transition: 'all 0.1s',
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Viết đánh giá của bạn</h3>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Bạn thích hay không thích điều gì? Bạn có muốn giới thiệu khách sạn này không?"
              rows={4}
              style={{
                width: '100%',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                padding: '12px 16px',
                fontSize: 14,
                color: '#374151',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.6,
                transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = '#0b63d6'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Quick Highlights */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Điểm nổi bật</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {HIGH_LIGHT_OPTIONS.map(opt => {
                const isSelected = highlights.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleHighlight(opt.value)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: '1.5px solid',
                      transition: 'all 0.15s',
                      background: isSelected ? '#eff6ff' : '#f9fafb',
                      borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
                      color: isSelected ? '#1d4ed8' : '#6b7280',
                    }}
                  >
                    {isSelected ? '✓ ' : ''}{opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photo Upload */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Thêm ảnh (Tùy chọn)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <label style={{
                width: 120, height: 120,
                border: '2px dashed #d1d5db',
                borderRadius: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: '#fafafa',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#0b63d6'; (e.currentTarget as HTMLElement).style.background = '#eff6ff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#d1d5db'; (e.currentTarget as HTMLElement).style.background = '#fafafa'; }}
              >
                <IconUpload size={24} color="#9ca3af" style={{ marginBottom: 6 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: 0.5 }}>TẢI LÊN</span>
                <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              </label>

              {imagePreviews.map((preview, index) => (
                <div key={index} style={{ position: 'relative', width: 120, height: 120, borderRadius: 10, overflow: 'hidden' }}>
                  <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      background: 'rgba(0,0,0,0.55)', color: '#fff',
                      border: 'none', borderRadius: '50%',
                      width: 24, height: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <IconX size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8 }}>
            <button
              type="button"
              onClick={() => navigate("/bookings")}
              style={{
                padding: '10px 24px',
                background: '#f9fafb',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f9fafb')}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: '10px 28px',
                background: submitting ? '#93c5fd' : '#0a58ca',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
              onMouseEnter={e => { if (!submitting) (e.currentTarget.style.background = '#084298'); }}
              onMouseLeave={e => { if (!submitting) (e.currentTarget.style.background = '#0a58ca'); }}
            >
              {submitting ? (
                <>
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  {uploading ? `Đang tải ảnh (${imageFiles.length})...` : 'Đang gửi...'}
                </>
              ) : 'Gửi đánh giá'}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </AppLayout>
  );
}

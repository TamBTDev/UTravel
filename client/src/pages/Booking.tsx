import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { notifications } from '@mantine/notifications';
import { createBookingThunk, clearError, clearSuccess } from '@/app/store/bookingSlice';
import { getRoomDetail } from '@/features/hotel/services/hotelService';
import dayjs from 'dayjs';
import { AppLayout } from '@/components/layout';
import { IconMoodSad, IconX, IconCircleCheck, IconStarFilled, IconMapPin, IconLock } from '@tabler/icons-react';
import { validatePromotion } from '@/features/booking/services/bookingService';

const parseJsonField = (val: any): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return []; }
  }
  return [];
};

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

interface Room {
  id: string;
  type: string;
  price: number;
  capacity: number;
  roomNumber: string;
  amenities: any;
  images: any;
  hotel?: {
    id: number;
    name: string;
    location: string;
    city: string;
    rating: number;
    images: any;
  };
}

export const BookingPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoading, error, success, currentBooking } = useSelector(
    (state: any) => state.booking
  );

  const roomId = searchParams.get('roomId');
  const initCheckIn = searchParams.get('checkIn') || dayjs().add(1, 'day').format('YYYY-MM-DD');
  const initCheckOut = searchParams.get('checkOut') || dayjs().add(3, 'day').format('YYYY-MM-DD');

  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [roomError, setRoomError] = useState<string | null>(null);

  const [checkInDate, setCheckInDate] = useState<string>(initCheckIn);
  const [checkOutDate, setCheckOutDate] = useState<string>(initCheckOut);
  const user = useSelector((state: any) => state.auth.user);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (user) {
      if (!firstName && user.firstName) setFirstName(user.firstName);
      if (!lastName && user.lastName) setLastName(user.lastName);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) { setRoomError('Room ID is missing'); setRoomLoading(false); return; }
      try {
        setRoomLoading(true);
        const roomData = await getRoomDetail(roomId);
        setRoom(roomData);
      } catch (err: any) {
        setRoomError(err.message || 'Failed to load room details');
      } finally {
        setRoomLoading(false);
      }
    };
    loadRoom();
  }, [roomId]);

  useEffect(() => {
    if (success && currentBooking) {
      notifications.show({ title: 'Đặt phòng thành công!', message: 'Đang chuyển sang trang thanh toán...', color: 'green' });
      const timer = setTimeout(() => {
        navigate(`/payment?bookingId=${currentBooking.id}&totalPrice=${currentBooking.finalPrice}`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, currentBooking, navigate]);

  useEffect(() => {
    if (error) {
      notifications.show({ title: 'Lỗi', message: error, color: 'red' });
      dispatch(clearError() as any);
    }
  }, [error, dispatch]);

  const nights = dayjs(checkOutDate).diff(dayjs(checkInDate), 'day');
  const totalPrice = room ? room.price * Math.max(nights, 0) : 0;

  const handleBooking = () => {
    if (!roomId || !room) return;
    if (nights <= 0) { notifications.show({ title: 'Lỗi', message: 'Ngày trả phòng phải sau ngày nhận phòng', color: 'red' }); return; }
    if (!firstName.trim() || !lastName.trim()) { notifications.show({ title: 'Lỗi', message: 'Vui lòng nhập họ và tên', color: 'red' }); return; }

    const bookingData = {
      roomId,
      checkInDate,
      checkOutDate,
      numberOfGuests: 1,
      specialRequests: specialRequests.trim(),
    };
    (dispatch as any)(createBookingThunk(bookingData));
  };

  const hotelImages = room ? parseJsonField(room.hotel?.images || room.images) : [];
  const hotelImg = hotelImages[0] || 'https://images.unsplash.com/photo-1564501049714-8f6a89519604?w=800&q=80';
  const amenitiesArr = room ? parseJsonField(room.amenities) : [];

  if (roomLoading) {
    return (
      <AppLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, border: '4px solid #e5e7eb', borderTopColor: '#0b63d6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280' }}>Đang tải thông tin phòng...</p>
          </div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </AppLayout>
    );
  }

  if (roomError || !room) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center', padding: '0 16px' }}>
          <IconMoodSad size={64} color="#9ca3af" style={{ marginBottom: 16 }} />
          <h2 style={{ color: '#111827', marginBottom: 8 }}>Không tìm thấy phòng</h2>
          <p style={{ color: '#6b7280', marginBottom: 24 }}>{roomError || 'Phòng không tồn tại hoặc đã bị xóa.'}</p>
          <button onClick={() => navigate('/hotels')} style={{ background: '#0b63d6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>Quay lại danh sách khách sạn</button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Top bar */}
      <div style={{ borderBottom: '1px solid #e5e7eb', padding: '12px 0', marginBottom: 0 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontWeight: 500, fontSize: 14 }}
          >
            <IconX size={16} /> Hủy đặt phòng
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 32 }}>Kiểm tra thông tin đặt phòng</h1>

        {/* Success banner */}
        {success && currentBooking && (
          <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: 10, padding: '14px 20px', marginBottom: 24, color: '#065f46', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconCircleCheck size={20} color="#059669" /> Đặt phòng thành công! Đang chuyển sang trang thanh toán...
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
          {/* ── LEFT COLUMN ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Hotel card */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
              {/* Hotel image */}
              <div style={{ position: 'relative', height: 220 }}>
                <img src={hotelImg} alt={room.hotel?.name || room.type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {room.hotel?.rating && (
                  <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: 20, padding: '4px 10px', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IconStarFilled size={12} color="#fbbf24" /> {room.hotel.rating.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Hotel info */}
              <div style={{ padding: '20px 24px' }}>
                <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 4, fontWeight: 600 }}>LƯU TRÚ TẠI KHÁCH SẠN</p>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{room.hotel?.name || room.type}</h2>
                {room.hotel && (
                  <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <IconMapPin size={16} color="#0b63d6" /> {room.hotel.location}, {room.hotel.city}
                  </p>
                )}

                {/* Amenity tags */}
                {amenitiesArr.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {amenitiesArr.slice(0, 4).map((a: string, i: number) => (
                      <span key={i} style={{ background: '#f3f4f6', color: '#374151', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 20 }}>
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {/* Check-in / Check-out */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, paddingTop: 16, borderTop: '1px solid #f3f4f6' }}>
                  <div>
                    <p style={{ fontSize: 11, textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, marginBottom: 6 }}>NHẬN PHÒNG</p>
                    <p style={{ fontWeight: 700, color: '#111827', marginBottom: 2 }}>{dayjs(checkInDate).format('DD/MM/YYYY')}</p>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>14:00</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, textTransform: 'uppercase', color: '#9ca3af', fontWeight: 600, marginBottom: 6 }}>TRẢ PHÒNG</p>
                    <p style={{ fontWeight: 700, color: '#111827', marginBottom: 2 }}>{dayjs(checkOutDate).format('DD/MM/YYYY')}</p>
                    <p style={{ fontSize: 13, color: '#6b7280' }}>12:00</p>
                  </div>
                </div>

                {/* Date pickers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Ngày nhận phòng</label>
                    <input
                      type="date"
                      value={checkInDate}
                      min={dayjs().format('YYYY-MM-DD')}
                      onChange={e => setCheckInDate(e.target.value)}
                      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Ngày trả phòng</label>
                    <input
                      type="date"
                      value={checkOutDate}
                      min={checkInDate}
                      onChange={e => setCheckOutDate(e.target.value)}
                      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#111827', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Guest Information */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Thông tin khách hàng</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Tên</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="VD: Nam"
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Họ</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="VD: Nguyễn"
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Địa chỉ Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nam.nguyen@example.com"
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>Thông tin xác nhận sẽ được gửi đến địa chỉ này.</p>
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Yêu cầu đặc biệt <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Không bắt buộc)</span></label>
                <textarea
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  placeholder="Bất kỳ yêu cầu đặc biệt nào? (VD: tầng cao, nôi cho em bé, v.v.)"
                  rows={3}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 12px', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            {/* Cancellation Policy */}
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px' }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Chính sách hủy phòng</h3>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <IconCircleCheck size={24} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontWeight: 600, color: '#065f46', marginBottom: 4 }}>
                    Hủy miễn phí trước 15:00, ngày {dayjs(checkInDate).subtract(2, 'day').format('DD/MM/YYYY')}.
                  </p>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>
                    Hủy trước thời gian này để được hoàn tiền toàn bộ. Sau thời gian này, phí hủy sẽ bằng 1 đêm lưu trú.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN – Price Card ── */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Chi tiết giá</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#374151' }}>
                    {formatVND(room.price)} × {Math.max(nights, 0)} đêm
                  </span>
                  <span style={{ fontWeight: 500 }}>{formatVND(totalPrice)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#374151' }}>Thuế & Phí</span>
                  <span style={{ fontWeight: 500 }}>0 ₫</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 16, paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>Tổng cộng</span>
                  <span style={{ fontWeight: 800, fontSize: 22, color: '#111827' }}>{formatVND(totalPrice)}</span>
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>Đã bao gồm tất cả các loại thuế và phí</p>
              </div>

              <button
                onClick={handleBooking}
                disabled={isLoading || nights <= 0}
                style={{
                  width: '100%',
                  marginTop: 20,
                  padding: '14px',
                  background: isLoading || nights <= 0 ? '#9ca3af' : '#0d9488',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: isLoading || nights <= 0 ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {isLoading ? 'Đang xử lý...' : <span style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}><IconLock size={16} /> Tiến hành thanh toán</span>}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 12 }}>
                <IconLock size={16} color="#9ca3af" />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Thanh toán bảo mật an toàn</span>
              </div>

              {/* Room details summary */}
              <div style={{ borderTop: '1px solid #f3f4f6', marginTop: 20, paddingTop: 16 }}>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Phòng đã chọn</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{room.type}</p>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>Tối đa {room.capacity} khách</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        input[type="date"]:focus,
        input[type="text"]:focus,
        input[type="email"]:focus,
        textarea:focus {
          border-color: #0b63d6 !important;
          box-shadow: 0 0 0 3px rgba(11, 99, 214, 0.1);
        }
        @media (max-width: 768px) {
          .booking-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AppLayout>
  );
};

export const Booking = BookingPage;

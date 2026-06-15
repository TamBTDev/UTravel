import { useEffect, useState } from 'react';
import { Loader, Modal, Button, Alert, Drawer } from '@mantine/core';
import {
  IconAlertCircle, IconCheck, IconWallet, IconX,
  IconCalendarEvent, IconTicket, IconCreditCard,
  IconBed, IconMapPin, IconStar, IconUsers,
  IconChevronRight, IconBuildingSkyscraper,
  IconClockHour4, IconArrowRight,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getMyBookings, cancelBooking } from '@/features/booking/services/bookingService';
import dayjs from 'dayjs';
import { AppLayout } from '../components/layout';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const STATUS_CONFIG: Record<string, { label: string; text: string; bg: string; dot: string }> = {
  PENDING:   { label: 'Chờ xác nhận', text: '#854d0e', bg: '#fef9c3', dot: '#eab308' },
  CONFIRMED: { label: 'Sắp tới',      text: '#1e40af', bg: '#dbeafe', dot: '#3b82f6' },
  COMPLETED: { label: 'Đã hoàn thành',text: '#166534', bg: '#dcfce7', dot: '#22c55e' },
  CANCELLED: { label: 'Đã hủy',       text: '#991b1b', bg: '#fee2e2', dot: '#ef4444' },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Chưa thanh toán', color: '#d97706' },
  COMPLETED: { label: 'Đã thanh toán',   color: '#16a34a' },
  FAILED:    { label: 'Thất bại',        color: '#dc2626' },
  REFUNDED:  { label: 'Đã hoàn tiền',   color: '#2563eb' },
};

const parseImg = (val: any): string => {
  if (!val) return '';
  if (Array.isArray(val)) return val[0] || '';
  if (typeof val === 'string') { try { const p = JSON.parse(val); return Array.isArray(p) ? p[0] : ''; } catch { return val; } }
  return '';
};

export const Bookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Detail drawer
  const [selected, setSelected] = useState<any>(null);

  // Cancel modal
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyBookings();
      setBookings(data || []);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách đặt phòng');
    } finally {
      setLoading(false);
    }
  };

  const willRefund = (booking: any) =>
    booking.payment?.method === 'BANK_TRANSFER' && booking.payment?.status === 'COMPLETED';

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const result = await cancelBooking(cancelTarget.id);
      notifications.show({
        title: 'Hủy đặt phòng thành công',
        message: result.message || 'Đặt phòng đã được hủy.',
        color: result.refunded ? 'blue' : 'green',
        icon: result.refunded ? <IconWallet size={16} /> : <IconCheck size={16} />,
      });
      await loadBookings();
      setSelected(null);
    } catch (err: any) {
      notifications.show({
        title: 'Lỗi',
        message: err.response?.data?.message || err.message || 'Không thể hủy đặt phòng.',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };

  if (loading) return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <Loader color="var(--color-primary)" size="lg" />
      </div>
    </AppLayout>
  );

  if (error) return (
    <AppLayout>
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ color: '#dc2626', marginBottom: 16 }}>⚠️ {error}</p>
        <button onClick={loadBookings} style={{ background: '#0b63d6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>Thử lại</button>
      </div>
    </AppLayout>
  );

  const pendingCount   = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
  const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;

  const filteredBookings = bookings.filter(b => {
    if (filterStatus === 'UPCOMING')  return b.status === 'PENDING' || b.status === 'CONFIRMED';
    if (filterStatus === 'COMPLETED') return b.status === 'COMPLETED';
    if (filterStatus === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <AppLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>Chuyến đi của tôi</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Quản lý các chuyến đi sắp tới và xem lại hành trình đã qua.</p>
        </div>

        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          {/* ── SIDEBAR ── */}
          <div style={{ width: 220, flexShrink: 0, border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, background: '#fff', position: 'sticky', top: 100 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Trạng thái</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([
                { key: 'ALL',       label: `Tất cả (${bookings.length})` },
                { key: 'UPCOMING',  label: `Sắp tới (${pendingCount})` },
                { key: 'COMPLETED', label: `Đã hoàn thành (${completedCount})` },
                { key: 'CANCELLED', label: `Đã hủy (${cancelledCount})` },
              ] as const).map(opt => (
                <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="radio" name="status" checked={filterStatus === opt.key} onChange={() => setFilterStatus(opt.key)}
                    style={{ width: 16, height: 16, accentColor: '#0b63d6' }} />
                  <span style={{ fontSize: 14, color: filterStatus === opt.key ? '#0b63d6' : '#4b5563', fontWeight: filterStatus === opt.key ? 600 : 400 }}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>

            <div style={{ height: 1, background: '#e5e7eb', margin: '18px 0' }} />

            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827', margin: '0 0 14px' }}>Loại dịch vụ</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked readOnly style={{ width: 16, height: 16, accentColor: '#0b63d6' }} />
              <span style={{ fontSize: 14, color: '#4b5563' }}>Khách sạn</span>
            </label>
          </div>

          {/* ── BOOKING LIST ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}>
                <IconBuildingSkyscraper size={48} color="#d1d5db" style={{ marginBottom: 12 }} />
                <p style={{ color: '#6b7280', fontSize: 16, margin: 0 }}>Không tìm thấy chuyến đi nào.</p>
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const statusCfg = STATUS_CONFIG[booking.status] || { label: booking.status, text: '#4b5563', bg: '#f3f4f6', dot: '#9ca3af' };
                const img = parseImg(booking.room?.hotel?.images);
                const nights = Math.max(1, Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000));

                return (
                  <div
                    key={booking.id}
                    onClick={() => setSelected(booking)}
                    style={{
                      display: 'flex', border: '1px solid #e5e7eb', borderRadius: 14,
                      overflow: 'hidden', background: '#fff', cursor: 'pointer',
                      transition: 'box-shadow 0.18s, transform 0.18s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLElement).style.transform = 'none';
                    }}
                  >
                    {/* Image */}
                    <div style={{ width: 260, height: 200, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                      {img ? (
                        <img src={img} alt="Hotel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#e5e7eb,#f3f4f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconBuildingSkyscraper size={40} color="#9ca3af" />
                        </div>
                      )}
                      {/* Status dot overlay */}
                      <div style={{ position: 'absolute', top: 12, left: 12, background: statusCfg.bg, color: statusCfg.text, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusCfg.dot }} />
                        {statusCfg.label}
                      </div>
                    </div>

                    {/* Details */}
                    <div style={{ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 3px' }}>{booking.room?.hotel?.name || 'Khách sạn'}</h3>
                            <p style={{ fontSize: 13, color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <IconMapPin size={13} color="#9ca3af" />
                              {booking.room?.hotel?.city} · {booking.room?.type}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 19, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.2 }}>{formatVND(booking.finalPrice)}</p>
                            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Tổng cộng</p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 10 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#4b5563' }}>
                            <IconCalendarEvent size={15} color="#6b7280" />
                            {dayjs(booking.checkInDate).format('DD/MM/YYYY')} <IconArrowRight size={12} color="#9ca3af" /> {dayjs(booking.checkOutDate).format('DD/MM/YYYY')}
                            <span style={{ color: '#9ca3af' }}>({nights} đêm)</span>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#4b5563' }}>
                            <IconTicket size={15} color="#6b7280" />
                            #{String(booking.id).slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Actions row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                            <button
                              onClick={e => { e.stopPropagation(); setCancelTarget(booking); }}
                              style={{ border: 'none', background: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: 13, padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}
                            >
                              Hủy phòng
                            </button>
                          )}
                          {booking.status === 'COMPLETED' && !booking.review && (
                            <button
                              onClick={e => { e.stopPropagation(); window.location.href = `/bookings/${booking.id}/review`; }}
                              style={{ border: 'none', background: '#eff6ff', color: '#0b63d6', fontWeight: 600, fontSize: 13, padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}
                            >
                              ✍️ Đánh giá
                            </button>
                          )}
                          {booking.status === 'COMPLETED' && booking.review && (
                            <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <IconCheck size={15} /> Đã đánh giá
                            </span>
                          )}
                          {booking.payment?.status === 'REFUNDED' && (
                            <span style={{ color: '#2563eb', fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                              <IconCreditCard size={15} /> Đã hoàn tiền
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
                          Xem chi tiết <IconChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── DETAIL DRAWER ── */}
      <Drawer
        opened={!!selected}
        onClose={() => setSelected(null)}
        position="right"
        size={480}
        title={<span style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>Chi tiết đặt phòng</span>}
        padding="xl"
      >
        {selected && (() => {
          const s = selected;
          const statusCfg = STATUS_CONFIG[s.status] || { label: s.status, text: '#4b5563', bg: '#f3f4f6', dot: '#9ca3af' };
          const img = parseImg(s.room?.hotel?.images);
          const nights = Math.max(1, Math.ceil((new Date(s.checkOutDate).getTime() - new Date(s.checkInDate).getTime()) / 86400000));
          const paymentInfo = s.payment?.status ? (PAYMENT_STATUS[s.payment.status] || { label: s.payment.status, color: '#6b7280' }) : null;
          const roomImgs = (() => { const v = s.room?.images; if (!v) return []; if (Array.isArray(v)) return v; try { return JSON.parse(v); } catch { return []; } })();

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Hotel image */}
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 200, background: '#f3f4f6', position: 'relative' }}>
                {img ? (
                  <img src={img} alt={s.room?.hotel?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconBuildingSkyscraper size={48} color="#9ca3af" />
                  </div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
                <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 800, fontSize: 18, margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{s.room?.hotel?.name}</p>
                    <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconMapPin size={13} /> {s.room?.hotel?.city}
                    </p>
                  </div>
                  {s.room?.hotel?.rating && (
                    <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <IconStar size={14} color="#facc15" fill="#facc15" />
                      <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{Number(s.room.hotel.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: statusCfg.bg, borderRadius: 10, padding: '10px 16px' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: statusCfg.text, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusCfg.dot }} />
                  {statusCfg.label}
                </span>
                <span style={{ fontSize: 13, color: statusCfg.text, opacity: 0.8 }}>#{String(s.id).slice(0, 8).toUpperCase()}</span>
              </div>

              {/* Dates + Room */}
              <div style={{ background: '#f9fafb', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>Nhận phòng</p>
                    <p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>{dayjs(s.checkInDate).format('DD MMM YYYY')}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>từ 14:00</p>
                  </div>
                  <div style={{ background: '#fff', borderRadius: 8, padding: '10px 14px', border: '1px solid #e5e7eb' }}>
                    <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 4px' }}>Trả phòng</p>
                    <p style={{ fontWeight: 700, color: '#111827', margin: 0 }}>{dayjs(s.checkOutDate).format('DD MMM YYYY')}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>trước 12:00</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4b5563' }}>
                    <IconClockHour4 size={16} color="#6b7280" /> {nights} đêm
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4b5563' }}>
                    <IconBed size={16} color="#6b7280" /> {s.room?.type}
                  </div>
                  {s.room?.capacity && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4b5563' }}>
                      <IconUsers size={16} color="#6b7280" /> tối đa {s.room.capacity} khách
                    </div>
                  )}
                </div>

                {s.specialRequests && (
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12 }}>
                    <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, margin: '0 0 4px' }}>Yêu cầu đặc biệt</p>
                    <p style={{ fontSize: 13, color: '#4b5563', margin: 0, fontStyle: 'italic' }}>"{s.specialRequests}"</p>
                  </div>
                )}
              </div>

              {/* Price breakdown */}
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', margin: '0 0 12px' }}>Chi tiết giá</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#6b7280' }}>Tiền phòng ({nights} đêm)</span>
                    <span style={{ fontWeight: 500 }}>{formatVND(s.totalPrice || s.finalPrice)}</span>
                  </div>
                  {s.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#16a34a' }}>Giảm giá</span>
                      <span style={{ fontWeight: 500, color: '#16a34a' }}>-{formatVND(s.discountAmount)}</span>
                    </div>
                  )}
                  <div style={{ height: 1, background: '#e5e7eb', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>Tổng cộng</span>
                    <span style={{ fontWeight: 800, fontSize: 18, color: '#0b63d6' }}>{formatVND(s.finalPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Payment info */}
              {paymentInfo && (
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#4b5563', fontWeight: 600 }}>Phương thức thanh toán</span>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, color: '#111827', margin: 0, fontWeight: 500 }}>
                      {s.payment.method === 'CASH' ? '💵 Tiền mặt' : '🏦 Chuyển khoản'}
                    </p>
                    <p style={{ fontSize: 12, color: paymentInfo.color, margin: 0, fontWeight: 600 }}>{paymentInfo.label}</p>
                  </div>
                </div>
              )}

              {/* Room images */}
              {roomImgs.length > 0 && (
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>Ảnh phòng</p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {roomImgs.slice(0, 4).map((url: string, i: number) => (
                      <div key={i} style={{ width: 90, height: 70, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                        <img src={url} alt={`Room ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
                {(s.status === 'PENDING' || s.status === 'CONFIRMED') && (
                  <Button
                    fullWidth color="red" variant="light" size="md"
                    leftSection={<IconX size={16} />}
                    onClick={() => { setSelected(null); setTimeout(() => setCancelTarget(s), 200); }}
                  >
                    Hủy đặt phòng
                  </Button>
                )}
                {s.status === 'COMPLETED' && !s.review && (
                  <Button
                    fullWidth color="blue" size="md"
                    onClick={() => { window.location.href = `/bookings/${s.id}/review`; }}
                  >
                    ✍️ Viết đánh giá
                  </Button>
                )}
                {s.status === 'COMPLETED' && s.review && (
                  <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <IconCheck size={18} color="#16a34a" />
                    <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 14 }}>Bạn đã đánh giá chuyến đi này</span>
                  </div>
                )}
                <Button
                  fullWidth variant="subtle" color="gray"
                  onClick={() => setSelected(null)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          );
        })()}
      </Drawer>

      {/* Cancel Modal */}
      <Modal opened={!!cancelTarget} onClose={() => !cancelling && setCancelTarget(null)}
        title={<span style={{ fontWeight: 700, fontSize: 18 }}>Xác nhận hủy phòng</span>} centered>
        {cancelTarget && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0 }}>Bạn có chắc muốn hủy đặt phòng tại <strong>{cancelTarget.room?.hotel?.name}</strong>?</p>
            {willRefund(cancelTarget) ? (
              <Alert icon={<IconWallet size={16} />} color="blue" radius="md">
                <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>Hoàn tiền vào Ví UTravel</p>
                <p style={{ fontSize: 13, margin: 0 }}>Vì bạn đã thanh toán qua chuyển khoản, <strong>{formatVND(cancelTarget.finalPrice)}</strong> sẽ được hoàn vào ví của bạn.</p>
              </Alert>
            ) : (
              <Alert icon={<IconAlertCircle size={16} />} color="yellow" radius="md">
                <p style={{ fontSize: 13, margin: 0 }}>Không phát sinh hoàn tiền vì đặt phòng chưa được thanh toán hoặc thanh toán bằng tiền mặt.</p>
              </Alert>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
              <Button variant="default" onClick={() => setCancelTarget(null)} disabled={cancelling}>Giữ lại</Button>
              <Button color="red" loading={cancelling} onClick={handleCancelConfirm} leftSection={<IconX size={14} />}>Xác nhận hủy</Button>
            </div>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
};

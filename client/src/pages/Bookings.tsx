import { useEffect, useState } from 'react';
import { Badge, Loader, Modal, Button, Alert } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconWallet, IconX, IconCalendarEvent, IconTicket, IconCreditCard } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { getMyBookings, cancelBooking } from '@/features/booking/services/bookingService';
import dayjs from 'dayjs';
import { AppLayout } from '../components/layout';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const STATUS_CONFIG: Record<string, { color: string; label: string; text: string; bg: string }> = {
  PENDING:   { color: '#eab308', label: 'Chờ xác nhận', text: '#854d0e', bg: '#fef08a' },
  CONFIRMED: { color: '#3b82f6', label: 'Sắp tới',      text: '#1e40af', bg: '#dbeafe' },
  COMPLETED: { color: '#22c55e', label: 'Đã hoàn thành',text: '#166534', bg: '#dcfce7' },
  CANCELLED: { color: '#ef4444', label: 'Đã hủy',       text: '#991b1b', bg: '#fee2e2' },
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

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Cancel modal
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Loader color="var(--color-primary)" size="lg" /></div>
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

  const pendingCount = bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;
  const cancelledCount = bookings.filter(b => b.status === 'CANCELLED').length;

  const filteredBookings = bookings.filter(b => {
    if (filterStatus === 'UPCOMING') return b.status === 'PENDING' || b.status === 'CONFIRMED';
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
          {/* ── LEFT SIDEBAR (FILTERS) ── */}
          <div style={{ width: 240, flexShrink: 0, border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, background: '#fff' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Trạng thái</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="radio" name="status" checked={filterStatus === 'ALL'} onChange={() => setFilterStatus('ALL')} style={{ width: 16, height: 16, accentColor: '#0b63d6' }} />
                <span style={{ fontSize: 14, color: filterStatus === 'ALL' ? '#0b63d6' : '#4b5563', fontWeight: filterStatus === 'ALL' ? 600 : 400 }}>Tất cả ({bookings.length})</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="radio" name="status" checked={filterStatus === 'UPCOMING'} onChange={() => setFilterStatus('UPCOMING')} style={{ width: 16, height: 16, accentColor: '#0b63d6' }} />
                <span style={{ fontSize: 14, color: filterStatus === 'UPCOMING' ? '#0b63d6' : '#4b5563', fontWeight: filterStatus === 'UPCOMING' ? 600 : 400 }}>Sắp tới ({pendingCount})</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="radio" name="status" checked={filterStatus === 'COMPLETED'} onChange={() => setFilterStatus('COMPLETED')} style={{ width: 16, height: 16, accentColor: '#0b63d6' }} />
                <span style={{ fontSize: 14, color: filterStatus === 'COMPLETED' ? '#0b63d6' : '#4b5563', fontWeight: filterStatus === 'COMPLETED' ? 600 : 400 }}>Đã hoàn thành ({completedCount})</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="radio" name="status" checked={filterStatus === 'CANCELLED'} onChange={() => setFilterStatus('CANCELLED')} style={{ width: 16, height: 16, accentColor: '#0b63d6' }} />
                <span style={{ fontSize: 14, color: filterStatus === 'CANCELLED' ? '#0b63d6' : '#4b5563', fontWeight: filterStatus === 'CANCELLED' ? 600 : 400 }}>Đã hủy ({cancelledCount})</span>
              </label>
            </div>

            <div style={{ height: 1, background: '#e5e7eb', margin: '20px 0' }} />

            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>Loại dịch vụ</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked readOnly style={{ width: 16, height: 16, accentColor: '#0b63d6' }} />
                <span style={{ fontSize: 14, color: '#4b5563' }}>Khách sạn</span>
              </label>
            </div>
          </div>

          {/* ── RIGHT CONTENT (BOOKINGS LIST) ── */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filteredBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', border: '1px solid #e5e7eb', borderRadius: 12, background: '#fff' }}>
                <p style={{ color: '#6b7280', fontSize: 16 }}>Không tìm thấy chuyến đi nào.</p>
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const statusCfg = STATUS_CONFIG[booking.status] || { color: '#6b7280', label: booking.status, text: '#4b5563', bg: '#f3f4f6' };
                const img = parseImg(booking.room?.hotel?.images);
                const nights = Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000);

                return (
                  <div key={booking.id} style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                    {/* Image */}
                    <div style={{ width: 280, height: 220, flexShrink: 0, position: 'relative' }}>
                      {img ? (
                        <img src={img} alt="Hotel" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: '#f3f4f6' }} />
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div style={{ background: statusCfg.bg, color: statusCfg.text, padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                            {statusCfg.label}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 20, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.2 }}>{formatVND(booking.finalPrice)}</p>
                            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Tổng cộng</p>
                          </div>
                        </div>

                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>{booking.room?.hotel?.name || 'Khách sạn'}</h3>
                        <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 12px' }}>
                          {booking.room?.type} · {booking.room?.hotel?.city}
                        </p>

                        <p style={{ fontSize: 13, color: '#4b5563', margin: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconCalendarEvent size={16} color="#6b7280" /> {dayjs(booking.checkInDate).format('DD MMM YYYY')} – {dayjs(booking.checkOutDate).format('DD MMM YYYY')} ({nights} đêm)</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconTicket size={16} color="#6b7280" /> Mã đặt phòng: {String(booking.id).slice(0,8).toUpperCase()}</span>
                        </p>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 16, marginTop: 24 }}>
                        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                          <button
                            onClick={() => setCancelTarget(booking)}
                            style={{ border: 'none', background: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: 14, padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}
                          >
                            Hủy phòng
                          </button>
                        )}
                        {booking.status === 'COMPLETED' && !booking.review && (
                          <button
                            onClick={() => window.location.href = `/bookings/${booking.id}/review`}
                            style={{ border: 'none', background: '#0b63d6', color: '#fff', fontWeight: 600, fontSize: 14, padding: '10px 20px', borderRadius: 8, cursor: 'pointer' }}
                          >
                            Đánh giá
                          </button>
                        )}
                        {booking.status === 'COMPLETED' && booking.review && (
                          <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <IconCheck size={16} /> Đã đánh giá
                          </span>
                        )}
                        {booking.paymentStatus === 'REFUNDED' && (
                          <span style={{ color: '#2563eb', fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <IconCreditCard size={16} /> Đã hoàn tiền vào ví
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cancel Modal */}
          <Modal opened={!!cancelTarget} onClose={() => !cancelling && setCancelTarget(null)} title={<span style={{ fontWeight: 700, fontSize: 18 }}>Xác nhận hủy phòng</span>} centered>
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
        </div>
      </div>
    </AppLayout>
  );
};

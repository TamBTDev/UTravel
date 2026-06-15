import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Progress } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { createPayment, getBookingDetail, getPaymentByBooking } from '@/features/booking/services/bookingService';
import { IconConfetti, IconCircleCheck, IconLock, IconClock, IconShieldCheck, IconAlertCircle, IconCash, IconBuildingBank, IconBulb, IconMapPin } from '@tabler/icons-react';
import dayjs from 'dayjs';

interface BankInfo {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  transferContent: string;
  qrCodeUrl: string;
}

const POLLING_INTERVAL = 5000;
const PAYMENT_TIMEOUT = 10 * 60 * 1000;

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const parseImg = (val: any): string => {
  if (!val) return '';
  if (Array.isArray(val)) return val[0] || '';
  if (typeof val === 'string') { try { const p = JSON.parse(val); return Array.isArray(p) ? p[0] : ''; } catch { return val; } }
  return '';
};

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<'CASH' | 'BANK_TRANSFER' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [cashSuccess, setCashSuccess] = useState(false);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [bankTransferPaid, setBankTransferPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
  const [polling, setPolling] = useState(false);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!bookingId) { setError('Thiếu thông tin đặt phòng'); setLoading(false); return; }
      try {
        const data = await getBookingDetail(bookingId);
        setBooking(data);
      } catch (e: any) {
        setError(e.message || 'Không thể tải thông tin đặt phòng');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  useEffect(() => () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  const startPolling = useCallback(() => {
    if (!bookingId) return;
    setPolling(true);
    countdownRef.current = setInterval(() => setTimeLeft(p => Math.max(0, p - 1000)), 1000);
    pollingRef.current = setInterval(async () => {
      try {
        const pd = await getPaymentByBooking(bookingId);
        if (pd?.status === 'COMPLETED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (countdownRef.current) clearInterval(countdownRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setPolling(false);
          setBankTransferPaid(true);
          notifications.show({ title: 'Thanh toán thành công! 🎉', message: 'Đặt phòng đã được xác nhận.', color: 'green' });
          setTimeout(() => navigate('/bookings'), 3000);
        }
      } catch {}
    }, POLLING_INTERVAL);
    timeoutRef.current = setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setPolling(false);
      setPaymentError('Hết thời gian chờ thanh toán. Vui lòng thử lại.');
    }, PAYMENT_TIMEOUT);
  }, [bookingId, navigate]);

  const handlePayment = async () => {
    if (!bookingId || !selectedMethod) { setPaymentError('Vui lòng chọn phương thức thanh toán'); return; }
    setProcessing(true); setPaymentError(null);
    try {
      const result = await createPayment({ bookingId, method: selectedMethod });
      if (selectedMethod === 'CASH') {
        setCashSuccess(true);
        notifications.show({ title: 'Đặt phòng thành công!', message: 'Vui lòng thanh toán tiền mặt khi nhận phòng.', color: 'teal' });
        setTimeout(() => navigate('/bookings'), 3000);
      } else {
        setBankInfo(result.data.bankInfo);
        setTimeLeft(PAYMENT_TIMEOUT);
        startPolling();
      }
    } catch (e: any) {
      setPaymentError(e.response?.data?.message || e.message || 'Lỗi tạo thanh toán.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setBankInfo(null); setPaymentError(null); setTimeLeft(PAYMENT_TIMEOUT);
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPolling(false);
  };

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const nights = booking ? Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000) : 0;
  const hotelImg = booking ? parseImg(booking.room?.hotel?.images) : '';
  const taxAmount = booking ? Math.round(booking.finalPrice * 0.1) : 0;

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#0b63d6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#6b7280', margin: 0 }}>Đang tải...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <IconAlertCircle size={64} color="#f59e0b" style={{ marginBottom: 16 }} />
        <h2 style={{ color: '#111827' }}>{error}</h2>
        <button onClick={() => navigate('/hotels')} style={{ marginTop: 16, background: '#0b63d6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>Quay lại</button>
      </div>
    </div>
  );

  // ── Success: CASH ──
  if (cashSuccess) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 48, textAlign: 'center', border: '2px solid #6ee7b7', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <IconCircleCheck size={80} color="#10b981" style={{ marginBottom: 16 }} />
        <h2 style={{ color: '#065f46', marginBottom: 8 }}>Đặt phòng thành công!</h2>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>Vui lòng thanh toán tiền mặt khi đến nhận phòng.</p>
        <div style={{ background: '#d1fae5', borderRadius: 20, padding: '6px 16px', display: 'inline-block', color: '#065f46', fontWeight: 600, fontSize: 14 }}>Thanh toán tại nơi</div>
        <p style={{ color: '#9ca3af', marginTop: 16, fontSize: 13 }}>Đang chuyển về trang đặt phòng...</p>
      </div>
    </div>
  );

  // ── Success: BANK_TRANSFER ──
  if (bankTransferPaid) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 48, textAlign: 'center', border: '2px solid #93c5fd', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <IconConfetti size={80} color="#3b82f6" style={{ marginBottom: 16 }} />
        <h2 style={{ color: '#1e40af', marginBottom: 8 }}>Thanh toán thành công!</h2>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>Đặt phòng của bạn đã được xác nhận.</p>
        <p style={{ color: '#9ca3af', fontSize: 13 }}>Đang chuyển về trang đặt phòng...</p>
      </div>
    </div>
  );

  // ── QR Code BANK_TRANSFER ──
  if (bankInfo) {
    const progressPercent = ((PAYMENT_TIMEOUT - timeLeft) / PAYMENT_TIMEOUT) * 100;
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#0b63d6' }}>✈ UTravel</span>
          <span style={{ fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}><IconLock size={16} /> Secure Checkout</span>
        </div>

        <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 24px' }}>
          <button onClick={handleRetry} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0b63d6', fontWeight: 500, fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Thay đổi phương thức
          </button>

          <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontWeight: 700, fontSize: 20, color: '#111827', marginBottom: 4 }}>Quét mã QR để thanh toán</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Sử dụng ứng dụng ngân hàng bất kỳ</p>

            {/* Countdown */}
            <div style={{ background: '#fff7ed', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#ea580c', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}><IconClock size={16} /> Thời gian còn lại: {formatTime(timeLeft)}</span>
                <span style={{ color: '#9ca3af', fontSize: 12 }}>Quét mã trong 10 phút</span>
              </div>
              <Progress value={progressPercent} color="orange" size="sm" />
            </div>

            {/* QR */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ border: '2px solid #e5e7eb', borderRadius: 12, padding: 16, background: '#fff' }}>
                <img src={bankInfo.qrCodeUrl} alt="QR Code" width={200} height={200} style={{ display: 'block' }} />
              </div>
            </div>

            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 20, marginBottom: 20, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>— Hoặc chuyển khoản thủ công —</div>

            {/* Bank details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Ngân hàng', value: bankInfo.bankCode },
                { label: 'Số tài khoản', value: bankInfo.accountNumber, bold: true, copy: true },
                { label: 'Tên tài khoản', value: bankInfo.accountName },
                { label: 'Số tiền', value: formatVND(bankInfo.amount), bold: true, color: '#0b63d6' },
                { label: 'Nội dung CK', value: bankInfo.transferContent, bold: true, color: '#ea580c', copy: true },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: item.bold ? 700 : 400, fontSize: 13, color: item.color || '#111827' }}>{item.value}</span>
                    {item.copy && (
                      <button onClick={() => { navigator.clipboard.writeText(item.value); notifications.show({ message: 'Đã sao chép!', color: 'green', autoClose: 1500 }); }}
                        style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', fontSize: 11, color: '#0b63d6' }}>
                        Sao chép
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginTop: 20, fontSize: 13, color: '#1e40af', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <IconShieldCheck size={20} style={{ flexShrink: 0 }} />
              <div>
                Nhập <strong>đúng nội dung chuyển khoản</strong> để hệ thống tự xác nhận. Kiểm tra mỗi 5 giây.
                {polling && <span style={{ marginLeft: 8, color: '#6b7280' }}>Đang kiểm tra...</span>}
              </div>
            </div>

            {paymentError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginTop: 12, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconAlertCircle size={18} /> {paymentError}
                <button onClick={handleRetry} style={{ marginLeft: 12, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12 }}>Thử lại</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Payment Selection ──
  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 800, fontSize: 20, color: '#0b63d6' }}>✈ UTravel</span>
        <span style={{ fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}><IconLock size={16} /> Secure Checkout</span>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0b63d6', fontWeight: 500, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
          ← Back to details
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 28 }}>Complete your booking</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
          {/* ── LEFT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Payment Method */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 20 }}>Payment Method</h3>

              {paymentError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconAlertCircle size={16} /> {paymentError}
                </div>
              )}

              {/* CASH option */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px', borderRadius: 10, border: `2px solid ${selectedMethod === 'CASH' ? '#0b63d6' : '#e5e7eb'}`, cursor: 'pointer', marginBottom: 12, background: selectedMethod === 'CASH' ? '#eff6ff' : '#fff', transition: 'all 0.15s' }}>
                <div style={{ marginTop: 2 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedMethod === 'CASH' ? '#0b63d6' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedMethod === 'CASH' ? '#0b63d6' : 'transparent' }}>
                    {selectedMethod === 'CASH' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </div>
                <input type="radio" name="method" value="CASH" checked={selectedMethod === 'CASH'} onChange={() => setSelectedMethod('CASH')} style={{ display: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  <IconCash size={24} color={selectedMethod === 'CASH' ? '#0b63d6' : '#6b7280'} />
                  <div>
                    <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 15 }}>Tiền mặt tại nơi</p>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: 13 }}>Đặt phòng ngay, thanh toán tiền mặt khi nhận phòng</p>
                  </div>
                </div>
              </label>

              {/* BANK_TRANSFER option */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px', borderRadius: 10, border: `2px solid ${selectedMethod === 'BANK_TRANSFER' ? '#0b63d6' : '#e5e7eb'}`, cursor: 'pointer', background: selectedMethod === 'BANK_TRANSFER' ? '#eff6ff' : '#fff', transition: 'all 0.15s' }}>
                <div style={{ marginTop: 2 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedMethod === 'BANK_TRANSFER' ? '#0b63d6' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedMethod === 'BANK_TRANSFER' ? '#0b63d6' : 'transparent' }}>
                    {selectedMethod === 'BANK_TRANSFER' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </div>
                <input type="radio" name="method" value="BANK_TRANSFER" checked={selectedMethod === 'BANK_TRANSFER'} onChange={() => setSelectedMethod('BANK_TRANSFER')} style={{ display: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  <IconBuildingBank size={24} color={selectedMethod === 'BANK_TRANSFER' ? '#0b63d6' : '#6b7280'} />
                  <div>
                    <p style={{ fontWeight: 600, color: '#111827', margin: 0, fontSize: 15 }}>Bank Transfer</p>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: 13 }}>Quét QR code hoặc chuyển khoản thủ công qua SePay</p>
                    {selectedMethod === 'BANK_TRANSFER' && (
                      <p style={{ color: '#2563eb', margin: '4px 0 0', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}><IconBulb size={14} /> Nếu hủy sau khi đã chuyển khoản, tiền sẽ hoàn vào Ví UTravel</p>
                    )}
                  </div>
                </div>
              </label>

              <button
                onClick={handlePayment}
                disabled={!selectedMethod || processing}
                style={{
                  width: '100%', marginTop: 20, padding: '14px',
                  background: !selectedMethod || processing ? '#9ca3af' : '#1a56db',
                  color: '#fff', border: 'none', borderRadius: 10,
                  fontSize: 16, fontWeight: 700, cursor: !selectedMethod || processing ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                {processing ? (
                  <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang xử lý...</>
                ) : (
                  <><IconLock size={16} /> {selectedMethod === 'CASH' ? 'Xác nhận đặt phòng' : selectedMethod === 'BANK_TRANSFER' ? 'Pay Now' : 'Chọn phương thức'}</>
                )}
              </button>
              <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 10 }}>
                By clicking "Pay Now", you agree to our <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#0b63d6' }}>Terms & Conditions</span>
              </p>
            </div>
          </div>

          {/* ── RIGHT: Booking Summary ── */}
          <div style={{ position: 'sticky', top: 20 }}>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 20 }}>Booking Summary</h3>

              {booking && (
                <>
                  {/* Hotel card */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    {hotelImg && (
                      <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={hotelImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', margin: '0 0 2px', fontWeight: 600 }}>HOTEL STAY</p>
                      <p style={{ fontWeight: 700, color: '#111827', margin: '0 0 4px', fontSize: 14 }}>{booking.room?.hotel?.name || 'Khách sạn'}</p>
                      <p style={{ color: '#6b7280', fontSize: 12, margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <IconMapPin size={14} color="#6b7280" /> {booking.room?.hotel?.city}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Dates</span>
                      <span style={{ fontWeight: 500, color: '#111827' }}>
                        {dayjs(booking.checkInDate).format('MMM D')} – {dayjs(booking.checkOutDate).format('MMM D')} ({nights} nights)
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Room</span>
                      <span style={{ fontWeight: 500, color: '#111827' }}>{booking.room?.type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Guests</span>
                      <span style={{ fontWeight: 500, color: '#111827' }}>{booking.adults || 1} Adults</span>
                    </div>
                  </div>

                  {/* Price breakdown */}
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#374151' }}>{formatVND(booking.room?.price || 0)} × {nights} đêm</span>
                      <span style={{ fontWeight: 500 }}>{formatVND(booking.totalPrice)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#374151' }}>Taxes & Fees</span>
                      <span style={{ fontWeight: 500 }}>0 ₫</span>
                    </div>
                    {booking.discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#16a34a' }}>Discount</span>
                        <span style={{ fontWeight: 500, color: '#16a34a' }}>-{formatVND(booking.discountAmount)}</span>
                      </div>
                    )}

                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>Total</span>
                      <span style={{ fontWeight: 800, fontSize: 22, color: '#111827' }}>{formatVND(booking.finalPrice)}</span>
                    </div>
                  </div>
                </>
              )}

              <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <IconLock size={14} /> Secure encrypted checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#111827', marginTop: 60, padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontWeight: 800, fontSize: 18, color: '#fff', margin: '0 0 8px' }}>UTravel</p>
        <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>© 2024 UTravel Inc. Secure Checkout.</p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Progress } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { createPayment, getBookingDetail, getPaymentByBooking } from '@/features/booking/services/bookingService';
import {
  IconConfetti, IconCircleCheck, IconLock, IconClock,
  IconShieldCheck, IconAlertCircle, IconCash, IconBuildingBank,
  IconBulb, IconMapPin, IconArrowLeft, IconRefresh,
  IconCalendarEvent, IconBed, IconCopy, IconCheck,
} from '@tabler/icons-react';
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

const CopyButton: React.FC<{ value: string }> = ({ value }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} style={{
      background: copied ? '#dcfce7' : '#f0f9ff',
      border: `1px solid ${copied ? '#86efac' : '#bae6fd'}`,
      borderRadius: 6, padding: '3px 10px', cursor: 'pointer',
      fontSize: 12, color: copied ? '#16a34a' : '#0284c7',
      display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s',
    }}>
      {copied ? <><IconCheck size={12} /> Đã sao chép</> : <><IconCopy size={12} /> Sao chép</>}
    </button>
  );
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
  const [pollCount, setPollCount] = useState(0);

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
    setPollCount(0);

    countdownRef.current = setInterval(() => setTimeLeft(p => Math.max(0, p - 1000)), 1000);

    pollingRef.current = setInterval(async () => {
      try {
        setPollCount(c => c + 1);
        const pd = await getPaymentByBooking(bookingId);
        if (pd?.status === 'COMPLETED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (countdownRef.current) clearInterval(countdownRef.current);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setPolling(false);
          setBankTransferPaid(true);
          notifications.show({
            title: 'Thanh toán thành công! 🎉',
            message: 'Đặt phòng của bạn đã được xác nhận.',
            color: 'green',
          });
          setTimeout(() => navigate('/bookings'), 3000);
        }
      } catch { /* ignore poll errors */ }
    }, POLLING_INTERVAL);

    timeoutRef.current = setTimeout(() => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setPolling(false);
      setPaymentError('Hết thời gian chờ thanh toán (10 phút). Vui lòng thử lại hoặc liên hệ hỗ trợ.');
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
      setPaymentError(e.response?.data?.message || e.message || 'Lỗi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRetry = () => {
    setBankInfo(null); setPaymentError(null); setTimeLeft(PAYMENT_TIMEOUT); setPollCount(0);
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setPolling(false);
  };

  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const nights = booking ? Math.max(1, Math.ceil((new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) / 86400000)) : 0;
  const hotelImg = booking ? parseImg(booking.room?.hotel?.images) : '';

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, border: '4px solid #e5e7eb', borderTopColor: '#0b63d6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#6b7280', margin: 0 }}>Đang tải thông tin...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
      <div style={{ textAlign: 'center', padding: 32, maxWidth: 400 }}>
        <IconAlertCircle size={64} color="#f59e0b" style={{ marginBottom: 16 }} />
        <h2 style={{ color: '#111827', marginBottom: 8 }}>Có lỗi xảy ra</h2>
        <p style={{ color: '#6b7280', marginBottom: 20 }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ background: '#0b63d6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: 'pointer', fontWeight: 600 }}>
          ← Quay lại
        </button>
      </div>
    </div>
  );

  // ── Success: CASH ──
  if (cashSuccess) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 48, textAlign: 'center', border: '2px solid #6ee7b7', maxWidth: 440, boxShadow: '0 16px 48px rgba(16,185,129,0.15)', width: '90%' }}>
        <div style={{ width: 80, height: 80, background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <IconCircleCheck size={48} color="#10b981" />
        </div>
        <h2 style={{ color: '#065f46', marginBottom: 8, fontSize: 24, fontWeight: 800 }}>Đặt phòng thành công!</h2>
        <p style={{ color: '#6b7280', marginBottom: 20, fontSize: 15, lineHeight: 1.6 }}>
          Vui lòng thanh toán <strong>tiền mặt</strong> khi đến nhận phòng.<br />Chúc bạn có chuyến đi vui vẻ! 🎉
        </p>
        <div style={{ background: '#d1fae5', borderRadius: 10, padding: '10px 20px', display: 'inline-block', color: '#065f46', fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
          ✓ Thanh toán tại nơi nhận phòng
        </div>
        <p style={{ color: '#9ca3af', fontSize: 13 }}>Đang chuyển về trang chuyến đi...</p>
      </div>
    </div>
  );

  // ── Success: BANK_TRANSFER ──
  if (bankTransferPaid) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eff6ff, #f0f9ff)' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 48, textAlign: 'center', border: '2px solid #93c5fd', maxWidth: 440, boxShadow: '0 16px 48px rgba(59,130,246,0.15)', width: '90%' }}>
        <div style={{ width: 80, height: 80, background: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <IconConfetti size={48} color="#3b82f6" />
        </div>
        <h2 style={{ color: '#1e40af', marginBottom: 8, fontSize: 24, fontWeight: 800 }}>Thanh toán thành công! 🎉</h2>
        <p style={{ color: '#6b7280', marginBottom: 8, fontSize: 15 }}>Đặt phòng của bạn đã được xác nhận.</p>
        <p style={{ color: '#9ca3af', fontSize: 13 }}>Đang chuyển về trang chuyến đi...</p>
      </div>
    </div>
  );

  // ── QR Code: BANK_TRANSFER ──
  if (bankInfo) {
    const progressPercent = Math.min(100, ((PAYMENT_TIMEOUT - timeLeft) / PAYMENT_TIMEOUT) * 100);
    const isUrgent = timeLeft < 2 * 60 * 1000;

    return (
      <div style={{ minHeight: '100vh', background: '#f3f6fb' }}>
        {/* Header */}
        <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: 20, color: '#0b63d6' }}>✈ UTravel</span>
          <span style={{ fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}><IconLock size={15} /> Thanh toán bảo mật</span>
        </div>

        <div style={{ maxWidth: 580, margin: '0 auto', padding: '32px 20px' }}>
          <button onClick={handleRetry} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0b63d6', fontWeight: 500, fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconArrowLeft size={16} /> Thay đổi phương thức
          </button>

          <div style={{ background: '#fff', borderRadius: 18, padding: 28, border: '1px solid #e5e7eb', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
            <h2 style={{ fontWeight: 800, fontSize: 22, color: '#111827', marginBottom: 4 }}>Quét mã QR để thanh toán</h2>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>Sử dụng ứng dụng ngân hàng bất kỳ để quét mã</p>

            {/* Countdown */}
            <div style={{ background: isUrgent ? '#fef2f2' : '#fff7ed', border: `1px solid ${isUrgent ? '#fca5a5' : '#fed7aa'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ color: isUrgent ? '#dc2626' : '#ea580c', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconClock size={16} /> Còn lại: {formatTime(timeLeft)}
                </span>
                <span style={{ color: '#9ca3af', fontSize: 12 }}>Mã hết hạn sau 10 phút</span>
              </div>
              <Progress value={progressPercent} color={isUrgent ? 'red' : 'orange'} size="sm" radius="xl" />
            </div>

            {/* QR code */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ border: '3px solid #e5e7eb', borderRadius: 14, padding: 14, background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                <img src={bankInfo.qrCodeUrl} alt="Mã QR" width={220} height={220} style={{ display: 'block', borderRadius: 6 }} />
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
              <span style={{ color: '#9ca3af', fontSize: 13 }}>Hoặc chuyển khoản thủ công</span>
              <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
            </div>

            {/* Bank details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                { label: 'Ngân hàng', value: bankInfo.bankCode },
                { label: 'Số tài khoản', value: bankInfo.accountNumber, bold: true, copy: true },
                { label: 'Chủ tài khoản', value: bankInfo.accountName },
                { label: 'Số tiền', value: formatVND(bankInfo.amount), bold: true, color: '#0b63d6' },
                { label: 'Nội dung CK', value: bankInfo.transferContent, bold: true, color: '#ea580c', copy: true },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderRadius: 9, padding: '10px 14px', border: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontSize: 13 }}>{item.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: item.bold ? 700 : 400, fontSize: 13, color: item.color || '#111827' }}>{item.value}</span>
                    {item.copy && <CopyButton value={item.value} />}
                  </div>
                </div>
              ))}
            </div>

            {/* Info box */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#1e40af', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <IconShieldCheck size={20} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                Nhập <strong>đúng nội dung chuyển khoản</strong> màu cam ở trên để hệ thống tự xác nhận.
                {polling && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: '#6b7280', fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, border: '2px solid #9ca3af', borderTopColor: '#0b63d6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    Đang kiểm tra giao dịch... (lần {pollCount})
                  </span>
                )}
              </div>
            </div>

            {paymentError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginTop: 12, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconAlertCircle size={18} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{paymentError}</span>
                <button onClick={handleRetry} style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconRefresh size={12} /> Thử lại
                </button>
              </div>
            )}
          </div>

          {/* Booking mini summary */}
          {booking && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', padding: '16px 20px', marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              {hotelImg && (
                <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={hotelImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: '0 0 2px' }}>{booking.room?.hotel?.name}</p>
                <p style={{ fontSize: 12, color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><IconCalendarEvent size={12} /> {dayjs(booking.checkInDate).format('DD/MM')} – {dayjs(booking.checkOutDate).format('DD/MM/YYYY')}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><IconBed size={12} /> {booking.room?.type}</span>
                </p>
              </div>
              <p style={{ fontWeight: 800, fontSize: 16, color: '#0b63d6', margin: 0, flexShrink: 0 }}>{formatVND(booking.finalPrice)}</p>
            </div>
          )}
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // ── Main Payment Selection ──
  return (
    <div style={{ minHeight: '100vh', background: '#f3f6fb' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 800, fontSize: 20, color: '#0b63d6' }}>✈ UTravel</span>
        <span style={{ fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 4 }}><IconLock size={15} /> Thanh toán bảo mật</span>
      </div>

      <div style={{ maxWidth: 920, margin: '0 auto', padding: '32px 20px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0b63d6', fontWeight: 500, fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
          <IconArrowLeft size={16} /> Quay lại chi tiết
        </button>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', marginBottom: 28 }}>Hoàn tất đặt phòng</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* ── LEFT: Payment Method ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 20 }}>Chọn phương thức thanh toán</h3>

              {paymentError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconAlertCircle size={16} /> {paymentError}
                </div>
              )}

              {/* CASH */}
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px',
                borderRadius: 12, border: `2px solid ${selectedMethod === 'CASH' ? '#0b63d6' : '#e5e7eb'}`,
                cursor: 'pointer', marginBottom: 12,
                background: selectedMethod === 'CASH' ? '#eff6ff' : '#fff',
                transition: 'all 0.15s',
              }}>
                <div style={{ marginTop: 2 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedMethod === 'CASH' ? '#0b63d6' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedMethod === 'CASH' ? '#0b63d6' : '#fff', transition: 'all 0.15s' }}>
                    {selectedMethod === 'CASH' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </div>
                <input type="radio" name="method" value="CASH" checked={selectedMethod === 'CASH'} onChange={() => setSelectedMethod('CASH')} style={{ display: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <div style={{ width: 44, height: 44, background: selectedMethod === 'CASH' ? '#dbeafe' : '#f3f4f6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 }}>
                    <IconCash size={24} color={selectedMethod === 'CASH' ? '#0b63d6' : '#6b7280'} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: 15 }}>Tiền mặt tại nơi</p>
                    <p style={{ color: '#6b7280', margin: '3px 0 0', fontSize: 13 }}>Đặt phòng ngay, thanh toán tiền mặt khi đến nhận phòng</p>
                  </div>
                </div>
              </label>

              {/* BANK_TRANSFER */}
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px',
                borderRadius: 12, border: `2px solid ${selectedMethod === 'BANK_TRANSFER' ? '#0b63d6' : '#e5e7eb'}`,
                cursor: 'pointer',
                background: selectedMethod === 'BANK_TRANSFER' ? '#eff6ff' : '#fff',
                transition: 'all 0.15s',
              }}>
                <div style={{ marginTop: 2 }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selectedMethod === 'BANK_TRANSFER' ? '#0b63d6' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selectedMethod === 'BANK_TRANSFER' ? '#0b63d6' : '#fff', transition: 'all 0.15s' }}>
                    {selectedMethod === 'BANK_TRANSFER' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </div>
                <input type="radio" name="method" value="BANK_TRANSFER" checked={selectedMethod === 'BANK_TRANSFER'} onChange={() => setSelectedMethod('BANK_TRANSFER')} style={{ display: 'none' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <div style={{ width: 44, height: 44, background: selectedMethod === 'BANK_TRANSFER' ? '#dbeafe' : '#f3f4f6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0 }}>
                    <IconBuildingBank size={24} color={selectedMethod === 'BANK_TRANSFER' ? '#0b63d6' : '#6b7280'} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontWeight: 700, color: '#111827', margin: 0, fontSize: 15 }}>Chuyển khoản ngân hàng</p>
                      <span style={{ background: '#d1fae5', color: '#065f46', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>Được đề xuất</span>
                    </div>
                    <p style={{ color: '#6b7280', margin: '3px 0 0', fontSize: 13 }}>Quét mã QR hoặc chuyển khoản qua SePay</p>
                    {selectedMethod === 'BANK_TRANSFER' && (
                      <p style={{ color: '#2563eb', margin: '6px 0 0', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <IconBulb size={13} /> Nếu hủy sau khi chuyển khoản, tiền sẽ hoàn vào Ví UTravel
                      </p>
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
                  color: '#fff', border: 'none', borderRadius: 12,
                  fontSize: 16, fontWeight: 700, cursor: !selectedMethod || processing ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {processing ? (
                  <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Đang xử lý...</>
                ) : (
                  <><IconLock size={16} /> {selectedMethod === 'CASH' ? 'Xác nhận đặt phòng' : selectedMethod === 'BANK_TRANSFER' ? 'Thanh toán ngay' : 'Chọn phương thức thanh toán'}</>
                )}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <IconLock size={12} /> Giao dịch được mã hóa an toàn
              </p>
            </div>
          </div>

          {/* ── RIGHT: Booking Summary ── */}
          <div style={{ position: 'sticky', top: 20 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 20 }}>Tóm tắt đặt phòng</h3>

              {booking && (
                <>
                  {/* Hotel card */}
                  <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    {hotelImg && (
                      <div style={{ width: 72, height: 60, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                        <img src={hotelImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8, color: '#9ca3af', margin: '0 0 2px', fontWeight: 700 }}>Lưu trú khách sạn</p>
                      <p style={{ fontWeight: 700, color: '#111827', margin: '0 0 3px', fontSize: 14 }}>{booking.room?.hotel?.name || 'Khách sạn'}</p>
                      <p style={{ color: '#6b7280', fontSize: 12, margin: 0, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <IconMapPin size={12} color="#9ca3af" /> {booking.room?.hotel?.city}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Ngày ở</span>
                      <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right' }}>
                        {dayjs(booking.checkInDate).format('DD/MM')} – {dayjs(booking.checkOutDate).format('DD/MM/YYYY')}
                        <span style={{ color: '#9ca3af', fontWeight: 400 }}> ({nights} đêm)</span>
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Loại phòng</span>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{booking.room?.type}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#6b7280' }}>Số khách</span>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{booking.adults || 1} người</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 9 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#374151' }}>{formatVND(booking.room?.price || 0)} × {nights} đêm</span>
                      <span style={{ fontWeight: 500 }}>{formatVND(booking.totalPrice)}</span>
                    </div>
                    {booking.discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: '#16a34a' }}>Giảm giá</span>
                        <span style={{ fontWeight: 600, color: '#16a34a' }}>-{formatVND(booking.discountAmount)}</span>
                      </div>
                    )}
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>Tổng cộng</span>
                      <span style={{ fontWeight: 800, fontSize: 22, color: '#0b63d6' }}>{formatVND(booking.finalPrice)}</span>
                    </div>
                  </div>
                </>
              )}

              <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <IconShieldCheck size={13} /> Bảo mật SSL 256-bit
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#111827', marginTop: 60, padding: '24px', textAlign: 'center' }}>
        <p style={{ fontWeight: 800, fontSize: 18, color: '#fff', margin: '0 0 4px' }}>UTravel</p>
        <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>© 2024 UTravel. Giao dịch được mã hóa bảo mật.</p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

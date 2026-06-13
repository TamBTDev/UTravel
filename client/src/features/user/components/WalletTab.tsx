import { useEffect, useState } from 'react';
import { Badge, Loader } from '@mantine/core';
import { userService } from '../services/userService';

const formatVND = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const TYPE_CONFIG: Record<string, { color: string; label: string; sign: string; emoji: string }> = {
  REFUND:   { color: '#2563eb', label: 'Hoàn tiền',  sign: '+', emoji: '↩' },
  TOPUP:    { color: '#16a34a', label: 'Nạp tiền',   sign: '+', emoji: '↓' },
  WITHDRAW: { color: '#dc2626', label: 'Rút tiền',   sign: '-', emoji: '↑' },
};

export const WalletTab = () => {
  const [walletData, setWalletData] = useState<any>(null);
  const [txData, setTxData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [wallet, tx] = await Promise.all([
        userService.getWallet(),
        userService.getWalletTransactions(1),
      ]);
      setWalletData(wallet);
      setTxData(tx);
      setPage(1);
    } catch (e: any) {
      setError(e.message || 'Không thể tải thông tin ví');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!txData || page >= txData.totalPages) return;
    setLoadingMore(true);
    try {
      const next = await userService.getWalletTransactions(page + 1);
      setTxData((prev: any) => ({ ...next, transactions: [...(prev?.transactions || []), ...(next?.transactions || [])] }));
      setPage(p => p + 1);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
      <Loader color="var(--color-primary)" />
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <p style={{ color: '#dc2626', marginBottom: 16 }}>⚠️ {error}</p>
      <button onClick={load} style={{ background: '#0b63d6', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontWeight: 600 }}>Thử lại</button>
    </div>
  );

  const balance = walletData?.balance ?? 0;
  const transactions: any[] = txData?.transactions ?? [];
  const totalRefund = transactions.filter(t => t.type === 'REFUND').reduce((s, t) => s + t.amount, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Balance card */}
      <div style={{
        background: 'linear-gradient(135deg, #0b63d6 0%, #10b981 100%)',
        borderRadius: 16,
        padding: '28px 28px',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: 20, bottom: -30, width: 80, height: 80, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <p style={{ fontSize: 13, opacity: 0.85, marginBottom: 8 }}>Số dư khả dụng</p>
        <p style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px', letterSpacing: -1 }}>{formatVND(balance)}</p>
        <p style={{ fontSize: 12, opacity: 0.7, margin: 0 }}>Chỉ dùng để nhận hoàn tiền từ đặt phòng đã hủy</p>

        <button onClick={load} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
          ↻ Làm mới
        </button>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
          <p style={{ color: '#9ca3af', fontSize: 12, margin: '0 0 4px' }}>Tổng hoàn tiền</p>
          <p style={{ fontWeight: 700, color: '#2563eb', fontSize: 16, margin: 0 }}>{formatVND(totalRefund)}</p>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px' }}>
          <p style={{ color: '#9ca3af', fontSize: 12, margin: '0 0 4px' }}>Số giao dịch</p>
          <p style={{ fontWeight: 700, color: '#374151', fontSize: 16, margin: 0 }}>{txData?.total ?? 0} giao dịch</p>
        </div>
      </div>

      {/* Transactions */}
      <div>
        <p style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 14 }}>Lịch sử giao dịch</p>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', border: '1px solid #f3f4f6', borderRadius: 12 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
            <p style={{ color: '#6b7280', fontWeight: 500, marginBottom: 6 }}>Chưa có giao dịch nào</p>
            <p style={{ color: '#9ca3af', fontSize: 13, margin: 0 }}>Khi bạn hủy đặt phòng đã thanh toán qua chuyển khoản, tiền hoàn sẽ xuất hiện ở đây.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {transactions.map((tx: any) => {
              const cfg = TYPE_CONFIG[tx.type] || { color: '#6b7280', label: tx.type, sign: '', emoji: '•' };
              return (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f3f4f6', borderRadius: 12, padding: '14px 18px', background: '#fafafa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                      {cfg.emoji}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{cfg.label}</span>
                        <Badge size="xs" style={{ background: `${cfg.color}18`, color: cfg.color, border: 'none' }}>{tx.type}</Badge>
                      </div>
                      {tx.description && <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 2px' }}>{tx.description}</p>}
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                        {new Date(tx.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: tx.type === 'WITHDRAW' ? '#dc2626' : cfg.color }}>
                    {cfg.sign}{formatVND(tx.amount)}
                  </span>
                </div>
              );
            })}

            {txData && page < txData.totalPages && (
              <div style={{ textAlign: 'center', paddingTop: 8 }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '10px 24px', cursor: loadingMore ? 'not-allowed' : 'pointer', fontWeight: 600, color: '#374151' }}
                >
                  {loadingMore ? 'Đang tải...' : 'Xem thêm'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#1e40af' }}>
        ℹ️ Số dư trong ví UTravel hiện chỉ được sử dụng để nhận tiền hoàn từ các đặt phòng đã hủy. Tính năng thanh toán bằng ví sẽ sớm được cập nhật.
      </div>
    </div>
  );
};

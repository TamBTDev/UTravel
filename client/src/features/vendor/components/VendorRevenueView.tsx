import { useState, useEffect } from "react";
import { Loader, Alert, Modal, TextInput, Textarea } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  IconDownload,
  IconAlertCircle,
  IconArrowUpRight,
} from "@tabler/icons-react";
import {
  vendorService,
  VendorRevenueReport,
} from "../../user/services/vendorService";
import { KpiWidgets } from "./revenue/KpiWidgets";
import { RevenueBarChart } from "./revenue/RevenueBarChart";
import { TransactionTable } from "./revenue/TransactionTable";

const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

const WITHDRAW_STATUS: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  PENDING: { label: "Chờ duyệt", bg: "#fef3c7", color: "#d97706" },
  APPROVED: { label: "Đã duyệt", bg: "#d1fae5", color: "#065f46" },
  REJECTED: { label: "Từ chối", bg: "#fee2e2", color: "#991b1b" },
};

export const VendorRevenueView = () => {
  const [report, setReport] = useState<VendorRevenueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);


  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number | string>("");
  const [withdrawNote, setWithdrawNote] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>([]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vendorService.getVendorRevenueReport();
      if (res.success) setReport(res.data);
    } catch (err: any) {
      setError(err.message || "Lỗi khi lấy báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawHistory = async () => {
    try {
      const data = await vendorService.getVendorWithdrawRequests();
      setWithdrawHistory(data || []);
    } catch {}
  };

  useEffect(() => {
    fetchReport();
    fetchWithdrawHistory();
  }, []);

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);
    if (!amount || amount < 100000) {
      notifications.show({
        title: "Không hợp lệ",
        message: "Số tiền rút tối thiểu là 100.000 VNĐ",
        color: "red",
      });
      return;
    }
    if (report && amount > report.walletBalance) {
      notifications.show({
        title: "Lỗi",
        message: "Số dư không đủ",
        color: "red",
      });
      return;
    }

    setWithdrawing(true);
    try {
      await vendorService.createWithdrawRequest(amount, withdrawNote);
      notifications.show({
        title: "Thành công",
        message: "Đã gửi yêu cầu rút tiền",
        color: "green",
      });
      setWithdrawModal(false);
      setWithdrawAmount("");
      setWithdrawNote("");
      fetchWithdrawHistory();
      fetchReport();
    } catch (e: any) {
      notifications.show({
        title: "Lỗi",
        message: e.message || "Có lỗi xảy ra",
        color: "red",
      });
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-xl border border-border-hairline shadow-sm">
        <Loader color="var(--color-primary)" size="md" />
        <p className="text-body text-on-surface-variant font-medium">
          Đang tải báo cáo tài chính...
        </p>
      </div>
    );

  if (error)
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        color="red"
        variant="light"
        className="rounded-lg"
      >
        {error}
      </Alert>
    );

  const filteredTransactions =
    report?.transactions.filter((tx) => {
      const [start, end] = dateRange;
      if (!start && !end) return true;
      const txDate = new Date(tx.createdAt);
      txDate.setHours(0, 0, 0, 0);
      if (start) {
        const s = new Date(start);
        s.setHours(0, 0, 0, 0);
        if (txDate < s) return false;
      }
      if (end) {
        const e = new Date(end);
        e.setHours(23, 59, 59, 999);
        if (txDate > e) return false;
      }
      return true;
    }) || [];

  const totalRevenue = filteredTransactions
    .filter((t) => t.type === "BOOKING_INCOME" || t.type === "CASH_INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBookings =
    filteredTransactions.filter((t) => t.type === "BOOKING_INCOME" || t.type === "CASH_INCOME").length || 0;
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      notifications.show({
        title: "Cảnh báo",
        message: "Không có giao dịch nào để xuất!",
        color: "yellow",
      });
      return;
    }
    const headers = [
      "Mã giao dịch",
      "Mã đơn hàng",
      "Ngày giao dịch",
      "Đối tác / Chỗ nghỉ",
      "Loại giao dịch",
      "Số tiền (VND)",
    ];
    const getTypeName = (type: string) =>
      (
        ({
          BOOKING_INCOME: "Thu nhập đặt phòng",
          CASH_INCOME: "Thu tiền mặt (COD)",
          COMMISSION_FEE: "Phí hoa hồng",
          WITHDRAWAL: "Rút tiền",
          REFUND: "Hoàn tiền cho khách",
        }) as any
      )[type] || type;
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.bookingId ? `UT-${tx.bookingId}` : "N/A",
      tx.createdAt.split("T")[0],
      tx.booking?.room?.hotel?.name || tx.description || "Ví đối tác",
      getTypeName(tx.type),
      tx.amount,
    ]);
    const csvContent =
      "\uFEFF" +
      [
        headers.join(","),
        ...rows.map((r) => r.map((v) => `"${v}"`).join(",")),
      ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `UTravel_BaoCaoDoanhThu_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="w-full sm:w-64">
          <DatePickerInput
            type="range"
            placeholder="Lọc theo khoảng ngày giao dịch"
            value={dateRange}
            onChange={(v) => setDateRange(v as [Date | null, Date | null])}
            clearable
            className="w-full"
          />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setWithdrawModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#0b63d6",
              color: "#fff",
              border: "none",
              borderRadius: 9,
              padding: "9px 18px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            <IconArrowUpRight size={16} /> Yêu cầu rút tiền
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary hover:bg-primary/5 font-bold py-2 px-4 rounded-lg transition-colors text-sm shrink-0"
          >
            <IconDownload size={18} /> Xuất CSV
          </button>
        </div>
      </div>

      <KpiWidgets
        totalRevenue={totalRevenue}
        walletBalance={report?.walletBalance || 0}
        avgBookingValue={avgBookingValue}
      />
      <RevenueBarChart transactions={filteredTransactions} />
      <TransactionTable transactions={filteredTransactions} />

      {/* Withdraw History */}
      {withdrawHistory.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            padding: 20,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <h3
            style={{
              margin: "0 0 16px",
              fontSize: 15,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Lịch sử yêu cầu rút tiền
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {withdrawHistory.map((req) => {
              const st = WITHDRAW_STATUS[req.status] || WITHDRAW_STATUS.PENDING;
              return (
                <div
                  key={req.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#f9fafb",
                    borderRadius: 9,
                    padding: "10px 14px",
                    border: "1px solid #f3f4f6",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: "#0b63d6",
                      }}
                    >
                      {formatVND(req.amount)}
                    </span>
                    {req.note && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: 12,
                          color: "#9ca3af",
                        }}
                      >
                        {req.note}
                      </span>
                    )}
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: 12,
                        color: "#6b7280",
                      }}
                    >
                      {req.bankName} · {req.bankAccount} ·{" "}
                      {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    {req.adminNote && (
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontSize: 12,
                          color: "#dc2626",
                        }}
                      >
                        Ghi chú Admin: {req.adminNote}
                      </p>
                    )}
                  </div>
                  <span
                    style={{
                      background: st.bg,
                      color: st.color,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 20,
                    }}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      <Modal
        opened={withdrawModal}
        onClose={() => setWithdrawModal(false)}
        title={
          <span style={{ fontWeight: 700, fontSize: 16 }}>
            Yêu cầu rút tiền từ ví
          </span>
        }
        radius="lg"
        size="sm"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: "#eff6ff",
              borderRadius: 9,
              padding: "10px 14px",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "#1d4ed8" }}>
              Số dư hiện tại:{" "}
              <strong>{formatVND(report?.walletBalance || 0)}</strong>
            </p>
          </div>
          <TextInput
            type="number"
            label="Số tiền muốn rút (VNĐ)"
            placeholder="Tối thiểu 100.000"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <Textarea
            label="Ghi chú (tuỳ chọn)"
            placeholder="VD: Rút lương tháng 6..."
            value={withdrawNote}
            onChange={(e) => setWithdrawNote(e.target.value)}
            rows={2}
          />
          <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>
            💳 Tiền sẽ chuyển đến tài khoản ngân hàng đã đăng ký. Admin xử lý
            trong 1-2 ngày làm việc.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button
              onClick={() => setWithdrawModal(false)}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Hủy
            </button>
            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                border: "none",
                background: withdrawing ? "#9ca3af" : "#0b63d6",
                color: "#fff",
                cursor: withdrawing ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {withdrawing ? (
                <Loader size={14} color="white" />
              ) : (
                <IconArrowUpRight size={14} />
              )}
              {withdrawing ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

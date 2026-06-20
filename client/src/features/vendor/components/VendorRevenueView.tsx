import { useState, useEffect, useMemo } from "react";
import { Loader, Alert, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import {
  IconDownload,
  IconAlertCircle,
} from "@tabler/icons-react";
import { vendorService, VendorRevenueReport } from "../../user/services/vendorService";
import { KpiWidgets } from "./revenue/KpiWidgets";
import { RevenueBarChart } from "./revenue/RevenueBarChart";
import { TransactionTable } from "./revenue/TransactionTable";

export const VendorRevenueView = () => {
  const [report, setReport] = useState<VendorRevenueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);

  const uniqueHotels = useMemo(() => {
    if (!report) return [];
    const hotelMap = new Map<number, { id: number; name: string }>();
    report.transactions.forEach((tx) => {
      const hotel = tx.booking?.room?.hotel;
      if (hotel) {
        hotelMap.set(hotel.id, { id: hotel.id, name: hotel.name });
      }
    });
    return Array.from(hotelMap.values());
  }, [report]);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await vendorService.getVendorRevenueReport();
        if (res.success) {
          setReport(res.data);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Lỗi khi lấy báo cáo doanh thu");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-xl border border-border-hairline shadow-sm">
        <Loader color="var(--color-primary)" size="md" />
        <p className="text-body text-on-surface-variant font-medium">Đang tải báo cáo tài chính...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" className="rounded-lg">
        {error}
      </Alert>
    );
  }

  // Filter transactions by selected date range and hotel
  const filteredTransactions = report?.transactions.filter((tx) => {
    let matchesDate = true;
    let matchesHotel = true;

    if (selectedHotelId) {
      if (tx.booking?.room?.hotel?.id.toString() !== selectedHotelId) {
        matchesHotel = false;
      }
    }

    const [start, end] = dateRange;
    if (start || end) {
      const txDate = new Date(tx.createdAt);
      txDate.setHours(0, 0, 0, 0);

      if (start) {
        const sDate = new Date(start);
        sDate.setHours(0, 0, 0, 0);
        if (txDate < sDate) matchesDate = false;
      }
      if (end) {
        const eDate = new Date(end);
        eDate.setHours(23, 59, 59, 999);
        if (txDate > eDate) matchesDate = false;
      }
    }
    return matchesDate && matchesHotel;
  }) || [];

  // Calculate stats based on filtered transactions
  const totalRevenue = filteredTransactions
    .filter((t) => t.type === "BOOKING_INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBookings = filteredTransactions.filter((t) => t.type === "BOOKING_INCOME").length || 0;
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Export Filtered Transactions to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert("Không có giao dịch nào để xuất!");
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

    const getTypeName = (type: string) => {
      switch (type) {
        case "BOOKING_INCOME": return "Thu nhập đặt phòng";
        case "COMMISSION_FEE": return "Phí hoa hồng";
        case "WITHDRAWAL": return "Rút tiền";
        case "REFUND": return "Hoàn tiền cho khách";
        default: return type;
      }
    };

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
      [headers.join(","), ...rows.map((row) => row.map((val) => `"${val}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `UTravel_BaoCaoDoanhThu_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Date Filter & Export Row */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-4">
          <Select
            placeholder="Lọc theo khách sạn"
            data={uniqueHotels.map((h) => ({ value: h.id.toString(), label: h.name }))}
            value={selectedHotelId}
            onChange={setSelectedHotelId}
            clearable
            searchable
            className="w-full sm:w-64"
          />
          <DatePickerInput
            type="range"
            placeholder="Lọc theo khoảng ngày giao dịch"
            value={dateRange}
            onChange={(val) => setDateRange(val as [Date | null, Date | null])}
            clearable
            className="w-full sm:w-64"
          />
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary hover:bg-primary/5 font-bold py-2 px-4 rounded-lg transition-colors text-sm shrink-0"
        >
          <IconDownload size={18} />
          Xuất báo cáo CSV
        </button>
      </div>

      {/* KPI Bento Grid */}
      <KpiWidgets
        totalRevenue={totalRevenue}
        walletBalance={report?.walletBalance || 0}
        avgBookingValue={avgBookingValue}
      />

      {/* Monthly Chart */}
      <RevenueBarChart transactions={filteredTransactions} />

      {/* Transaction Table */}
      <TransactionTable transactions={filteredTransactions} />
    </div>
  );
};

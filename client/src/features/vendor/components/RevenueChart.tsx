import { useState, useEffect } from "react";
import { Loader } from "@mantine/core";
import { vendorService, WalletTransaction } from "../../user/services/vendorService";

export const RevenueChart = () => {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await vendorService.getVendorRevenueReport();
        if (res.success) {
          setTransactions(res.data.transactions);
        }
      } catch (err: any) {
        console.error("Error fetching dashboard chart data:", err);
        setError(err.message || "Không thể tải dữ liệu doanh thu");
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatCompact = (val: number) => {
    if (val === 0) return "0đ";
    if (val >= 1000000) return `${(val / 1000000).toFixed(0)}M`;
    return `${(val / 1000).toFixed(0)}K`;
  };

  const months = [
    "Th1",
    "Th2",
    "Th3",
    "Th4",
    "Th5",
    "Th6",
    "Th7",
    "Th8",
    "Th9",
    "Th10",
    "Th11",
    "Th12",
  ];
  const monthlyIncome = Array(12).fill(0);

  transactions.forEach((tx) => {
    if (tx.type === "BOOKING_INCOME") {
      const date = new Date(tx.createdAt);
      const monthIndex = date.getMonth();
      monthlyIncome[monthIndex] += tx.amount;
    }
  });

  const maxVal = Math.max(...monthlyIncome, 1);

  const chartData = monthlyIncome.map((income, index) => ({
    label: months[index],
    value: income,
  }));

  return (
    <div className="bg-white rounded-xl border border-border-hairline shadow-sm p-6 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-title-sm font-semibold text-on-surface">
            Tổng quan doanh thu
          </h2>
          <p className="text-xs text-outline mt-0.5">
            Biểu đồ doanh thu hàng tháng
          </p>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full flex-1 min-h-[260px] bg-surface-container-low rounded-xl border border-dashed border-outline-variant p-4 relative flex flex-col justify-end">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Loader size="sm" color="var(--color-primary)" />
            <span className="text-xs text-outline font-medium">
              Đang tải...
            </span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 text-xs text-red-600 font-medium">
            {error}
          </div>
        ) : (
          /* Active chart area (height: 160px) */
          <div className="relative h-40 w-full mb-6 mt-6">
            {/* Y Axis Guides */}
            <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-[10px] font-extrabold text-outline pointer-events-none z-0">
              <span>{formatCompact(maxVal)}</span>
              <span>{formatCompact(maxVal / 2)}</span>
              <span>0đ</span>
            </div>

            {/* Grid Line Visuals */}
            <div className="absolute left-10 right-2 top-0 bottom-0 flex flex-col justify-between pointer-events-none opacity-20 z-0">
              <div className="border-b border-on-surface-variant w-full"></div>
              <div className="border-b border-on-surface-variant w-full"></div>
              <div className="border-b border-on-surface-variant w-full"></div>
            </div>

            {/* Data Bars */}
            <div className="absolute left-10 right-2 top-0 bottom-0 flex items-end justify-between gap-2 z-10 px-2">
              {chartData.map((data, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative"
                >
                  {/* Tooltip on hover */}
                  {data.value > 0 && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-xs font-bold py-1.5 px-2.5 rounded absolute bottom-[105%] left-1/2 -translate-x-1/2 shadow-lg z-20 pointer-events-none whitespace-nowrap">
                      {formatCurrency(data.value)}
                    </div>
                  )}
                  {data.value > 0 ? (
                    <div
                      className="w-full bg-primary/80 group-hover:bg-primary rounded-t-md transition-all duration-300"
                      style={{ height: `${(data.value / maxVal) * 100}%` }}
                    ></div>
                  ) : (
                    <div className="w-full h-[2px] bg-outline-variant/30 rounded-t-md"></div>
                  )}
                  <span className="absolute -bottom-6 text-[10px] font-bold uppercase tracking-wider text-outline">
                    {data.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import { WalletTransaction } from "../../../user/services/vendorService";

interface RevenueBarChartProps {
  transactions: WalletTransaction[];
}

export const RevenueBarChart = ({ transactions }: RevenueBarChartProps) => {
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

  // Group transactions by month
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
    <div className="bg-white border border-border-hairline rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-on-surface text-base md:text-lg">
            Biểu đồ doanh thu hàng tháng
          </h3>
          <p className="text-xs text-outline mt-0.5">
            Thống kê doanh thu phòng đã nhận
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-outline">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <span>Doanh thu phòng</span>
          </div>
        </div>
      </div>

      {/* Chart container wrapper */}
      <div className="relative w-full pb-8 pt-6">
        {/* Active chart area (height: 176px) */}
        <div className="relative h-44 w-full">
          {/* Y Axis Guide Lines */}
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
          <div className="absolute left-10 right-2 top-0 bottom-0 flex items-end justify-between gap-2 sm:gap-4 px-2 z-10">
            {chartData.map((data, index) => (
              <div
                key={index}
                className="relative flex-1 flex flex-col justify-end h-full group"
              >
                {/* Tooltip on Hover */}
                {data.value > 0 && (
                  <div className="absolute bottom-[105%] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs font-bold px-2.5 py-1.5 rounded shadow-lg pointer-events-none z-20 whitespace-nowrap">
                    {formatCurrency(data.value)}
                  </div>
                )}
                {data.value > 0 ? (
                  <div
                    className="w-full bg-primary rounded-t-sm transition-all duration-300 group-hover:bg-primary-hover"
                    style={{ height: `${(data.value / maxVal) * 100}%` }}
                  ></div>
                ) : (
                  <div className="w-full h-[2px] bg-outline-variant/30 rounded-t-sm"></div>
                )}
                <span className="absolute -bottom-6 w-full text-center text-[10px] font-bold text-outline uppercase">
                  {data.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

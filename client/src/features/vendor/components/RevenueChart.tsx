import { useState } from "react";

export const RevenueChart = () => {
  const [timeframe, setTimeframe] = useState("Tháng này");

  // TODO: add data later
  const chartData = [
    { label: "Th1", height: "h-[30%]" },
    { label: "Th2", height: "h-[45%]" },
    { label: "Th3", height: "h-[35%]" },
    { label: "Th4", height: "h-[65%]" },
    { label: "Th5", height: "h-[50%]" },
    { label: "Th6", height: "h-[85%]" },
    { label: "Th7", height: "h-[70%]" },
    { label: "Th8", height: "h-[90%]" },
    { label: "Th9", height: "h-[60%]" },
    { label: "Th10", height: "h-[95%]" },
    { label: "Th11", height: "h-[80%]" },
    { label: "Th12", height: "h-[100%]" },
  ];

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
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-surface border border-border-hairline text-sm font-medium text-on-surface rounded-lg px-3 py-1.5 focus:border-primary focus:ring-primary focus:ring-1 outline-none"
        >
          <option>Tháng này</option>
          <option>Tháng trước</option>
          <option>Năm nay</option>
        </select>
      </div>

      {/* Chart bars */}
      <div className="w-full flex-1 min-h-[260px] bg-surface-container-low rounded-xl border border-dashed border-outline-variant flex flex-col justify-end p-4 relative overflow-hidden">
        {/* Y Axis Guides */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
          <div className="border-b border-on-surface-variant w-full"></div>
          <div className="border-b border-on-surface-variant w-full"></div>
          <div className="border-b border-on-surface-variant w-full"></div>
          <div className="border-b border-on-surface-variant w-full"></div>
        </div>

        {/* Data Bars */}
        <div className="flex items-end justify-between w-full h-[180px] gap-2 z-10 px-2">
          {chartData.map((data, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
            >
              {/* Tooltip on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-midnight-slate text-white text-[10px] py-1 px-1.5 rounded absolute -translate-y-[120px] shadow-md z-20 pointer-events-none">
                {(index + 1) * 15}M VND
              </div>
              <div
                className={`w-full bg-primary/80 group-hover:bg-primary rounded-t-md transition-all duration-300 ${data.height}`}
              ></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                {data.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

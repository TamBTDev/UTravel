import {
  IconArrowUpRight,
  IconArrowDownRight,
  IconTrendingUp,
  IconReceipt2,
  IconWallet,
  IconCurrencyDong,
} from "@tabler/icons-react";

interface KpiWidgetProps {
  title: string;
  value: string;
  trend?: string;
  trendType?: "up" | "down" | "flat";
  icon: React.ReactNode;
  colorClass: string;
}

const KpiWidget = ({
  title,
  value,
  trend,
  trendType,
  icon,
  colorClass,
}: KpiWidgetProps) => (
  <div className="bg-white border border-border-hairline rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className="flex justify-between items-start mb-4">
      <h3 className="font-semibold text-sm text-outline uppercase tracking-wider">
        {title}
      </h3>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${colorClass}`}
      >
        {icon}
      </div>
    </div>
    <div className="flex items-baseline gap-2 mb-2">
      <span className="text-2xl md:text-3xl font-extrabold text-on-surface">
        {value}
      </span>
    </div>
    {trend && (
      <div className="flex items-center gap-1 text-xs font-semibold">
        {trendType === "up" && (
          <span className="flex items-center gap-0.5 text-green-600">
            <IconArrowUpRight size={14} />
            {trend}
          </span>
        )}
        {trendType === "down" && (
          <span className="flex items-center gap-0.5 text-red-600">
            <IconArrowDownRight size={14} />
            {trend}
          </span>
        )}
        {trendType === "flat" && (
          <span className="flex items-center gap-0.5 text-outline">
            <IconTrendingUp size={14} />
            {trend}
          </span>
        )}
        <span className="text-outline font-normal">so với tháng trước</span>
      </div>
    )}
    <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
  </div>
);

interface KpiWidgetsProps {
  totalRevenue: number;
  walletBalance: number;
  avgBookingValue: number;
}

export const KpiWidgets = ({
  totalRevenue,
  walletBalance,
  avgBookingValue,
}: KpiWidgetsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <KpiWidget
        title="Tổng doanh thu"
        value={formatCurrency(totalRevenue)}
        trend="14.2%"
        trendType="up"
        icon={<IconReceipt2 size={22} />}
        colorClass="bg-primary/10 text-primary"
      />
      <KpiWidget
        title="Số dư ví"
        value={formatCurrency(walletBalance)}
        trend="5.1%"
        trendType="up"
        icon={<IconWallet size={22} />}
        colorClass="bg-green-100 text-green-700"
      />
      <KpiWidget
        title="Giá trị đơn trung bình"
        value={formatCurrency(avgBookingValue)}
        trend="0.0%"
        trendType="flat"
        icon={<IconCurrencyDong size={22} />}
        colorClass="bg-yellow-100 text-yellow-700"
      />
    </div>
  );
};

import { useState, useEffect } from "react";
import { Loader, Alert } from "@mantine/core";
import { IconAlertCircle, IconCoin, IconBuildingStore } from "@tabler/icons-react";
import { adminService, AdminFinanceReport } from "../services/adminService";
import dayjs from "dayjs";

export const AdminFinanceView = () => {
  const [report, setReport] = useState<AdminFinanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminService.getAdminFinanceReport();
        if (res.success) {
          const reportData = res.data;
          if (reportData.transactions) {
            reportData.transactions.sort((a: any, b: any) => b.id - a.id);
          }
          setReport(reportData);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.error || err.message || "Lỗi khi tải báo cáo tài chính sàn");
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
        <p className="text-sm text-on-surface-variant font-medium">Đang tải dữ liệu tài chính...</p>
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

  if (!report) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border-hairline rounded-xl p-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Quản lý Tài chính Sàn</h3>
          <p className="text-sm text-outline mt-0.5 font-medium">Theo dõi doanh thu hoa hồng từ các đối tác trên hệ thống.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Commission KPI */}
        <div className="bg-white border border-border-hairline rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between group shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-on-surface-variant font-semibold text-sm">
              Tổng hoa hồng nhận được
            </span>
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <IconCoin size={20} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-on-surface">
              {report.totalCommission.toLocaleString("vi-VN")} <span className="text-sm font-semibold">VND</span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-green-600">
              <span className="font-bold text-xs">Doanh thu tích lũy toàn sàn</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border-hairline rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border-hairline bg-surface-container-low/30">
          <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">
            Lịch sử nhận hoa hồng
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-border-hairline">
                <th className="p-4 text-xs font-bold text-outline uppercase tracking-wider">Mã GD</th>
                <th className="p-4 text-xs font-bold text-outline uppercase tracking-wider">Đối tác</th>
                <th className="p-4 text-xs font-bold text-outline uppercase tracking-wider">Mã Booking</th>
                <th className="p-4 text-xs font-bold text-outline uppercase tracking-wider">Số tiền</th>
                <th className="p-4 text-xs font-bold text-outline uppercase tracking-wider">Ngày giao dịch</th>
                <th className="p-4 text-xs font-bold text-outline uppercase tracking-wider text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline">
              {report.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-outline font-medium">
                    Chưa có giao dịch hoa hồng nào.
                  </td>
                </tr>
              ) : (
                report.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-on-surface">
                      #{tx.id}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <IconBuildingStore size={16} className="text-primary" />
                        <span className="text-sm font-bold text-on-surface">
                          {tx.wallet?.vendor?.shopName || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-outline font-medium">
                      {tx.booking?.id ? `#${tx.booking.id}` : "-"}
                    </td>
                    <td className="p-4 text-sm font-bold text-green-600">
                      +{tx.amount.toLocaleString("vi-VN")} đ
                    </td>
                    <td className="p-4 text-sm text-outline">
                      {dayjs(tx.createdAt).format("DD/MM/YYYY HH:mm")}
                    </td>
                    <td className="p-4 text-right">
                      {tx.status === "COMPLETED" ? (
                        <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-100 uppercase tracking-wide">
                          Thành công
                        </span>
                      ) : (
                        <span className="bg-yellow-50 text-yellow-700 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-100 uppercase tracking-wide">
                          {tx.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

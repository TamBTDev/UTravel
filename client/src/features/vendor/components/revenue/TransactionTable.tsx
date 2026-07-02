import { useState } from "react";
import { Badge } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { WalletTransaction } from "../../../user/services/vendorService";

interface TransactionTableProps {
  transactions: WalletTransaction[];
}

export const TransactionTable = ({ transactions }: TransactionTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "BOOKING_INCOME":
        return "Tiền phòng nhận";
      case "CASH_INCOME":
        return "Thu tiền mặt (COD)";
      case "COMMISSION_FEE":
        return "Phí hoa hồng";
      case "WITHDRAWAL":
        return "Yêu cầu rút tiền";
      case "REFUND":
        return "Hoàn tiền cho khách";
      case "ADJUSTMENT":
        return "Điều chỉnh số dư";
      default:
        return type;
    }
  };

  const getTransactionTypeBadgeColor = (type: string) => {
    switch (type) {
      case "BOOKING_INCOME":
        return "green";
      case "CASH_INCOME":
        return "teal";
      case "COMMISSION_FEE":
        return "orange";
      case "WITHDRAWAL":
        return "blue";
      case "REFUND":
        return "red";
      default:
        return "gray";
    }
  };

  const removeVietnameseTones = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const filteredTransactions = transactions.filter((tx: WalletTransaction) => {
    const normalizedQuery = removeVietnameseTones(searchQuery.toLowerCase());
    const hotelName = tx.booking?.room?.hotel?.name || "";
    const description = tx.description || "";
    const typeLabel = getTransactionTypeLabel(tx.type);

    const matchesSearch =
      (tx.bookingId && `#UT-${tx.bookingId}`.toLowerCase().includes(normalizedQuery)) ||
      removeVietnameseTones(description.toLowerCase()).includes(normalizedQuery) ||
      removeVietnameseTones(hotelName.toLowerCase()).includes(normalizedQuery) ||
      removeVietnameseTones(typeLabel.toLowerCase()).includes(normalizedQuery);
    return matchesSearch;
  });

  return (
    <div className="bg-white border border-border-hairline rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-border-hairline flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="font-bold text-on-surface text-base md:text-lg">Danh sách giao dịch gần đây</h3>
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm mã đặt phòng hoặc loại giao dịch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-surface-container-low border border-border-hairline rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full sm:w-64 text-sm text-on-surface placeholder:text-outline transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-surface-bright text-outline text-xs font-bold uppercase tracking-wider border-b border-border-hairline">
              <th className="p-4">Mã đơn</th>
              <th className="p-4">Ngày giao dịch</th>
              <th className="p-4">Chỗ nghỉ / Loại</th>
              <th className="p-4">Số tiền</th>
              <th className="p-4 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-hairline text-sm">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-on-surface-variant font-medium">
                  Không có giao dịch nào được ghi nhận.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx: WalletTransaction) => {
                const date = new Date(tx.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr key={tx.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-4 font-bold text-primary">
                      {tx.bookingId ? `#UT-${tx.bookingId}` : "N/A"}
                    </td>
                    <td className="p-4 text-on-surface-variant">{date}</td>
                    <td className="p-4">
                      <p className="font-semibold text-on-surface">
                        {tx.booking?.room?.hotel?.name || "Ví đối tác"}
                      </p>
                      <p className="text-xs text-outline">
                        {getTransactionTypeLabel(tx.type)}
                      </p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-bold ${
                          tx.type === "BOOKING_INCOME" || tx.type === "CASH_INCOME"
                            ? "text-green-600"
                            : tx.type === "COMMISSION_FEE" || tx.type === "WITHDRAWAL" || tx.type === "REFUND"
                            ? "text-red-600"
                            : "text-on-surface"
                        }`}
                      >
                        {tx.type === "BOOKING_INCOME" || tx.type === "CASH_INCOME" ? "+" : "-"}
                        {formatCurrency(Math.abs(tx.amount))}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Badge color={getTransactionTypeBadgeColor(tx.type)} variant="light" size="sm">
                        {getTransactionTypeLabel(tx.type)}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

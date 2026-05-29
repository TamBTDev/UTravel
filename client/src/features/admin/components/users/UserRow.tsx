import { Table, Badge } from "@mantine/core";
import { IconLock, IconLockOpen } from "@tabler/icons-react";
import { AdminUser } from "../../services/adminService";
import dayjs from "dayjs";

interface UserRowProps {
  user: AdminUser;
  onToggleStatus: (userId: number, currentStatus: string) => Promise<void>;
  isProcessing: boolean;
}

export const UserRow = ({ user, onToggleStatus, isProcessing }: UserRowProps) => {
  const isSuspended = user.status === "SUSPENDED";

  return (
    <Table.Tr className="hover:bg-surface-low/30 transition-colors">
      <Table.Td>
        <div>
          <div className="font-bold text-on-surface text-sm">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-xs text-outline font-semibold mt-0.5">{user.email}</div>
        </div>
      </Table.Td>
      <Table.Td className="text-xs font-semibold text-on-surface">
        {user.phone || "Chưa cập nhật"}
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={
            user.role === "ADMIN"
              ? "red"
              : user.role === "VENDOR"
              ? "purple"
              : "blue"
          }
          size="sm"
          radius="sm"
          className="font-bold"
        >
          {user.role === "ADMIN"
            ? "Quản trị"
            : user.role === "VENDOR"
            ? "Đối tác"
            : "Khách hàng"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge
          variant="filled"
          color={isSuspended ? "red" : "green"}
          size="sm"
          radius="sm"
          className="font-bold"
        >
          {isSuspended ? "Bị khóa" : "Hoạt động"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <div className="text-[11px] text-outline font-semibold">
          Đã đặt: <span className="text-on-surface font-bold">{user._count.bookings} phòng</span> •{" "}
          Đánh giá: <span className="text-on-surface font-bold">{user._count.reviews} bình luận</span>
        </div>
      </Table.Td>
      <Table.Td className="text-xs font-semibold text-outline">
        {dayjs(user.createdAt).format("DD/MM/YYYY")}
      </Table.Td>
      <Table.Td className="text-right">
        {user.role !== "ADMIN" && (
          <button
            disabled={isProcessing}
            onClick={() => onToggleStatus(user.id, user.status)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border shadow-sm ${
              isSuspended
                ? "bg-white border-green-600 text-green-600 hover:bg-green-50"
                : "bg-white border-red-600 text-red-600 hover:bg-red-50"
            }`}
          >
            {isSuspended ? <IconLockOpen size={14} /> : <IconLock size={14} />}
            {isSuspended ? "Mở khóa" : "Khóa tài khoản"}
          </button>
        )}
      </Table.Td>
    </Table.Tr>
  );
};

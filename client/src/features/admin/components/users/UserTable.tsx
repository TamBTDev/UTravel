import { Table } from "@mantine/core";
import { AdminUser } from "../../services/adminService";
import { UserRow } from "./UserRow";

interface UserTableProps {
  users: AdminUser[];
  onToggleStatus: (userId: number, currentStatus: string) => Promise<void>;
  onOpenRoleModal: (user: AdminUser) => void;
  actionId: number | null;
}

export const UserTable = ({ users, onToggleStatus, onOpenRoleModal, actionId }: UserTableProps) => {
  return (
    <div className="bg-white border border-border-hairline rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
          <Table.Thead className="bg-surface-container-low border-b border-border-hairline">
            <Table.Tr>
              <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Họ và tên / Email</Table.Th>
              <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Số điện thoại</Table.Th>
              <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Vai trò</Table.Th>
              <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Trạng thái</Table.Th>
              <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Lịch sử hoạt động</Table.Th>
              <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Ngày đăng ký</Table.Th>
              <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider text-right">Thao tác</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onToggleStatus={onToggleStatus}
                onOpenRoleModal={onOpenRoleModal}
                isProcessing={actionId === user.id}
              />
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  );
};

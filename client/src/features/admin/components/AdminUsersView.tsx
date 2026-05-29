import { useState, useEffect } from "react";
import { Loader, Alert } from "@mantine/core";
import { IconAlertCircle, IconUsers } from "@tabler/icons-react";
import { adminService, AdminUser } from "../services/adminService";
import { UserTable } from "./users/UserTable";
import { UserFilters } from "./users/UserFilters";

export const AdminUsersView = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const roleParam = roleFilter === "ALL" ? undefined : roleFilter;
      const statusParam = statusFilter === "ALL" ? undefined : statusFilter;
      const res = await adminService.getAllUsers(undefined, roleParam, statusParam);
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Lỗi khi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "SUSPENDED" ? "VERIFIED" : "SUSPENDED";
    const promptMessage = currentStatus === "SUSPENDED" 
      ? "Bạn có muốn Mở khóa tài khoản này?" 
      : "Bạn có chắc chắn muốn Khóa tài khoản này? Người dùng sẽ không thể đăng nhập.";
      
    if (!window.confirm(promptMessage)) return;

    setActionId(userId);
    try {
      const res = await adminService.updateUserStatus(userId, nextStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
        );
      }
    } catch (err: any) {
      alert(err.message || "Lỗi khi cập nhật trạng thái tài khoản");
    } finally {
      setActionId(null);
    }
  };

  const removeVietnameseTones = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;

    const normalizedQuery = removeVietnameseTones(searchQuery.toLowerCase());
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    const phone = user.phone ? user.phone.toLowerCase() : "";

    return (
      removeVietnameseTones(fullName).includes(normalizedQuery) ||
      removeVietnameseTones(email).includes(normalizedQuery) ||
      phone.includes(normalizedQuery)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white border border-border-hairline rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-bold text-on-surface">Quản lý người dùng</h3>
        <p className="text-sm text-outline mt-0.5 font-medium">Tìm kiếm, lọc danh sách tài khoản và quản lý trạng thái hoạt động của khách hàng, đối tác trên hệ thống.</p>
      </div>

      {/* Search & Filters */}
      <UserFilters
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <Loader color="var(--color-primary)" size="md" />
          <p className="text-sm text-on-surface-variant font-medium mt-3">Đang tải danh sách người dùng...</p>
        </div>
      ) : error ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" className="rounded-lg">
          {error}
        </Alert>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
            <IconUsers size={32} />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">Không tìm thấy tài khoản nào</h3>
          <p className="text-on-surface-variant max-w-sm">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để nhận kết quả chính xác hơn.
          </p>
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onToggleStatus={handleToggleStatus}
          actionId={actionId}
        />
      )}
    </div>
  );
};

import { Select } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

interface UserFiltersProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export const UserFilters = ({
  searchQuery,
  onSearchQueryChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
}: UserFiltersProps) => {
  return (
    <div className="bg-white border border-border-hairline rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Search Input */}
      <div className="relative flex-1 md:max-w-2xl">
        <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm theo tên, email, số điện thoại..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="w-full pl-11 pr-4 py-2 bg-surface-container-low border border-border-hairline rounded-lg text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
        />
      </div>

      {/* Filters Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <Select
          value={roleFilter}
          onChange={(val) => onRoleFilterChange(val || "ALL")}
          data={[
            { value: "ALL", label: "Tất cả vai trò" },
            { value: "USER", label: "Khách hàng" },
            { value: "VENDOR", label: "Đối tác (Vendor)" },
            { value: "ADMIN", label: "Quản trị viên" },
          ]}
          placeholder="Vai trò"
          className="w-full sm:w-48"
          styles={{ input: { fontSize: "13px", fontWeight: 600 } }}
        />

        <Select
          value={statusFilter}
          onChange={(val) => onStatusFilterChange(val || "ALL")}
          data={[
            { value: "ALL", label: "Tất cả trạng thái" },
            { value: "VERIFIED", label: "Hoạt động" },
            { value: "SUSPENDED", label: "Bị khóa" },
          ]}
          placeholder="Trạng thái"
          className="w-full sm:w-48"
          styles={{ input: { fontSize: "13px", fontWeight: 600 } }}
        />
      </div>
    </div>
  );
};

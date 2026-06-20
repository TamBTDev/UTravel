import { Modal, Button, Checkbox, Select, Stack, Group, Text } from "@mantine/core";
import { useState, useEffect } from "react";
import { AdminUser } from "../../services/adminService";

interface RoleConfigModalProps {
  opened: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onSave: (userId: number, role: string, permissions: string[]) => Promise<void>;
}

const AVAILABLE_PERMISSIONS = [
  { id: "APPROVE_VENDOR", label: "Duyệt thông tin Đối tác (Vendor)", desc: "Cho phép duyệt hoặc từ chối đơn đăng ký lên Vendor" },
  { id: "APPROVE_HOTEL", label: "Duyệt sản phẩm (Khách sạn/Phòng)", desc: "Cho phép duyệt khách sạn và phòng mới" },
  { id: "VIEW_FINANCE", label: "Xem báo cáo tài chính", desc: "Xem được doanh thu, hoa hồng của toàn sàn" },
  { id: "MANAGE_USERS", label: "Quản lý Người dùng", desc: "Có quyền xem danh sách và khóa tài khoản" },
];

export const RoleConfigModal = ({ opened, onClose, user, onSave }: RoleConfigModalProps) => {
  const [role, setRole] = useState<string>("USER");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && opened) {
      setRole(user.role);
      setPermissions(user.permissions || []);
    }
  }, [user, opened]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await onSave(user.id, role, role === "MANAGER" ? permissions : []);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (permId: string) => {
    setPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(p => p !== permId) 
        : [...prev, permId]
    );
  };

  if (!user) return null;

  return (
    <Modal opened={opened} onClose={onClose} title={<Text fw={700} size="lg">Cấu hình Quyền & Vai trò</Text>} size="lg" centered>
      <Stack gap="md">
        <div className="bg-surface-low p-4 rounded-lg border border-border-hairline mb-2">
          <Text size="sm" fw={600} className="mb-1">Tài khoản: {user.firstName} {user.lastName}</Text>
          <Text size="xs" color="dimmed">{user.email}</Text>
        </div>

        <Select
          label={<Text fw={600} size="sm" mb={4}>Vai trò (Role)</Text>}
          value={role}
          onChange={(val) => setRole(val || "USER")}
          data={[
            { value: "USER", label: "Khách hàng (USER)" },
            { value: "VENDOR", label: "Đối tác (VENDOR)" },
            { value: "MANAGER", label: "Quản lý (MANAGER)" },
            { value: "ADMIN", label: "Quản trị viên (ADMIN)" },
          ]}
          allowDeselect={false}
        />

        {role === "MANAGER" && (
          <div className="mt-2 border border-border-hairline rounded-lg p-4">
            <Text fw={600} size="sm" mb={12}>Ma trận phân quyền cho Manager</Text>
            <Stack gap="sm">
              {AVAILABLE_PERMISSIONS.map((p) => (
                <Checkbox
                  key={p.id}
                  checked={permissions.includes(p.id)}
                  onChange={() => togglePermission(p.id)}
                  label={
                    <div>
                      <Text fw={600} size="sm">{p.label}</Text>
                      <Text size="xs" color="dimmed">{p.desc}</Text>
                    </div>
                  }
                  color="blue"
                  size="sm"
                />
              ))}
            </Stack>
          </div>
        )}

        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button color="blue" onClick={handleSave} loading={loading}>Lưu cấu hình</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

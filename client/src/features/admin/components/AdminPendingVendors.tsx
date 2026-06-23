import { useState, useEffect } from "react";
import { Loader, Alert, Table, Badge } from "@mantine/core";
import { IconCheck, IconX, IconAlertCircle, IconCertificate } from "@tabler/icons-react";
import { adminService, PendingVendor } from "../services/adminService";
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import dayjs from "dayjs";

export const AdminPendingVendors = () => {
  const [vendors, setVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getPendingVendors();
      if (res.success) {
        setVendors(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.error || err.message || "Lỗi khi tải danh sách đối tác chờ duyệt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleStatusUpdate = (vendorId: number, status: "APPROVED" | "REJECTED") => {
    modals.openConfirmModal({
      title: 'Xác nhận',
      children: `Bạn có chắc chắn muốn ${status === "APPROVED" ? "Phê duyệt" : "Từ chối"} đối tác này?`,
      labels: { confirm: 'Đồng ý', cancel: 'Hủy' },
      confirmProps: { color: status === "APPROVED" ? 'green' : 'red' },
      onConfirm: async () => {
        setActionId(vendorId);
        try {
          const res = await adminService.updateVendorStatus(vendorId, status);
          if (res.success) {
            setVendors((prev) => prev.filter((v) => v.id !== vendorId));
            notifications.show({ title: 'Thành công', message: 'Cập nhật trạng thái thành công', color: 'green' });
          }
        } catch (err: any) {
          notifications.show({ title: 'Lỗi', message: err.message || "Lỗi khi cập nhật trạng thái", color: 'red' });
        } finally {
          setActionId(null);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border-hairline rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-bold text-on-surface">Danh sách đối tác chờ duyệt</h3>
        <p className="text-sm text-outline mt-0.5 font-medium">Xem xét thông tin đăng ký kinh doanh và tài khoản ngân hàng để phê duyệt đối tác mới.</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <Loader color="var(--color-primary)" size="md" />
          <p className="text-sm text-on-surface-variant font-medium mt-3">Đang tải dữ liệu đối tác...</p>
        </div>
      ) : error ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" className="rounded-lg">
          {error}
        </Alert>
      ) : vendors.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
            <IconCertificate size={32} />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">Không có đối tác nào chờ duyệt</h3>
          <p className="text-on-surface-variant max-w-sm">
            Tất cả các đơn đăng ký đối tác đã được xử lý đầy đủ.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border-hairline rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
              <Table.Thead className="bg-surface-container-low border-b border-border-hairline">
                <Table.Tr>
                  <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Tên cửa hàng / Đại diện</Table.Th>
                  <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Giấy phép kinh doanh</Table.Th>
                  <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Mô tả dịch vụ</Table.Th>
                  <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Tài khoản ngân hàng</Table.Th>
                  <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Ngày gửi</Table.Th>
                  <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider text-right">Thao tác</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {vendors.map((vendor) => (
                  <Table.Tr key={vendor.id} className="hover:bg-surface-low/30 transition-colors">
                    <Table.Td>
                      <div>
                        <div className="font-bold text-on-surface text-sm">{vendor.shopName}</div>
                        <div className="text-xs text-outline font-semibold mt-0.5">
                          {vendor.user.firstName} {vendor.user.lastName} • {vendor.user.email}
                        </div>
                        <div className="text-[10px] text-outline font-medium">{vendor.user.phone}</div>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="blue" size="sm" radius="sm" className="font-semibold uppercase">
                        {vendor.businessLicense || "N/A"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <p className="text-xs text-on-surface font-semibold max-w-xs truncate" title={vendor.description || ""}>
                        {vendor.description || "Chưa có mô tả."}
                      </p>
                    </Table.Td>
                    <Table.Td>
                      <div>
                        <div className="text-xs font-bold text-on-surface">{vendor.bankName}</div>
                        <div className="text-[11px] text-outline font-semibold">STK: {vendor.bankAccount}</div>
                        <div className="text-[10px] text-outline font-medium">Chủ TK: {vendor.bankOwner}</div>
                      </div>
                    </Table.Td>
                    <Table.Td className="text-xs font-semibold text-outline">
                      {dayjs(vendor.createdAt).format("DD/MM/YYYY")}
                    </Table.Td>
                    <Table.Td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={actionId === vendor.id}
                          onClick={() => handleStatusUpdate(vendor.id, "APPROVED")}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                          <IconCheck size={14} />
                          Duyệt
                        </button>
                        <button
                          disabled={actionId === vendor.id}
                          onClick={() => handleStatusUpdate(vendor.id, "REJECTED")}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                          <IconX size={14} />
                          Từ chối
                        </button>
                      </div>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

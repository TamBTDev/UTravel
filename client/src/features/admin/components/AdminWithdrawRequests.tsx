import { useState, useEffect } from "react";
import { Loader, Alert, Table, Badge, TextInput, Button } from "@mantine/core";
import { IconCheck, IconX, IconAlertCircle, IconCashBanknote } from "@tabler/icons-react";
import { adminService } from "../services/adminService";
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import dayjs from "dayjs";

const formatVND = (n: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Chờ duyệt", color: "yellow" },
  APPROVED: { label: "Đã duyệt", color: "teal" },
  REJECTED: { label: "Từ chối", color: "red" },
};

export const AdminWithdrawRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // API currently doesn't filter by status tightly, we fetch all or just PENDING
      const res = await adminService.getWithdrawRequests(filterStatus === "ALL" ? undefined : filterStatus);
      if (res.success) {
        setRequests(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Lỗi khi tải danh sách yêu cầu rút tiền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const handleApprove = (id: number) => {
    modals.openConfirmModal({
      title: 'Xác nhận duyệt yêu cầu',
      children: 'Bạn có chắc chắn muốn duyệt yêu cầu này? Đảm bảo bạn đã chuyển khoản thành công trước khi duyệt.',
      labels: { confirm: 'Duyệt', cancel: 'Hủy' },
      confirmProps: { color: 'green' },
      onConfirm: async () => {
        setActionId(id);
        try {
          const res = await adminService.approveWithdrawRequest(id);
          if (res.success) fetchRequests();
          notifications.show({ title: 'Thành công', message: 'Đã duyệt yêu cầu rút tiền', color: 'green' });
        } catch (err: any) {
          notifications.show({ title: 'Lỗi', message: err.message || "Lỗi khi duyệt yêu cầu", color: 'red' });
        } finally {
          setActionId(null);
        }
      }
    });
  };

  const handleReject = (id: number) => {
    modals.open({
      title: 'Từ chối yêu cầu',
      children: (
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const note = formData.get('note') as string;
          if (!note.trim()) return;
          modals.closeAll();
          setActionId(id);
          try {
            const res = await adminService.rejectWithdrawRequest(id, note);
            if (res.success) fetchRequests();
            notifications.show({ title: 'Thành công', message: 'Đã từ chối yêu cầu', color: 'green' });
          } catch (err: any) {
            notifications.show({ title: 'Lỗi', message: err.message || "Lỗi khi từ chối yêu cầu", color: 'red' });
          } finally {
            setActionId(null);
          }
        }}>
          <TextInput name="note" label="Lý do từ chối" placeholder="Nhập lý do..." required data-autofocus />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="default" onClick={() => modals.closeAll()}>Hủy</Button>
            <Button color="red" type="submit">Từ chối</Button>
          </div>
        </form>
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border-hairline rounded-xl p-5 shadow-sm flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Yêu cầu rút tiền</h3>
          <p className="text-sm text-outline mt-0.5 font-medium">Quản lý và xử lý các yêu cầu rút doanh thu của đối tác.</p>
        </div>
        <div className="flex bg-surface-container-low rounded-lg p-1">
          <button
            onClick={() => setFilterStatus("PENDING")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${filterStatus === "PENDING" ? "bg-white shadow-sm text-on-surface" : "text-outline hover:text-on-surface"}`}
          >
            Chờ xử lý
          </button>
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${filterStatus === "ALL" ? "bg-white shadow-sm text-on-surface" : "text-outline hover:text-on-surface"}`}
          >
            Tất cả
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <Loader color="var(--color-primary)" size="md" />
          <p className="text-sm text-on-surface-variant font-medium mt-3">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" className="rounded-lg">
          {error}
        </Alert>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
            <IconCashBanknote size={32} />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">Không có yêu cầu rút tiền nào</h3>
          <p className="text-on-surface-variant max-w-sm">
            Hiện tại không có yêu cầu rút tiền nào đang chờ xử lý.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-border-hairline rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table highlightOnHover verticalSpacing="md" horizontalSpacing="md">
              <Table.Thead className="bg-surface-container-low border-b border-border-hairline">
                <Table.Tr>
                  <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Đối tác</Table.Th>
                  <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Số tiền</Table.Th>
                  <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Ngân hàng nhận</Table.Th>
                  <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Ghi chú / Admin</Table.Th>
                  <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider">Trạng thái</Table.Th>
                  <Table.Th className="text-xs font-bold text-outline uppercase tracking-wider text-right">Thao tác</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {requests.map((req) => (
                  <Table.Tr key={req.id} className="hover:bg-surface-low/30 transition-colors">
                    <Table.Td>
                      <div>
                        <div className="font-bold text-on-surface text-sm">{req.vendor?.shopName || `Vendor #${req.vendorId}`}</div>
                        <div className="text-xs text-outline font-semibold mt-0.5">
                          Yêu cầu: {dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}
                        </div>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <span className="font-bold text-on-surface text-sm text-blue-600">{formatVND(req.amount)}</span>
                    </Table.Td>
                    <Table.Td>
                      <div>
                        <div className="text-xs font-bold text-on-surface">{req.bankName}</div>
                        <div className="text-[11px] text-outline font-semibold">STK: {req.bankAccount}</div>
                        <div className="text-[10px] text-outline font-medium">Chủ TK: {req.bankOwner}</div>
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <div className="text-xs max-w-[200px]">
                        {req.note && <div className="text-gray-600 mb-1"><strong>Vendor:</strong> {req.note}</div>}
                        {req.adminNote && <div className="text-red-600"><strong>Admin:</strong> {req.adminNote}</div>}
                        {!req.note && !req.adminNote && <span className="text-gray-400 italic">Không có</span>}
                      </div>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={STATUS_MAP[req.status]?.color || "gray"} size="sm" radius="sm" className="font-semibold uppercase">
                        {STATUS_MAP[req.status]?.label || req.status}
                      </Badge>
                      {req.processedAt && (
                        <div className="text-[10px] text-outline font-medium mt-1">
                          {dayjs(req.processedAt).format("DD/MM HH:mm")}
                        </div>
                      )}
                    </Table.Td>
                    <Table.Td className="text-right">
                      {req.status === "PENDING" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={actionId === req.id}
                            onClick={() => handleApprove(req.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                          >
                            <IconCheck size={14} />
                            Duyệt
                          </button>
                          <button
                            disabled={actionId === req.id}
                            onClick={() => handleReject(req.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50"
                          >
                            <IconX size={14} />
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">Đã xử lý</span>
                      )}
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

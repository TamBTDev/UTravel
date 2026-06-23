import React, { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { modals } from '@mantine/modals';
import dayjs from "dayjs";
import { vendorService } from "../../user/services/vendorService";
import { Plus, Tag, Calendar, Edit, Trash2 } from "lucide-react";

export const VendorPromotionsView: React.FC = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderValue: "0",
    maxDiscount: "",
    usageLimit: "",
    startDate: dayjs().format("YYYY-MM-DD"),
    endDate: dayjs().add(30, "day").format("YYYY-MM-DD"),
    isActive: true,
  });

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await vendorService.getVendorPromotions();
      if (res.success) setPromotions(res.data);
    } catch (error: any) {
      notifications.show({ message: error.message || "Lỗi khi tải danh sách khuyến mãi", color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleOpenModal = (promo: any = null) => {
    if (promo) {
      setEditingPromo(promo);
      setFormData({
        code: promo.code,
        name: promo.name,
        description: promo.description || "",
        discountType: promo.discountType,
        discountValue: promo.discountValue.toString(),
        minOrderValue: promo.minOrderValue.toString(),
        maxDiscount: promo.maxDiscount ? promo.maxDiscount.toString() : "",
        usageLimit: promo.usageLimit ? promo.usageLimit.toString() : "",
        startDate: dayjs(promo.startDate).format("YYYY-MM-DD"),
        endDate: dayjs(promo.endDate).format("YYYY-MM-DD"),
        isActive: promo.isActive,
      });
    } else {
      setEditingPromo(null);
      setFormData({
        code: "",
        name: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minOrderValue: "0",
        maxDiscount: "",
        usageLimit: "",
        startDate: dayjs().format("YYYY-MM-DD"),
        endDate: dayjs().add(30, "day").format("YYYY-MM-DD"),
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPromo) {
        await vendorService.updateVendorPromotion(editingPromo.id, formData);
        notifications.show({ message: "Cập nhật khuyến mãi thành công", color: "green" });
      } else {
        await vendorService.createVendorPromotion(formData);
        notifications.show({ message: "Tạo khuyến mãi thành công", color: "green" });
      }
      setShowModal(false);
      fetchPromotions();
    } catch (error: any) {
      notifications.show({ message: error.message || "Có lỗi xảy ra", color: "red" });
    }
  };

  const handleDelete = (id: number) => {
    modals.openConfirmModal({
      title: 'Xác nhận xóa',
      children: 'Bạn có chắc muốn xóa mã khuyến mãi này?',
      labels: { confirm: 'Xóa', cancel: 'Hủy' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await vendorService.deleteVendorPromotion(id);
          notifications.show({ message: "Xóa khuyến mãi thành công", color: "green" });
          fetchPromotions();
        } catch (error: any) {
          notifications.show({ message: error.message || "Có lỗi xảy ra", color: "red" });
        }
      }
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-emerald-600" /> Quản lý Khuyến mãi
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Tạo và quản lý các mã giảm giá cho khách sạn của bạn
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Tạo mã mới
        </button>
      </div>

      {promotions.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Chưa có khuyến mãi nào</h3>
          <p className="text-gray-500 mt-2 mb-6">Bạn chưa tạo mã giảm giá nào cho khách hàng.</p>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-2 bg-emerald-50 text-emerald-600 font-medium rounded-xl hover:bg-emerald-100 transition-colors"
          >
            Tạo mã đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative overflow-hidden">
              {!promo.isActive && (
                <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Đã tắt
                </div>
              )}
              {new Date(promo.endDate) < new Date() && promo.isActive && (
                <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Hết hạn
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-200 border-dashed rounded-lg text-emerald-700 font-bold tracking-wider mb-2">
                    {promo.code}
                  </div>
                  <h3 className="font-semibold text-gray-900">{promo.name}</h3>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p className="flex justify-between">
                  <span>Giảm giá:</span>
                  <span className="font-medium text-emerald-600">
                    {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString()}đ`}
                  </span>
                </p>
                {promo.maxDiscount && (
                  <p className="flex justify-between">
                    <span>Giảm tối đa:</span>
                    <span className="font-medium text-gray-900">{promo.maxDiscount.toLocaleString()}đ</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span>Đơn tối thiểu:</span>
                  <span className="font-medium text-gray-900">{promo.minOrderValue.toLocaleString()}đ</span>
                </p>
                <p className="flex justify-between">
                  <span>Thời hạn:</span>
                  <span className="font-medium text-gray-900">
                    {dayjs(promo.startDate).format('DD/MM')} - {dayjs(promo.endDate).format('DD/MM/YYYY')}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Đã dùng:</span>
                  <span className="font-medium text-gray-900">
                    {promo.usedCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : ''}
                  </span>
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleOpenModal(promo)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <Edit className="w-4 h-4" /> Sửa
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingPromo ? "Cập nhật mã khuyến mãi" : "Tạo mã khuyến mãi mới"}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá (Code) *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase"
                    placeholder="VD: SUMMER2026"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương trình *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="VD: Chào hè sôi động"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loại giảm giá *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="percentage">Theo phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá trị giảm *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder={formData.discountType === 'percentage' ? 'VD: 10' : 'VD: 100000'}
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    disabled={formData.discountType === 'fixed'}
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="Không giới hạn"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc *</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới hạn số lượt dùng</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Không giới hạn"
                  />
                </div>

                <div className="col-span-2 md:col-span-1 flex items-center mt-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-gray-700 font-medium">Kích hoạt mã này</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  {editingPromo ? "Lưu thay đổi" : "Tạo mã khuyến mãi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

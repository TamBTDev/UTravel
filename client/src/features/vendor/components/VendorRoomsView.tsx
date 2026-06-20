import { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import {
  Button,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Loader,
  Card,
  Image,
  Text,
  Group,
  ActionIcon,
  Menu,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconArrowLeft,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import {
  vendorService,
  VendorRoom,
  VendorHotel,
} from "../../user/services/vendorService";

interface VendorRoomsViewProps {
  hotel: VendorHotel;
  onBack: () => void;
}

export const VendorRoomsView = ({ hotel, onBack }: VendorRoomsViewProps) => {
  const [rooms, setRooms] = useState<VendorRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRoom, setEditingRoom] = useState<VendorRoom | null>(null);

  const form = useForm({
    initialValues: {
      roomNumber: "",
      type: "Standard",
      price: 0,
      capacity: 2,
      description: "",
      images: "",
      amenities: "",
    },
    validate: {
      roomNumber: (val) => (!val ? "Vui lòng nhập số/tên phòng" : null),
      type: (val) => (!val ? "Vui lòng nhập loại phòng" : null),
      price: (val) => (val <= 0 ? "Giá phải lớn hơn 0" : null),
      capacity: (val) => (val < 1 ? "Sức chứa tối thiểu 1" : null),
    },
  });

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await vendorService.getVendorHotelRooms(hotel.id);
      if (res.success) {
        setRooms(res.data);
      }
    } catch (err: any) {
      notifications.show({
        title: "Lỗi tải dữ liệu",
        message: err.message || "Không thể lấy danh sách phòng",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [hotel.id]);

  const handleSubmit = async (values: typeof form.values) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        images: values.images
          ? values.images.split(",").map((i) => i.trim())
          : [],
        amenities: values.amenities
          ? values.amenities.split(",").map((i) => i.trim())
          : [],
      };

      if (editingRoom) {
        const res = await vendorService.updateVendorHotelRoom(
          hotel.id,
          editingRoom.id,
          payload,
        );
        if (res.success) {
          notifications.show({
            title: "Thành công",
            message: "Đã cập nhật phòng",
            color: "green",
          });
        }
      } else {
        const res = await vendorService.createVendorHotelRoom(
          hotel.id,
          payload,
        );
        if (res.success) {
          notifications.show({
            title: "Thành công",
            message: "Đã thêm phòng mới",
            color: "green",
          });
        }
      }

      setModalOpened(false);
      setEditingRoom(null);
      form.reset();
      fetchRooms();
    } catch (err: any) {
      notifications.show({
        title: "Lỗi",
        message: err.message || "Không thể lưu thông tin phòng",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRoom = (room: VendorRoom) => {
    setEditingRoom(room);

    let imagesStr = "";
    let amenitiesStr = "";
    try {
      imagesStr = room.images ? JSON.parse(room.images).join(", ") : "";
    } catch (e) {}
    try {
      amenitiesStr = room.amenities
        ? JSON.parse(room.amenities).join(", ")
        : "";
    } catch (e) {}

    form.setValues({
      roomNumber: room.roomNumber,
      type: room.type,
      price: room.price,
      capacity: room.capacity,
      description: room.description || "",
      images: imagesStr,
      amenities: amenitiesStr,
    });
    setModalOpened(true);
  };

  const handleDeleteRoom = async (room: VendorRoom) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa phòng ${room.roomNumber} (${room.type})?`,
      )
    )
      return;

    try {
      const res = await vendorService.deleteVendorHotelRoom(hotel.id, room.id);
      if (res.success) {
        notifications.show({
          title: "Thành công",
          message: "Đã xóa phòng",
          color: "green",
        });
        setRooms((prev) => prev.filter((r) => r.id !== room.id));
      }
    } catch (err: any) {
      notifications.show({
        title: "Lỗi",
        message: err.message || "Không thể xóa phòng",
        color: "red",
      });
    }
  };

  const getFirstImage = (imagesStr: string | null) => {
    if (!imagesStr)
      return "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";
    try {
      const parsed = JSON.parse(imagesStr);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch (e) {}
    return "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-border-hairline shadow-sm">
        <div className="flex items-center gap-4">
          <ActionIcon
            variant="subtle"
            onClick={onBack}
            size="lg"
            className="text-on-surface-variant hover:text-primary"
          >
            <IconArrowLeft size={24} />
          </ActionIcon>
          <div>
            <h2 className="text-lg font-bold text-on-surface">
              Quản lý phòng: {hotel.name}
            </h2>
            <p className="text-sm text-outline mt-0.5 line-clamp-1">
              {hotel.location}, {hotel.city}
            </p>
          </div>
        </div>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => {
            setEditingRoom(null);
            form.reset();
            setModalOpened(true);
          }}
          className="bg-primary hover:bg-primary-hover"
        >
          Thêm phòng mới
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-border-hairline">
          <Loader color="var(--color-primary)" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-border-hairline text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mb-4">
            <IconPlus size={32} />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">
            Khách sạn này chưa có phòng nào
          </h3>
          <p className="text-on-surface-variant max-w-sm mb-6">
            Hãy thêm các hạng phòng để khách hàng có thể đặt chỗ nghỉ của bạn.
          </p>
          <Button
            onClick={() => setModalOpened(true)}
            variant="outline"
            className="border-primary text-primary"
          >
            Thêm phòng ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card
              key={room.id}
              padding="lg"
              radius="md"
              withBorder
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <Card.Section className="relative">
                <Image
                  src={getFirstImage(room.images)}
                  fallbackSrc="https://placehold.co/600x400?text=No+Image"
                  alt={room.type}
                  className="w-full h-[200px] object-cover"
                />
                <div className="absolute top-3 right-3">
                  <Badge color={room.isAvailable ? "green" : "gray"}>
                    {room.isAvailable ? "Sẵn sàng" : "Đang đóng"}
                  </Badge>
                </div>
              </Card.Section>

              <Group justify="space-between" mt="md" mb="xs">
                <div>
                  <Text fw={700} className="text-lg" title={room.type}>
                    {room.type}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Phòng số: {room.roomNumber}
                  </Text>
                </div>
                <Menu withinPortal position="bottom-end" shadow="sm">
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEdit size={14} />}
                      onClick={() => handleEditRoom(room)}
                    >
                      Chỉnh sửa
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => handleDeleteRoom(room)}
                    >
                      Xóa phòng
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>

              <div className="flex items-center gap-1 mb-4 mt-2 text-on-surface-variant text-sm">
                <IconUsers size={16} /> Tối đa {room.capacity} khách
              </div>

              <div className="flex gap-4 border-t border-border-hairline pt-4 mt-auto">
                <div className="w-full">
                  <Text size="xs" c="dimmed">
                    Giá mỗi đêm
                  </Text>
                  <Text fw={700} className="text-primary text-lg">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(room.price)}
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingRoom(null);
          form.reset();
        }}
        title={
          <Text fw={700} size="lg">
            {editingRoom ? "Chỉnh sửa phòng" : "Thêm hạng phòng mới"}
          </Text>
        }
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Tên/Số phòng"
              placeholder="VD: P101, Standard..."
              required
              {...form.getInputProps("roomNumber")}
            />
            <TextInput
              label="Loại phòng"
              placeholder="VD: Standard, Deluxe, Suite..."
              required
              {...form.getInputProps("type")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Giá mỗi đêm (VNĐ)"
              placeholder="VD: 500000"
              min={0}
              required
              {...form.getInputProps("price")}
            />
            <NumberInput
              label="Sức chứa (Người lớn)"
              placeholder="VD: 2"
              min={1}
              required
              {...form.getInputProps("capacity")}
            />
          </div>
          <Textarea
            label="Mô tả"
            placeholder="Mô tả ngắn gọn về phòng..."
            minRows={3}
            {...form.getInputProps("description")}
          />
          <TextInput
            label="Hình ảnh (URLs)"
            placeholder="Nhập các đường link ảnh, phân cách bằng dấu phẩy"
            {...form.getInputProps("images")}
          />
          <TextInput
            label="Tiện ích"
            placeholder="Wifi, Ban công, Tivi (phân cách bằng dấu phẩy)"
            {...form.getInputProps("amenities")}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="default" onClick={() => setModalOpened(false)}>
              Hủy
            </Button>
            <Button
              type="submit"
              loading={submitting}
              className="bg-primary hover:bg-primary-hover"
            >
              Lưu phòng
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

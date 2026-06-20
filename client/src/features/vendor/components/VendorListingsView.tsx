import { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import {
  Button,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Loader,
  Badge,
  Card,
  Image,
  Text,
  Group,
  ActionIcon,
  Menu,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconMapPin,
  IconStar,
  IconDotsVertical,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import { vendorService, VendorHotel } from "../../user/services/vendorService";

interface VendorListingsViewProps {
  onSelectHotel?: (hotel: VendorHotel) => void;
}

export const VendorListingsView = ({
  onSelectHotel,
}: VendorListingsViewProps) => {
  const [hotels, setHotels] = useState<VendorHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingHotel, setEditingHotel] = useState<VendorHotel | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      stars: 3,
      images: "",
      amenities: "",
    },
    validate: {
      name: (val) => (val.length < 3 ? "Tên phải từ 3 ký tự" : null),
      address: (val) => (!val ? "Vui lòng nhập địa chỉ" : null),
      city: (val) => (!val ? "Vui lòng nhập thành phố" : null),
      stars: (val) => (val < 1 || val > 5 ? "Số sao từ 1 đến 5" : null),
    },
  });

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await vendorService.getVendorHotels();
      if (res.success) {
        setHotels(res.data);
      }
    } catch (err: any) {
      notifications.show({
        title: "Lỗi tải dữ liệu",
        message: err.message || "Không thể lấy danh sách khách sạn",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

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

      if (editingHotel) {
        const res = await vendorService.updateVendorHotel(
          editingHotel.id,
          payload,
        );
        if (res.success) {
          notifications.show({
            title: "Thành công",
            message: "Đã cập nhật khách sạn",
            color: "green",
          });
        }
      } else {
        const res = await vendorService.createVendorHotel(payload);
        if (res.success) {
          notifications.show({
            title: "Thành công",
            message: "Đã thêm khách sạn mới. Vui lòng chờ duyệt.",
            color: "green",
          });
        }
      }

      setModalOpened(false);
      setEditingHotel(null);
      form.reset();
      fetchHotels();
    } catch (err: any) {
      notifications.show({
        title: "Lỗi",
        message: err.message || "Không thể lưu thông tin khách sạn",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditHotel = (hotel: VendorHotel) => {
    setEditingHotel(hotel);

    let imagesStr = "";
    let amenitiesStr = "";
    try {
      imagesStr = hotel.images ? JSON.parse(hotel.images).join(", ") : "";
    } catch (e) {}
    try {
      amenitiesStr = hotel.amenities
        ? JSON.parse(hotel.amenities).join(", ")
        : "";
    } catch (e) {}

    form.setValues({
      name: hotel.name,
      description: hotel.description || "",
      address: hotel.location,
      city: hotel.city,
      stars: hotel.rating || 3, // Assuming rating maps to stars initially
      images: imagesStr,
      amenities: amenitiesStr,
    });
    setModalOpened(true);
  };

  const handleDeleteHotel = async (hotel: VendorHotel) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa khách sạn ${hotel.name}? Mọi dữ liệu liên quan cũng sẽ bị xóa.`,
      )
    )
      return;

    try {
      const res = await vendorService.deleteVendorHotel(hotel.id);
      if (res.success) {
        notifications.show({
          title: "Thành công",
          message: "Đã xóa khách sạn",
          color: "green",
        });
        setHotels((prev) => prev.filter((h) => h.id !== hotel.id));
      }
    } catch (err: any) {
      notifications.show({
        title: "Lỗi",
        message: err.message || "Không thể xóa khách sạn",
        color: "red",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge color="green">Đang hoạt động</Badge>;
      case "PENDING":
        return <Badge color="orange">Đang chờ duyệt</Badge>;
      case "REJECTED":
        return <Badge color="red">Bị từ chối</Badge>;
      case "DRAFT":
        return <Badge color="gray">Bản nháp</Badge>;
      default:
        return <Badge color="gray">{status}</Badge>;
    }
  };

  const getFirstImage = (imagesStr: string) => {
    try {
      const parsed = JSON.parse(imagesStr);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
    } catch (e) {}
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-border-hairline shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-on-surface">
            Danh sách khách sạn
          </h2>
          <p className="text-sm text-outline mt-0.5">
            Quản lý các khách sạn, homestay, resort của bạn
          </p>
        </div>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={() => {
            setEditingHotel(null);
            form.reset();
            setModalOpened(true);
          }}
          className="bg-primary hover:bg-primary-hover"
        >
          Thêm khách sạn mới
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-border-hairline">
          <Loader color="var(--color-primary)" />
        </div>
      ) : hotels.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-border-hairline text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline mb-4">
            <IconPlus size={32} />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-2">
            Bạn chưa có khách sạn nào
          </h3>
          <p className="text-on-surface-variant max-w-sm mb-6">
            Hãy đăng tin khách sạn đầu tiên của bạn để bắt đầu đón khách trên
            UTravel.
          </p>
          <Button
            onClick={() => setModalOpened(true)}
            variant="outline"
            className="border-primary text-primary"
          >
            Đăng khách sạn ngay
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Card
              key={hotel.id}
              padding="lg"
              radius="md"
              withBorder
              className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectHotel?.(hotel)}
            >
              <Card.Section className="relative">
                <Image
                  src={getFirstImage(hotel.images)}
                  fallbackSrc="https://placehold.co/600x400?text=No+Image"
                  alt={hotel.name}
                  className="w-full h-[200px] object-cover"
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(hotel.approvalStatus)}
                </div>
              </Card.Section>

              <Group justify="space-between" mt="md" mb="xs">
                <Text
                  fw={700}
                  className="text-lg truncate max-w-[200px]"
                  title={hotel.name}
                >
                  {hotel.name}
                </Text>
                <Menu withinPortal position="bottom-end" shadow="sm">
                  <Menu.Target>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<IconEdit size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditHotel(hotel);
                      }}
                    >
                      Chỉnh sửa
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteHotel(hotel);
                      }}
                    >
                      Xóa khách sạn
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>

              <Text
                size="sm"
                c="dimmed"
                className="flex items-center gap-1 mb-2 line-clamp-1"
              >
                <IconMapPin size={14} /> {hotel.location}, {hotel.city}
              </Text>

              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={i}
                    size={14}
                    className={
                      i < hotel.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>

              <div className="flex gap-4 border-t border-border-hairline pt-4 mt-auto">
                <div className="text-center flex-1">
                  <Text fw={700} className="text-primary">
                    {hotel._count.rooms}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Phòng
                  </Text>
                </div>
                <div className="text-center flex-1 border-l border-border-hairline">
                  <Text fw={700} className="text-primary">
                    {hotel._count.reviews}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Đánh giá
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
          setEditingHotel(null);
          form.reset();
        }}
        title={
          <Text fw={700} size="lg">
            {editingHotel ? "Chỉnh sửa khách sạn" : "Thêm khách sạn mới"}
          </Text>
        }
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)} className="space-y-4">
          <TextInput
            label="Tên khách sạn"
            placeholder="Ví dụ: UTravel Resort & Spa"
            required
            {...form.getInputProps("name")}
          />
          <Textarea
            label="Mô tả"
            placeholder="Mô tả ngắn gọn về khách sạn..."
            minRows={3}
            {...form.getInputProps("description")}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="Địa chỉ"
              placeholder="Số nhà, tên đường..."
              required
              {...form.getInputProps("address")}
            />
            <TextInput
              label="Thành phố"
              placeholder="Ví dụ: Đà Nẵng"
              required
              {...form.getInputProps("city")}
            />
          </div>
          <NumberInput
            label="Tiêu chuẩn sao"
            min={1}
            max={5}
            required
            {...form.getInputProps("stars")}
          />
          <TextInput
            label="Hình ảnh (URLs)"
            placeholder="Nhập các đường link ảnh, phân cách bằng dấu phẩy"
            {...form.getInputProps("images")}
          />
          <TextInput
            label="Tiện ích"
            placeholder="Wifi, Hồ bơi, Spa (phân cách bằng dấu phẩy)"
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
              Lưu & Gửi duyệt
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Grid, TextInput, NumberInput, Button, Paper } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconMapPin, IconCalendarEvent, IconUsers } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useNavigate, useSearchParams } from "react-router-dom";

export const QuickSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Khởi tạo state từ searchParams
  const [destination, setDestination] = useState(
    searchParams.get("city") || searchParams.get("search") || "",
  );

  const checkInParam = searchParams.get("checkIn");
  const checkOutParam = searchParams.get("checkOut");
  const [dates, setDates] = useState<[Date | null, Date | null]>([
    checkInParam ? new Date(checkInParam) : null,
    checkOutParam ? new Date(checkOutParam) : null,
  ]);

  const capacityParam = searchParams.get("capacity");
  const [capacity, setCapacity] = useState<number | "">(
    capacityParam ? Number(capacityParam) : 1,
  );

  // Cập nhật state nếu URL thay đổi (trường hợp user ấn nút back/forward)
  useEffect(() => {
    setDestination(
      searchParams.get("city") || searchParams.get("search") || "",
    );
    const inDate = searchParams.get("checkIn");
    const outDate = searchParams.get("checkOut");
    setDates([
      inDate ? new Date(inDate) : null,
      outDate ? new Date(outDate) : null,
    ]);
    const cap = searchParams.get("capacity");
    setCapacity(cap ? Number(cap) : 1);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams); // Giữ lại các filter khác như giá, rating

    if (destination.trim()) {
      params.set("city", destination.trim());
      params.delete("search"); // Ưu tiên city khi dùng QuickSearch
    } else {
      params.delete("city");
      params.delete("search");
    }

    if (dates[0]) {
      params.set("checkIn", dayjs(dates[0]).format("YYYY-MM-DD"));
    } else {
      params.delete("checkIn");
    }

    if (dates[1]) {
      params.set("checkOut", dayjs(dates[1]).format("YYYY-MM-DD"));
    } else {
      params.delete("checkOut");
    }

    if (capacity) {
      params.set("capacity", capacity.toString());
    } else {
      params.delete("capacity");
    }

    params.set("page", "1");

    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <Paper
      shadow="lg"
      radius="lg"
      p="md"
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: "white",
        textAlign: "left",
        width: "100%",
      }}
    >
      <form onSubmit={handleSubmit}>
        <Grid align="flex-end">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Điểm đến"
              placeholder="Thành phố, khách sạn..."
              value={destination}
              onChange={(e) => setDestination(e.currentTarget.value)}
              leftSection={<IconMapPin size={18} stroke={1.5} />}
              size="md"
              radius="md"
              styles={{ label: { color: "black", marginBottom: "4px" } }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <DatePickerInput
              type="range"
              label="Nhận phòng - Trả phòng"
              placeholder="Chọn ngày"
              value={dates}
              onChange={(val) => setDates(val as [Date | null, Date | null])}
              leftSection={<IconCalendarEvent size={18} stroke={1.5} />}
              size="md"
              radius="md"
              minDate={new Date()}
              styles={{ label: { color: "black", marginBottom: "4px" } }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 2 }}>
            <NumberInput
              label="Số người"
              placeholder="Khách"
              value={capacity}
              onChange={(val) => setCapacity(val === "" ? "" : Number(val))}
              min={1}
              max={20}
              leftSection={<IconUsers size={18} stroke={1.5} />}
              size="md"
              radius="md"
              styles={{ label: { color: "black", marginBottom: "4px" } }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 2 }}>
            <Button
              type="submit"
              size="md"
              color="violet"
              fullWidth
              radius="md"
            >
              Tìm kiếm
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </Paper>
  );
};

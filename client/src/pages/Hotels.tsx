import { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Group,
  Button,
  Image,
  Badge,
  TextInput,
  RangeSlider,
  Rating,
  Pagination,
  Loader,
  Center,
  Stack,
  Divider,
  Select,
  Checkbox,
} from "@mantine/core";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AppLayout } from "../components/layout";
import { useAppDispatch, useAppSelector } from "../hooks/useAppStore";
import { fetchHotels } from "../app/store/hotelSlice";
import { SearchBar } from "../features/hotel/components/common/SearchBar";
import { IconMapPin, IconSearch } from "@tabler/icons-react";

export const Hotels = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { hotels, total, totalPages, currentPage, isLoading } = useAppSelector(
    (state) => state.hotel,
  );

  // Khởi tạo State của bộ lọc dựa vào URL parameters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 20000000,
  ]);
  const [rating, setRating] = useState(Number(searchParams.get("rating")) || 0);
  const [amenities, setAmenities] = useState<string[]>(
    searchParams.getAll("amenities") || [],
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");

  useEffect(() => {
    dispatch(
      fetchHotels({
        search: searchParams.get("search") || undefined,
        city: searchParams.get("city") || undefined,
        minPrice: searchParams.get("minPrice")
          ? Number(searchParams.get("minPrice"))
          : undefined,
        maxPrice: searchParams.get("maxPrice")
          ? Number(searchParams.get("maxPrice"))
          : undefined,
        rating: searchParams.get("rating")
          ? Number(searchParams.get("rating"))
          : undefined,
        capacity: searchParams.get("capacity")
          ? Number(searchParams.get("capacity"))
          : undefined,
        checkIn: searchParams.get("checkIn") || undefined,
        checkOut: searchParams.get("checkOut") || undefined,
        sortBy: searchParams.get("sortBy") || undefined,
        amenities: searchParams.getAll("amenities"),
        page: Number(searchParams.get("page")) || 1,
        limit: 10,
      }),
    );
  }, [searchParams, dispatch]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);

    params.delete("search");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("rating");
    params.delete("amenities");

    if (search) params.append("search", search);
    if (priceRange[0] > 0) params.append("minPrice", priceRange[0].toString());
    if (priceRange[1] < 20000000)
      params.append("maxPrice", priceRange[1].toString());
    if (rating > 0) params.append("rating", rating.toString());
    amenities.forEach((a) => params.append("amenities", a));

    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    searchParams.set("page", page.toString());
    setSearchParams(searchParams);
  };

  return (
    <AppLayout>
      <div className="bg-surface py-10 min-h-screen">
        <Container size="xl">
          <div className="mb-10">
            <SearchBar className="!shadow-none border border-hairline" />
          </div>

          <Grid>
            {/* Cột trái: Bộ lọc (Sidebar Filters) */}
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={4} mb="lg">
                  Bộ Lọc Tìm Kiếm
                </Title>

                <Stack gap="md">
                  <TextInput
                    label="Tên khách sạn"
                    placeholder="VD: Luxury Resort..."
                    value={search}
                    onChange={(e) => setSearch(e.currentTarget.value)}
                    leftSection={<IconSearch size={16} />}
                  />

                  <div style={{ marginTop: "0.5rem" }}>
                    <Text size="sm" fw={500} mb="xs">
                      Khoảng giá 1 đêm
                    </Text>
                    <RangeSlider
                      min={0}
                      max={20000000}
                      step={500000}
                      value={priceRange}
                      onChange={setPriceRange}
                      label={(value) =>
                        new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value)
                      }
                      marks={[
                        { value: 0, label: "0₫" },
                        { value: 20000000, label: "20tr+" },
                      ]}
                      mb="xl"
                      color="var(--color-primary)"
                    />
                  </div>

                  <div style={{ marginTop: "0.5rem" }}>
                    <Text size="sm" fw={500} mb="xs">
                      Đánh giá tối thiểu
                    </Text>
                    <Rating
                      value={rating}
                      onChange={setRating}
                      size="md"
                      color="var(--color-tertiary-dim)"
                    />
                  </div>

                  <div style={{ marginTop: "0.5rem" }}>
                    <Text size="sm" fw={500} mb="xs">
                      Tiện ích
                    </Text>
                    <Stack gap="xs">
                      {["WiFi", "Pool", "Spa", "Gym", "Restaurant"].map(
                        (amenity) => (
                          <Checkbox
                            key={amenity}
                            label={amenity}
                            value={amenity}
                            checked={amenities.includes(amenity)}
                            onChange={(e) => {
                              if (e.currentTarget.checked) {
                                setAmenities([...amenities, amenity]);
                              } else {
                                setAmenities(
                                  amenities.filter((a) => a !== amenity),
                                );
                              }
                            }}
                            color="var(--color-primary)"
                          />
                        ),
                      )}
                    </Stack>
                  </div>

                  <Button
                    color="var(--color-primary)"
                    onClick={handleApplyFilters}
                    fullWidth
                    mt="md"
                    className="hover:bg-primary-hover transition-colors"
                  >
                    Áp dụng bộ lọc
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 9 }}>
              <Group justify="space-between" mb="md">
                <Title order={3}>Tìm thấy {total} khách sạn phù hợp</Title>
                <Group gap="xs">
                  <Text fw={600} size="sm" c="dimmed">
                    Sắp xếp:
                  </Text>
                  <Select
                    placeholder="Sắp xếp theo"
                    data={[
                      { value: "newest", label: "Mới nhất" },
                      { value: "price_asc", label: "Giá thấp đến cao" },
                      { value: "price_desc", label: "Giá cao đến thấp" },
                      { value: "rating_desc", label: "Đánh giá cao nhất" },
                      { value: "popular", label: "Phổ biến nhất" },
                    ]}
                    value={sortBy}
                    onChange={(val) => {
                      const newValue = val || "newest";
                      setSortBy(newValue);
                      const params = new URLSearchParams(searchParams);
                      if (newValue !== "newest") {
                        params.set("sortBy", newValue);
                      } else {
                        params.delete("sortBy");
                      }
                      params.set("page", "1");
                      setSearchParams(params);
                    }}
                    style={{ width: 200 }}
                    styles={{
                      input: {
                        color: "var(--color-primary)",
                        fontWeight: 600,
                      },
                    }}
                  />
                </Group>
              </Group>

              <Card
                radius="md"
                mb="xl"
                padding="lg"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)",
                }}
              >
                <Group justify="space-between">
                  <div>
                    <Text size="lg" fw={700} c="white">
                      Khuyến mãi độc quyền!
                    </Text>
                    <Text size="sm" c="white" opacity={0.9}>
                      Đăng nhập để nhận thêm ưu đãi giảm giá lên tới 20% cho
                      thành viên UTravel.
                    </Text>
                  </div>
                  <Button
                    variant="white"
                    color="var(--color-primary)"
                    radius="md"
                    onClick={() => navigate("/login")}
                  >
                    Đăng nhập ngay
                  </Button>
                </Group>
              </Card>

              {isLoading ? (
                <Center py="xl">
                  <Loader color="var(--color-primary)" size="lg" />
                </Center>
              ) : hotels.length === 0 ? (
                <Card
                  shadow="sm"
                  padding="xl"
                  radius="md"
                  withBorder
                  ta="center"
                >
                  <Text size="lg" c="dimmed">
                    Không tìm thấy khách sạn nào phù hợp với điều kiện của bạn.
                  </Text>
                  <Button
                    variant="light"
                    color="var(--color-primary)"
                    mt="md"
                    onClick={() => {
                      setSearch("");
                      setPriceRange([0, 500]);
                      setRating(0);
                      setSearchParams(new URLSearchParams());
                    }}
                  >
                    Xóa tất cả bộ lọc
                  </Button>
                </Card>
              ) : (
                <Stack gap="md">
                  {hotels.map((hotel) => (
                    <Card
                      key={hotel.id}
                      shadow="sm"
                      padding="md"
                      radius="md"
                      withBorder
                      style={{ overflow: "visible" }}
                    >
                      <Grid>
                        {/* Cột ảnh */}
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                          <Image
                            src={(() => {
                              try {
                                const parsedImages = typeof hotel.images === 'string'
                                  ? JSON.parse(hotel.images)
                                  : hotel.images;
                                return parsedImages && Array.isArray(parsedImages) && parsedImages.length > 0
                                  ? parsedImages[0]
                                  : "https://pix8.agoda.net/hotelImages/461838/0/b8762fd588ac35fa9a96190e5c0a9711.jpeg?ce=0&s=1024x";
                              } catch (e) {
                                return "https://pix8.agoda.net/hotelImages/461838/0/b8762fd588ac35fa9a96190e5c0a9711.jpeg?ce=0&s=1024x";
                              }
                            })()}
                            h={{ base: 200, sm: 240 }}
                            radius="md"
                            alt={hotel.name}
                            fit="cover"
                          />
                        </Grid.Col>

                        {/* Cột nội dung */}
                        <Grid.Col
                          span={{ base: 12, sm: 8 }}
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <Group
                            justify="space-between"
                            align="flex-start"
                            mb="xs"
                          >
                            <div style={{ flex: 1 }}>
                              <Title order={4} lineClamp={1}>
                                {hotel.name}
                              </Title>
                              <Group gap="xs" mt={4}>
                                <Rating
                                  value={hotel.rating}
                                  fractions={2}
                                  readOnly
                                  size="sm"
                                  color="var(--color-tertiary-dim)"
                                />
                                <Text size="sm" c="dimmed">
                                  <IconMapPin
                                    size={14}
                                    style={{
                                      display: "inline",
                                      verticalAlign: "text-bottom",
                                    }}
                                  />{" "}
                                  {hotel.location}, {hotel.city}
                                </Text>
                              </Group>
                            </div>
                          </Group>

                          <Text
                            size="sm"
                            c="dimmed"
                            lineClamp={3}
                            mb="md"
                            style={{ flexGrow: 1 }}
                          >
                            {hotel.description ||
                              "Tận hưởng không gian nghỉ dưỡng sang trọng và tiện nghi bậc nhất."}
                          </Text>

                          <div style={{ marginTop: "auto" }}>
                            <Divider mb="sm" />
                            <Group justify="space-between" align="flex-end">
                              <Group gap="xs">
                                {(() => {
                                  try {
                                    const parsedAmenities =
                                      typeof hotel.amenities === "string"
                                        ? JSON.parse(hotel.amenities)
                                        : hotel.amenities;

                                    if (!Array.isArray(parsedAmenities))
                                      return null;

                                    return parsedAmenities
                                      .slice(0, 3)
                                      .map((amenity: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="light"
                                          color="var(--color-primary)"
                                          size="sm"
                                        >
                                          {amenity}
                                        </Badge>
                                      ));
                                  } catch (e) {
                                    return null;
                                  }
                                })()}
                              </Group>

                              <div style={{ textAlign: "right" }}>
                                <Text size="xs" c="dimmed">
                                  Giá mỗi đêm từ
                                </Text>
                                <Text
                                  size="xl"
                                  fw={700}
                                  c="var(--color-primary)"
                                >
                                  {hotel.rooms && hotel.rooms.length > 0
                                    ? new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      }).format(hotel.rooms[0].price)
                                    : "--"}
                                </Text>
                                <Button
                                  size="sm"
                                  color="var(--color-primary)"
                                  mt={4}
                                  onClick={() =>
                                    navigate(`/hotels/${hotel.id}`)
                                  }
                                >
                                  Xem chi tiết
                                </Button>
                              </div>
                            </Group>
                          </div>
                        </Grid.Col>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              )}

              {/* Phân trang */}
              {totalPages > 1 && (
                <Center mt="xl">
                  <Pagination
                    total={totalPages}
                    value={currentPage}
                    onChange={handlePageChange}
                    color="var(--color-primary)"
                  />
                </Center>
              )}
            </Grid.Col>
          </Grid>
        </Container>
      </div>
    </AppLayout>
  );
};

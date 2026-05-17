import { useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Card,
  Grid,
  Image,
  Center,
  Loader,
  Badge,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "../components/layout";
import { QuickSearch } from "../features/hotel/components/QuickSearch";
import { useAppDispatch, useAppSelector } from "../hooks/useAppStore";
import {
  fetchFeaturedHotels,
  fetchDestinations,
} from "../app/store/hotelSlice";

export const Home = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const {
    featuredHotels,
    isFeaturedLoading,
    destinations,
    isDestinationsLoading,
  } = useAppSelector((state) => state.hotel);

  useEffect(() => {
    dispatch(fetchDestinations(4));

    if (isAuthenticated) {
      dispatch(fetchFeaturedHotels(4));
    }
  }, [dispatch, isAuthenticated]);

  return (
    <AppLayout>
      {/* Hero section */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "4rem 2rem",
          borderRadius: "0.5rem",
          marginBottom: "3rem",
          textAlign: "center",
        }}
      >
        <Title size="h1" style={{ color: "white", marginBottom: "1rem" }}>
          Chào mừng đến UTravel
        </Title>
        <Text size="xl" mb="xl">
          Tìm và đặt khách sạn tuyệt vời trên toàn thế giới
        </Text>

        <QuickSearch />
      </div>

      {/* Destinations Section - Các điểm đến thịnh hành */}
      <Container mb="5rem" size="xl">
        <Title order={2} mb="xl">
          Các điểm đến thịnh hành
        </Title>

        {isDestinationsLoading ? (
          <Center py="xl">
            <Loader color="violet" />
          </Center>
        ) : (
          <Grid>
            {destinations.map((city) => (
              <Grid.Col key={city.name} span={{ base: 12, sm: 6, lg: 3 }}>
                <div
                  style={{
                    position: "relative",
                    height: "250px",
                    borderRadius: "1rem",
                    overflow: "hidden",
                    cursor: "pointer",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  onClick={() => navigate(`/hotels?city=${city.name}`)}
                >
                  <Image
                    src={city.image}
                    h="100%"
                    w="100%"
                    fit="cover"
                    style={{ transition: "transform 0.3s ease" }}
                    className="destination-img"
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
                      padding: "2rem 1.5rem 1rem 1.5rem",
                      color: "white",
                    }}
                  >
                    <Title order={3}>{city.name}</Title>
                    <Text size="sm" style={{ opacity: 0.9 }}>
                      {city.count} khách sạn
                    </Text>
                  </div>
                </div>
              </Grid.Col>
            ))}
            {destinations.length === 0 && (
              <Text c="dimmed" style={{ textAlign: "center", width: "100%" }}>
                Chưa có dữ liệu điểm đến.
              </Text>
            )}
          </Grid>
        )}
      </Container>

      {/* Featured hotels section - ĐÃ ĐĂNG NHẬP */}
      {isAuthenticated ? (
        <Container mb="xl" size="xl">
          <Group justify="space-between" mb="xl">
            <Title order={2}>Khách sạn nổi bật & Mới nhất</Title>
            <Button variant="subtle" onClick={() => navigate("/hotels")}>
              Xem tất cả →
            </Button>
          </Group>

          {isFeaturedLoading ? (
            <Center py="xl">
              <Loader color="violet" />
            </Center>
          ) : (
            <Grid>
              {featuredHotels.map((hotel) => (
                <Grid.Col
                  key={hotel.id}
                  span={{ base: 12, sm: 6, md: 4, lg: 3 }}
                >
                  <Card
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Card.Section mb="sm">
                      <Image
                        src={
                          hotel.images &&
                          Array.isArray(hotel.images) &&
                          hotel.images.length > 0
                            ? hotel.images[0]
                            : "https://pix8.agoda.net/hotelImages/461838/0/b8762fd588ac35fa9a96190e5c0a9711.jpeg?ce=0&s=1024x"
                        }
                        height={200}
                        alt={hotel.name}
                      />
                    </Card.Section>

                    <Group justify="space-between" mt="md" mb="xs">
                      <Text fw={600} size="lg" lineClamp={1}>
                        {hotel.name}
                      </Text>
                      <Badge color="pink" variant="light">
                        {hotel.rating}
                      </Badge>
                    </Group>

                    <Text
                      size="sm"
                      c="dimmed"
                      mb="md"
                      lineClamp={2}
                      style={{ flexGrow: 1 }}
                    >
                      {hotel.description ||
                        "Một điểm đến tuyệt vời cho chuyến đi của bạn."}
                    </Text>

                    <Group justify="space-between" mt="auto">
                      <Text fw={700} c="violet">
                        {hotel.rooms && hotel.rooms.length > 0
                          ? `Từ $${hotel.rooms[0].price}`
                          : "Đang cập nhật"}
                      </Text>
                      <Button size="sm" variant="light" color="violet">
                        Chi tiết
                      </Button>
                    </Group>
                  </Card>
                </Grid.Col>
              ))}

              {featuredHotels.length === 0 && !isFeaturedLoading && (
                <Text c="dimmed" style={{ textAlign: "center", width: "100%" }}>
                  Hiện chưa có khách sạn nào.
                </Text>
              )}
            </Grid>
          )}
        </Container>
      ) : (
        // NẾU CHƯA ĐĂNG NHẬP: Hiển thị lời kêu gọi
        <Container
          mb="xl"
          size="sm"
          style={{
            textAlign: "center",
            padding: "3rem 0",
            backgroundColor: "#f8f9fa",
            borderRadius: "1rem",
          }}
        >
          <Title order={3} c="dimmed" mb="md">
            Đăng nhập ngay để xem các ưu đãi và khách sạn nổi bật dành riêng cho
            thành viên
          </Title>
          <Button onClick={() => navigate("/login")} color="violet" size="md">
            Đăng nhập / Đăng ký
          </Button>
        </Container>
      )}
    </AppLayout>
  );
};

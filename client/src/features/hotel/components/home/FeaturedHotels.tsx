import { useRef } from "react";
import { Card, Image, Button, Loader } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import Autoplay from "embla-carousel-autoplay";
import { IconMapPin, IconStar, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import type { Hotel } from "../../services/hotelService";

interface FeaturedHotelsProps {
  hotels: Hotel[];
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const FeaturedHotels = ({ hotels, isLoading, isAuthenticated }: FeaturedHotelsProps) => {
  const navigate = useNavigate();
  const autoplay = useRef(Autoplay({ delay: 3500 }));

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-headline text-on-surface">
          {isAuthenticated ? "Khách Sạn Nổi Bật" : "Khách Sạn Phổ Biến"}
        </h2>
        <button onClick={() => navigate("/hotels")} className="text-body-bold text-primary hover:underline">
          Xem tất cả →
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader color="#004da4" />
        </div>
      ) : hotels.length > 0 ? (
        <Carousel
          plugins={[autoplay.current]}
          withIndicators
          withControls
          previousControlIcon={<IconChevronLeft size={16} />}
          nextControlIcon={<IconChevronRight size={16} />}
          slideSize={{ base: "100%", sm: "50%", md: "33.333%", lg: "25%" }}
          slideGap="md"
        >
          {hotels.map((hotel) => (
            <Carousel.Slide key={hotel.id}>
              <Card
                className="border border-hairline hover:shadow-lg transition-shadow duration-300 h-full"
                radius="md"
                padding="md"
                withBorder
                style={{ display: "flex", flexDirection: "column" }}
              >
                <Card.Section className="relative">
                  <Image
                    src={
                      hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0
                        ? hotel.images[0]
                        : "https://pix8.agoda.net/hotelImages/461838/0/b8762fd588ac35fa9a96190e5c0a9711.jpeg"
                    }
                    height={180}
                    alt={hotel.name}
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1">
                    <IconStar size={11} className="text-tertiary-dim fill-tertiary-dim" />
                    <span className="text-label-caps text-on-surface">{hotel.rating}</span>
                  </div>
                </Card.Section>

                <div className="flex flex-col flex-1 pt-3">
                  <h3 className="text-body-bold text-primary line-clamp-1">{hotel.name}</h3>
                  <p className="flex items-center gap-1 text-label-caps text-ocean mt-1 mb-2">
                    <IconMapPin size={11} />
                    {hotel.city}
                  </p>
                  <p className="text-body text-on-surface-variant line-clamp-2 flex-1">
                    {hotel.description || "Một điểm đến tuyệt vời cho chuyến đi của bạn."}
                  </p>

                  <div className="flex justify-between items-end mt-4 pt-3 border-t border-hairline">
                    <div>
                      <p className="text-label-caps text-ocean">Từ</p>
                      <p className="text-title text-midnight">
                        {hotel.rooms && hotel.rooms.length > 0 ? `${hotel.rooms[0].price.toLocaleString('vi-VN')} ₫` : "TBD"}
                        <span className="text-body text-ocean font-normal"> /đêm</span>
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary-hover text-white"
                      onClick={() => navigate(`/hotels/${hotel.id}`)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              </Card>
            </Carousel.Slide>
          ))}
        </Carousel>
      ) : (
        <div className="text-center py-12 bg-surface-low rounded-xl border border-hairline">
          <p className="text-body text-on-surface-variant mb-4">
            {isAuthenticated
              ? "Chưa có khách sạn nào."
              : "Đăng nhập để xem các ưu đãi dành riêng cho thành viên."}
          </p>
          {!isAuthenticated && (
            <button
              onClick={() => navigate("/login")}
              className="bg-primary text-white text-body-bold px-6 py-2.5 rounded-lg hover:bg-primary-hover transition-colors"
            >
              Đăng nhập / Đăng ký
            </button>
          )}
        </div>
      )}
    </section>
  );
};

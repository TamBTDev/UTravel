import { Card } from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconStar } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

const DEALS = [
  {
    id: 1,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAmDQ8yeOIEo1XjbKYvVai9NJ258YnCP468RNguq7vjQG_Ycc_StLqsfSv7X8O7ROtX6U7KfWDSjWxABXqhVd3fxDZ0m5FsG1vTUL-pEKHt86KyphRy28fb-tHRIPLkEnKF5IoQ2cqhc04Ck-an5t3Uv6Lz5d1V7lyj2hX45ObLeERTrX8xSAZVaAViJHTZcCAZxb8Jj_eAjrhR2RoPNUMfPUO6iJdX_UavRjL8JsrvRFbD4-b9lBqkFJ7wMvgcw5WAVZMq279KEi8",
    rating: "4.9",
    badge: "20% OFF",
    location: "Maldives • 5 Đêm",
    name: "Ocean Oasis Resort & Spa",
    original: "12.500.000 ₫",
    price: "9.990.000 ₫",
    outlined: false,
  },
  {
    id: 2,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDX9Y__-eF53jUFCmELhGEZYhJyyjOap3rVVr3oUKw8x22mzyBefgGl4si6qE9EArGX9ErjAncbyuuyvq96MqBm7zxpLhFf44DKRYNSDgALVot8nGJw7AgAMy0czSVuylmVWA7ml4-nwKOGGD7ujTE8KsHoENnSUv4k1iG3MuynX1XRoGUb3FGnxXB8Qz2k3XaEJMLX5UEMMkpM6c53nwkegqlBYJmlV0FvwXEi8OvzfQN4w1hQ76eK4j1rA1UXK9z1OOJ878-0KQA",
    rating: "4.7",
    badge: "FLIGHT INCLUDED",
    location: "Paris, Pháp • City Break",
    name: "Romantic Paris Escape",
    original: "8.500.000 ₫",
    price: "7.200.000 ₫",
    outlined: false,
  },
  {
    id: 3,
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjc-ecq-7j2KIBgRxXFtZQNbnOUGntsedF6CWOkBBLxoQNg7-voy24yw3dZTBwR0lf3ELylkSqKnQ27NmZaYfXH8D0H_ewoXKTxKWjMcEB7MVppJUzMIO_wme_mBORj_VvRaEcu1s5t9AVmtYQiTPwdGNDmvihxDlwCl7OdzYIayFDnQlwMCIHDg_1UhWN7GUMO-N8AjwsWCw_-vdeXCPr1DK50pNQNq94jZLNG9hYtuDZDhjwMh-1_2ayigAPRbmkq7qReMI2R24",
    rating: "4.8",
    badge: null,
    location: "Cappadocia, Thổ Nhĩ Kỳ • Tour",
    name: "Trải Nghiệm Khinh Khí Cầu",
    original: null,
    price: "Từ 1.990.000 ₫",
    outlined: true,
  },
];

export const SpecialDeals = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-surface-low rounded-2xl p-8 border border-hairline">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-headline text-on-surface">Ưu Đãi Đặc Biệt</h2>
          <p className="text-body text-on-surface-variant mt-1">Ưu đãi độc quyền cho thành viên UTravel</p>
        </div>
        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-high transition-colors">
            <IconChevronLeft size={16} className="text-on-surface" />
          </button>
          <button className="w-9 h-9 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-high transition-colors">
            <IconChevronRight size={16} className="text-on-surface" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEALS.map((deal) => (
          <Card
            key={deal.id}
            className="bg-white border border-hairline hover:shadow-lg transition-shadow duration-300 group overflow-visible"
            radius="md"
            padding={0}
            withBorder
          >
            {/* Image */}
            <Card.Section className="relative overflow-hidden h-48 rounded-t-[inherit]">
              <img
                src={deal.img}
                alt={deal.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1">
                <IconStar size={11} className="text-tertiary-dim fill-tertiary-dim" />
                <span className="text-label-caps text-on-surface">{deal.rating}</span>
              </div>
            </Card.Section>

            {/* Body */}
            <div className="p-4 relative">
              {deal.badge && (
                <span className="absolute -top-3.5 right-4 bg-deal-orange text-white text-label-caps px-3 py-0.5 rounded-full shadow-sm border border-white">
                  {deal.badge}
                </span>
              )}
              <p className="text-body text-on-surface-variant mb-1">{deal.location}</p>
              <h3 className="text-title text-on-surface mb-4">{deal.name}</h3>
              <div className="flex justify-between items-end">
                <div>
                  {deal.original && (
                    <span className="block text-label-caps text-outline line-through">{deal.original}</span>
                  )}
                  <span className="text-title text-midnight">{deal.price}</span>
                </div>
                <button
                  onClick={() => navigate("/hotels")}
                  className={`px-4 py-2 rounded-lg text-body-bold transition-colors ${
                    deal.outlined
                      ? "border border-primary text-primary hover:bg-surface-low"
                      : "bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
                  }`}
                >
                  {deal.outlined ? "Xem chi tiết" : "Đặt ngay"}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

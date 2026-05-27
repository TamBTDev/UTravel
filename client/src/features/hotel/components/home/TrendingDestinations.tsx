import { Loader } from "@mantine/core";
import { useNavigate } from "react-router-dom";

const STATIC_DESTINATIONS = [
  {
    name: "Bali, Indonesia",
    label: "MUST VISIT",
    desc: "Experience spiritual tranquility and stunning beaches.",
    span: "md:col-span-2 md:row-span-2",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDqor0YMjqmma4M4YzenIpuF2fRn5YbdsVg4u-LhLdG7k-Q3sR6pZxPYbuWVb-6ZoyVOmQfLLwOYvehX6GopU6_bMMFY8fR629Czm0irK5287NgTgJornTCdV0eQ97fS9YdG7Si_TZVy4DtXAkde65lvoTRtBtD0q7mFDvQoCsvhckpWfQQQLfXMclIxTl1BSAfl0gW4nHqNApaFaXjvxpPmEz4lTvQ0FtrMXU9FUghwMTF32hl0wtnpoJtRqQvKk-P7Zdz445ltJI",
    large: true,
  },
  {
    name: "Tokyo, Japan",
    label: null,
    desc: "Neon lights and ancient traditions.",
    span: "md:col-span-2",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMLzgwqcaiiNtjvfHCdRphKAdlmfl-XWAjXTQx6J9y8f4cQYV-bWtPUQywn5VbrmkJcX9Z6OE-tw3DNOjH7X0tyrsj3vV-8Kww2b9SjHLzavFuIZl7GqeN7kiqNqYTzEx3VwUvV2ZQ38QOqHoV_c51wARnf7RDN9LJP2E4iFti60QbaHOXA-cnFNT2lpFw2dmOMYN0YEvyIkCUDRFcVzH7WxN6NzbaqBc5RA2PCRv7Y20kDKKJVwIT1crkvp1fX7YGRMFbdZQ3zSE",
    large: false,
  },
  {
    name: "Phuket",
    label: null,
    desc: "",
    span: "",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkZ0Hm0ODw4WnkK_hyUgKdiG4TX35QOK_QiHTQ4SAkUEpUYxXY4LgwKwLu_7kFopi4GRg5tB--xtcwKz5uuO8m4P54fRR3a5mFHf_MkfenHC_0PVXg8Qulkq81roQyoh3xXA5EEZVbF302aFJRl3YGu_98m9L8eGqGvnRJPMqExJztRI1nTZy-weTi2S8et8RDqf3bJIsCwktxQ-7r5fvtvB7sdUkl1F3l8MkrSiKxbr-pHsQAUS2YgpYQywgcqzFr6Q0O3sC6ZvI",
    large: false,
  },
  {
    name: "Amalfi Coast",
    label: null,
    desc: "",
    span: "",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCi3n38fR7CKs8nskTYOgO0tXssnerBkzq41orohPnHMPBBusgmY7C7S8ks0ueMvgi5Mbx_Tw3VjsUvYNegPqMbZ4G9Lm9oGrmVNi4O7B1V1cWj3ZEEzZelAU9J6BLIucpIwIBogpqvxcqiK0dogdwGSOGbNLphxnml4EhT31R-tsEYCLdCKMFVHAgHxgOEiOkmnh6eViQZHeViKLaOCrhOftgBGElAQhsH1mjlOZCKFIVnoAvr7gDe7JMFb2jxXDOr8WNR3tj4Ab8",
    large: false,
  },
];

interface Destination {
  name: string;
  image: string;
  count: number;
}

interface TrendingDestinationsProps {
  destinations: Destination[];
  isLoading: boolean;
}

export const TrendingDestinations = ({
  destinations,
  isLoading,
}: TrendingDestinationsProps) => {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-headline text-on-surface">
            Điểm Đến Thịnh Hành
          </h2>
          <p className="text-body text-on-surface-variant mt-1">
            Những lựa chọn phổ biến nhất từ Việt Nam
          </p>
        </div>
        <button
          onClick={() => navigate("/hotels")}
          className="text-body-bold text-primary hover:underline"
        >
          Xem tất cả
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader color="#004da4" />
        </div>
      ) : destinations.length > 0 ? (
        /* Live API data — simple 4-column grid */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-64">
          {destinations.map((city) => (
            <div
              key={city.name}
              onClick={() => navigate(`/hotels?city=${city.name}`)}
              className="relative rounded-xl overflow-hidden group cursor-pointer border border-hairline shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <img
                src={city.image}
                alt={city.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <h3 className="text-title text-white drop-shadow-md">
                  {city.name}
                </h3>
                <p className="text-label-caps text-white/80 mt-0.5">
                  {city.count} hotels
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Figma fallback — 4-col / 2-row bento grid */
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[500px]">
          {STATIC_DESTINATIONS.map((dest) => (
            <div
              key={dest.name}
              onClick={() => navigate(`/hotels?city=${dest.name}`)}
              className={`${dest.span} relative rounded-xl overflow-hidden group cursor-pointer border border-hairline shadow-sm hover:shadow-lg transition-all duration-300`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${dest.img}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 w-full">
                {dest.label && (
                  <span className="inline-block bg-secondary-container text-on-secondary-container text-label-caps px-2 py-0.5 rounded mb-2">
                    {dest.label}
                  </span>
                )}
                <h3
                  className={`text-white drop-shadow-md ${dest.large ? "text-headline" : "text-title"}`}
                >
                  {dest.name}
                </h3>
                {dest.desc && (
                  <p className="text-body text-white/90 drop-shadow-sm line-clamp-2 mt-1">
                    {dest.desc}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

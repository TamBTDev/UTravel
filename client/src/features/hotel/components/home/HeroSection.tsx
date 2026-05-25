import { SearchBar } from "../common/SearchBar";

export const HeroSection = () => {

  return (
    <section className="relative w-full h-[600px] flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80"
          alt=""
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-midnight/40" />
      </div>

      {/* Hero text */}
      <div className="relative z-10 text-center px-8 mb-10 max-w-3xl mx-auto">
        <h1 className="text-display text-white drop-shadow-md mb-3">
          Khám Phá Chuyến Đi Tiếp Theo
        </h1>
        <p className="text-headline text-white/90 drop-shadow-sm font-semibold">
          Đặt phòng, vé máy bay và trải nghiệm tại cùng một nơi.
        </p>
      </div>

      {/* Search widget */}
      <div className="relative z-20 w-full max-w-5xl mx-4 translate-y-8">
        <SearchBar />
      </div>
    </section>
  );
};

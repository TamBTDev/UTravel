import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ImageCarouselProps {
  images: string[];
  title: string;
  height?: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title, height = 400 }) => {
  if (!images || images.length === 0) {
    return (
      <div
        className="w-full bg-gray-200 rounded-lg flex items-center justify-center"
        style={{ height: `${height}px` }}
      >
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={images.length > 1}
        className="w-full"
        style={{ height: `${height}px` }}
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={image}
              alt={`${title} - Image ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback for broken images
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/800x400?text=No+Image';
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

import React, { useState } from 'react';
import { Box, Image, Group, Button, Badge } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

interface ImageCarouselProps {
  images: string[];
  title: string;
  height?: number;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  title, 
  height = 400 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validImages = images.filter(img => img && typeof img === 'string');
  
  if (!validImages.length) {
    return (
      <Box
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1564501049714-8f6a89519604?w=800&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height,
          borderRadius: '8px',
        }}
      />
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
      <Image
        src={validImages[currentIndex]}
        alt={`${title} - Image ${currentIndex + 1}`}
        height={height}
        style={{ objectFit: 'cover' }}
      />

      {/* Navigation Buttons */}
      {validImages.length > 1 && (
        <>
          {/* Previous Button */}
          <Button
            size="lg"
            radius="xl"
            onClick={goToPrevious}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              zIndex: 10,
            }}
            p={0}
            w={44}
            h={44}
          >
            <IconChevronLeft size={24} color="white" />
          </Button>

          {/* Next Button */}
          <Button
            size="lg"
            radius="xl"
            onClick={goToNext}
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              zIndex: 10,
            }}
            p={0}
            w={44}
            h={44}
          >
            <IconChevronRight size={24} color="white" />
          </Button>

          {/* Image Indicators */}
          <Group
            justify="center"
            gap={4}
            style={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            {validImages.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: idx === currentIndex ? 12 : 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: idx === currentIndex ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Group>
        </>
      )}

      {/* Image Counter */}
      {validImages.length > 1 && (
        <Badge
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 10,
          }}
          variant="filled"
          bg="rgba(0, 0, 0, 0.6)"
        >
          {currentIndex + 1} / {validImages.length}
        </Badge>
      )}
    </Box>
  );
};


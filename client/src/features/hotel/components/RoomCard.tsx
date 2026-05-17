import React from 'react';
import { Card, Badge, Button, Group, Text, Stack, Image, Tooltip } from '@mantine/core';
import { IconCheck, IconX, IconMinus } from '@tabler/icons-react';

interface RoomCardProps {
  room: {
    id: number;
    roomNumber: string;
    type: string;
    price: number;
    capacity: number;
    description?: string;
    amenities?: any;
    images?: any;
  };
  onSelect: (roomId: number) => void;
  isAvailable: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onSelect, isAvailable }) => {
  const handleSelectRoom = () => {
    if (isAvailable) {
      onSelect(room.id);
    }
  };

  // Parse images if they're stored as JSON string
  const images = Array.isArray(room.images)
    ? room.images
    : room.images
      ? typeof room.images === 'string'
        ? JSON.parse(room.images)
        : [room.images]
      : [];

  // Parse amenities if they're stored as JSON string
  const amenities = Array.isArray(room.amenities)
    ? room.amenities
    : room.amenities
      ? typeof room.amenities === 'string'
        ? JSON.parse(room.amenities)
        : [room.amenities]
      : [];

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="h-full hover:shadow-lg transition-shadow">
      <Stack gap="md" className="h-full">
        {/* Room Image */}
        {images && images.length > 0 && (
          <Image
            src={images[0]}
            height={200}
            alt={`${room.type} - Room ${room.roomNumber}`}
            radius="md"
            className="object-cover"
          />
        )}

        {/* Room Header */}
        <Group justify="space-between">
          <div>
            <Text fw={600} size="lg">
              {room.type}
            </Text>
            <Text size="sm" c="dimmed">
              Room {room.roomNumber}
            </Text>
          </div>
          <Tooltip label={isAvailable ? 'Available' : 'Not Available'}>
            <Badge
              color={isAvailable ? 'green' : 'red'}
              leftSection={isAvailable ? <IconCheck size={12} /> : <IconX size={12} />}
              variant="light"
            >
              {isAvailable ? 'Available' : 'Booked'}
            </Badge>
          </Tooltip>
        </Group>

        {/* Room Details */}
        <div className="space-y-1">
          <Group justify="space-between">
            <Text size="sm">
              <strong>Capacity:</strong>
            </Text>
            <Text size="sm">{room.capacity} guests</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm">
              <strong>Price:</strong>
            </Text>
            <Text size="sm" fw={600} c="blue">
              ${room.price}/night
            </Text>
          </Group>
        </div>

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div>
            <Text size="xs" fw={600} mb={4}>
              Amenities:
            </Text>
            <Group gap="xs">
              {amenities.slice(0, 3).map((amenity: string, idx: number) => (
                <Badge key={idx} size="sm" variant="dot">
                  {amenity}
                </Badge>
              ))}
              {amenities.length > 3 && (
                <Text size="xs" c="dimmed">
                  +{amenities.length - 3} more
                </Text>
              )}
            </Group>
          </div>
        )}

        {/* Action Button */}
        <Button
          fullWidth
          disabled={!isAvailable}
          onClick={handleSelectRoom}
          className="mt-auto"
          size="sm"
        >
          {isAvailable ? 'Select Room' : 'Not Available'}
        </Button>
      </Stack>
    </Card>
  );
};

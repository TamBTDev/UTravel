import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Card,
  Badge,
  Button,
  Rating,
  Loader,
  Center,
  Alert,
  Grid,
  Avatar,
  Divider,
} from '@mantine/core';
import { IconAlertCircle, IconMapPin, IconStar } from '@tabler/icons-react';
import { AppLayout } from '../components/layout';
import { ImageCarousel } from '../features/hotel/components/ImageCarousel';
import { RoomCard } from '../features/hotel/components/RoomCard';
import { getHotelDetail, getRelatedHotels, checkRoomAvailability } from '../features/hotel/services/hotelService';
import dayjs from 'dayjs';

interface Hotel {
  id: number;
  name: string;
  description: string | null;
  location: string;
  city: string;
  country: string;
  rating: number;
  amenities?: any;
  images?: any;
  rooms?: Room[];
  reviews?: Review[];
}

interface Room {
  id: number;
  roomNumber: string;
  type: string;
  price: number;
  capacity: number;
  description?: string;
  amenities?: any;
  images?: any;
  isAvailable?: boolean;
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface RelatedHotel {
  id: number;
  name: string;
  city: string;
  rating: number;
  images?: string[];
}

export const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const checkInDate = searchParams.get('checkIn');
  const checkOutDate = searchParams.get('checkOut');

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [relatedHotels, setRelatedHotels] = useState<RelatedHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError('Hotel ID is missing');
          return;
        }

        // Load hotel detail
        const hotelData = await getHotelDetail(id);
        setHotel(hotelData);

        // Load related hotels
        const related = await getRelatedHotels(id, 6);
        setRelatedHotels(related);

        // Check availability if dates provided
        if (hotelData.rooms && checkInDate && checkOutDate) {
          const updatedRooms = await Promise.all(
            hotelData.rooms.map(async (room) => {
              try {
                const availableData = await checkRoomAvailability(
                  room.id.toString(),
                  checkInDate,
                  checkOutDate,
                );
                return { ...room, isAvailable: availableData.available };
              } catch {
                return room;
              }
            }),
          );
          setHotel({ ...hotelData, rooms: updatedRooms });
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load hotel details');
        console.error('Error loading hotel:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, checkInDate, checkOutDate]);

  const handleSelectRoom = (roomId: number) => {
    if (!id) return;
    navigate(`/booking?roomId=${roomId}&hotelId=${id}&checkIn=${checkInDate}&checkOut=${checkOutDate}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <Container size="lg" py="xl">
          <Center h={400}>
            <Loader />
          </Center>
        </Container>
      </AppLayout>
    );
  }

  if (error || !hotel) {
    return (
      <AppLayout>
        <Container size="lg" py="xl">
          <Alert icon={<IconAlertCircle />} color="red" title="Error">
            {error || 'Hotel not found'}
          </Alert>
          <Button mt="md" onClick={() => navigate('/hotels')}>
            Back to Hotels
          </Button>
        </Container>
      </AppLayout>
    );
  }

  const images = Array.isArray(hotel.images)
    ? hotel.images
    : hotel.images
      ? typeof hotel.images === 'string'
        ? JSON.parse(hotel.images)
        : [hotel.images]
      : ['https://images.unsplash.com/photo-1564501049714-8f6a89519604?w=800&q=80'];

  const amenities = Array.isArray(hotel.amenities)
    ? hotel.amenities
    : hotel.amenities
      ? typeof hotel.amenities === 'string'
        ? JSON.parse(hotel.amenities)
        : [hotel.amenities]
      : [];

  return (
    <AppLayout>
      <Container size="lg" py="xl">
        <Stack gap="xl">
          {/* Hotel Image Carousel */}
          <ImageCarousel images={images} title={hotel.name} height={500} />

          {/* Hotel Info */}
          <Card withBorder p="lg" radius="md">
            <Stack gap="md">
              <Group justify="space-between" align="flex-start">
                <div>
                  <Title order={1}>{hotel.name}</Title>
                  <Group gap="xs" mt="xs">
                    <Group gap={4}>
                      <IconMapPin size={16} />
                      <Text>{hotel.location}, {hotel.city}</Text>
                    </Group>
                  </Group>
                </div>
                <Badge size="lg" variant="filled">
                  {hotel.rating.toFixed(1)} ⭐
                </Badge>
              </Group>

              {hotel.description && (
                <>
                  <Divider />
                  <Text>{hotel.description}</Text>
                </>
              )}

              {/* Amenities */}
              {amenities.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <Text fw={600} mb="md">
                      Amenities
                    </Text>
                    <Group gap="sm">
                      {amenities.map((amenity: string, idx: number) => (
                        <Badge key={idx} variant="light">
                          {amenity}
                        </Badge>
                      ))}
                    </Group>
                  </div>
                </>
              )}
            </Stack>
          </Card>

          {/* Rooms Section */}
          <div>
            <Title order={2} mb="lg">
              Available Rooms
            </Title>
            {hotel.rooms && hotel.rooms.length > 0 ? (
              <Grid>
                {hotel.rooms.map((room) => (
                  <Grid.Col key={room.id} span={{ base: 12, sm: 6, md: 4 }}>
                    <RoomCard
                      room={room}
                      onSelect={() => handleSelectRoom(room.id)}
                      isAvailable={room.isAvailable !== false}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            ) : (
              <Alert icon={<IconAlertCircle />} color="yellow">
                No rooms available for this hotel
              </Alert>
            )}
          </div>

          {/* Reviews Section */}
          {hotel.reviews && hotel.reviews.length > 0 && (
            <>
              <Divider />
              <div>
                <Title order={2} mb="lg">
                  Guest Reviews
                </Title>
                <Stack gap="md">
                  {hotel.reviews.map((review) => (
                    <Card key={review.id} withBorder p="md" radius="md" bg="gray-0">
                      <Group mb="md">
                        <Avatar
                          src={review.user?.avatar}
                          name={`${review.user?.firstName} ${review.user?.lastName}`}
                          radius="xl"
                        />
                        <div style={{ flex: 1 }}>
                          <Text fw={600}>
                            {review.user?.firstName} {review.user?.lastName}
                          </Text>
                          <Group gap="xs">
                            <Rating value={review.rating} readOnly size="sm" />
                            <Text size="xs" c="dimmed">
                              {dayjs(review.createdAt).format('MMM DD, YYYY')}
                            </Text>
                          </Group>
                        </div>
                      </Group>
                      <Text>{review.comment}</Text>
                    </Card>
                  ))}
                </Stack>
              </div>
            </>
          )}

          {/* Related Hotels */}
          {relatedHotels.length > 0 && (
            <>
              <Divider />
              <div>
                <Title order={2} mb="lg">
                  Similar Hotels in {hotel.city}
                </Title>
                <Grid>
                  {relatedHotels.map((relatedHotel) => {
                    const relatedImages = Array.isArray(relatedHotel.images)
                      ? relatedHotel.images
                      : relatedHotel.images
                        ? typeof relatedHotel.images === 'string'
                          ? JSON.parse(relatedHotel.images)
                          : [relatedHotel.images]
                        : ['https://images.unsplash.com/photo-1564501049714-8f6a89519604?w=800&q=80'];

                    return (
                      <Grid.Col key={relatedHotel.id} span={{ base: 12, sm: 6, md: 4, lg: 2 }}>
                        <Card
                          withBorder
                          radius="md"
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => navigate(`/hotels/${relatedHotel.id}`)}
                        >
                          <Card.Section>
                            <div
                              style={{
                                backgroundImage: `url(${relatedImages[0]})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                height: 180,
                              }}
                            />
                          </Card.Section>
                          <Stack gap="xs" p="md">
                            <Text fw={600} lineClamp={1}>
                              {relatedHotel.name}
                            </Text>
                            <Group justify="space-between">
                              <Text size="sm" c="dimmed">
                                {relatedHotel.city}
                              </Text>
                              <Badge size="sm">
                                {relatedHotel.rating.toFixed(1)} ⭐
                              </Badge>
                            </Group>
                          </Stack>
                        </Card>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </div>
            </>
          )}

          <Group mt="xl">
            <Button variant="default" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Group>
        </Stack>
      </Container>
    </AppLayout>
  );
};

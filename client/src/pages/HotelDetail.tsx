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
  ActionIcon,
  Breadcrumbs,
  Anchor,
  Box,
} from '@mantine/core';
import { IconAlertCircle, IconMapPin, IconHeart, IconHeartFilled, IconCheck, IconShare, IconBuilding, IconStar, IconEye, IconBriefcase } from '@tabler/icons-react';
import { AppLayout } from '../components/layout';
import { getHotelDetail, getRelatedHotels, checkRoomAvailability } from '../features/hotel/services/hotelService';
import dayjs from 'dayjs';
import apiClient from '@/lib/api-client';
import { useAppSelector } from '@/hooks/useAppStore';

// Tiện ích mock icon mapping
const getAmenityIcon = (amenity: string) => {
  return <IconCheck size={18} color="#0b63d6" />;
};

interface Hotel {
  id: number;
  name: string;
  description: string | null;
  location: string;
  city: string;
  country: string;
  rating: number;
  viewCount?: number;
  bookingCount?: number;
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
  images?: any;
  highlights?: string[] | null;
  cleanlinessRating?: number;
  serviceRating?: number;
  locationRating?: number;
  valueRating?: number;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
  const [searchParams] = useSearchParams();

  const initCheckIn = searchParams.get('checkIn') || dayjs().add(1, 'day').format('YYYY-MM-DD');
  const initCheckOut = searchParams.get('checkOut') || dayjs().add(3, 'day').format('YYYY-MM-DD');

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const [relatedHotels, setRelatedHotels] = useState<Hotel[]>([]);
  const [viewedHotels, setViewedHotels] = useState<Hotel[]>([]);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError('Hotel ID is missing');
          return;
        }

        const hotelData = await getHotelDetail(id);
        setHotel(hotelData);
        
        try {
          const related = await getRelatedHotels(id);
          setRelatedHotels((related as any).data || related);
        } catch(e) {
          console.error('Failed to load related hotels', e);
        }

        // Pre-select first room
        if (hotelData.rooms && hotelData.rooms.length > 0) {
           setSelectedRoomId(hotelData.rooms[0].id);
        }

        // Gọi API addViewed nếu đã đăng nhập
        if (isAuthenticated) {
           try {
             await apiClient.post('/users/viewed', { hotelId: Number(id) });
             const favRes = await apiClient.get('/users/favorites');
             if (favRes.data.data.some((f: any) => f.hotelId === Number(id))) {
               setIsFavorite(true);
             }
             const viewedRes = await apiClient.get('/users/viewed');
             // Map viewedHotels: viewedRes.data.data might be [{ hotel: Hotel, viewedAt: ... }]
             const mappedViewed = viewedRes.data.data.map((item: any) => item.hotel);
             setViewedHotels(mappedViewed);
           } catch (e) {}
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load hotel details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isAuthenticated]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await apiClient.post('/users/favorites', { hotelId: Number(id) });
      setIsFavorite(res.data.data.favorited);
    } catch (error) {
      console.error('Lỗi yêu thích', error);
    }
  };

  const currentSelectedRoom = hotel?.rooms?.find(r => r.id === selectedRoomId);

  const handleBookNow = () => {
    if (!selectedRoomId || !id) return;
    navigate(`/booking?roomId=${selectedRoomId}&hotelId=${id}&checkIn=${initCheckIn}&checkOut=${initCheckOut}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <Container size="xl" py="xl">
          <Center h={400}><Loader color="blue" /></Center>
        </Container>
      </AppLayout>
    );
  }

  if (error || !hotel) {
    return (
      <AppLayout>
        <Container size="xl" py="xl">
          <Alert icon={<IconAlertCircle />} color="red" title="Lỗi">
            {error || 'Không tìm thấy thông tin khách sạn'}
          </Alert>
          <Button mt="md" onClick={() => navigate('/hotels')}>Quay lại danh sách</Button>
        </Container>
      </AppLayout>
    );
  }

  const images = Array.isArray(hotel.images)
    ? hotel.images
    : hotel.images
      ? typeof hotel.images === 'string' ? JSON.parse(hotel.images) : [hotel.images]
      : ['https://images.unsplash.com/photo-1564501049714-8f6a89519604?w=800&q=80'];

  const amenities = Array.isArray(hotel.amenities)
    ? hotel.amenities
    : hotel.amenities ? typeof hotel.amenities === 'string' ? JSON.parse(hotel.amenities) : [hotel.amenities] : [];

  return (
    <AppLayout>
      <Container size="xl" py="xl">
        
        {/* BREADCRUMBS & HEADING */}
        <Stack gap="md" mb="xl">
           <Breadcrumbs style={{ fontSize: 13, color: '#6b7280' }}>
             <Anchor href="/hotels" color="dimmed">Khách sạn</Anchor>
             <Anchor href={`/hotels?city=${hotel.city}`} color="dimmed">{hotel.city}</Anchor>
             <Text size="sm" c="dark">{hotel.name}</Text>
           </Breadcrumbs>

           <Group justify="space-between" align="flex-start">
             <div>
               <Title order={1} size="h2" fw={700} style={{ color: '#111827' }}>
                 {hotel.name}
               </Title>
               <Group gap="xs" mt={8}>
                 <IconMapPin size={16} color="#0b63d6" />
                 <Text size="sm" c="dimmed">
                   {hotel.location}, {hotel.city}, {hotel.country}
                 </Text>
                 <Anchor size="sm" color="#0b63d6" fw={500} href="#map">
                   • Xem trên bản đồ
                 </Anchor>
               </Group>
               <Group gap="lg" mt={8}>
                  {hotel.viewCount !== undefined && <Text size="xs" c="dimmed" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconEye size={14} /> {hotel.viewCount} lượt xem</Text>}
                  {hotel.bookingCount !== undefined && <Text size="xs" c="dimmed" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><IconBriefcase size={14} /> {hotel.bookingCount} lượt đặt</Text>}
               </Group>
             </div>

             <Group gap="md">
               <ActionIcon variant="light" size="lg" radius="md" onClick={toggleFavorite} color={isFavorite ? 'red' : 'gray'}>
                 {isFavorite ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
               </ActionIcon>
               <ActionIcon variant="light" size="lg" radius="md" color="gray">
                 <IconShare size={20} />
               </ActionIcon>
               <Group bg="green.0" px={12} py={8} style={{ borderRadius: 8, border: '1px solid #d1fae5' }} gap={6}>
                 <IconStar size={16} color="#10b981" fill="#10b981" />
                 <Text fw={700} size="md" c="green.8">{hotel.rating.toFixed(1)}</Text>
                 <Text size="sm" c="dimmed">({(hotel as any)._count?.reviews || hotel.reviews?.length || 0} đánh giá)</Text>
               </Group>
             </Group>
           </Group>
        </Stack>

        {/* IMAGE GALLERY (Giống UI Mẫu) */}
        <Grid gutter="sm" mb={40}>
           <Grid.Col span={{ base: 12, md: 8 }}>
              <div style={{ height: '460px', borderRadius: '12px 0 0 12px', overflow: 'hidden' }}>
                 <img src={images[0]} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
           </Grid.Col>
           <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="sm" h="100%">
                 {images.length > 1 ? (
                   <div style={{ height: 'calc(50% - 6px)', borderRadius: '0 12px 0 0', overflow: 'hidden' }}>
                     <img src={images[1]} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   </div>
                 ) : null}
                 {images.length > 2 ? (
                   <div style={{ height: 'calc(50% - 6px)', borderRadius: '0 0 12px 0', overflow: 'hidden' }}>
                     <img src={images[2]} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   </div>
                 ) : null}
              </Stack>
           </Grid.Col>
        </Grid>

        {/* MAIN SPLIT LAYOUT */}
        <Grid gutter={40}>
           {/* LEFT CONTENT */}
           <Grid.Col span={{ base: 12, md: 8 }}>
              
              {/* ABOUT THE PROPERTY */}
              <Box mb={40}>
                 <Title order={3} size="h3" mb="md" fw={700}>Về chỗ nghỉ</Title>
                 <Text c="dimmed" lh={1.6} style={{ whiteSpace: 'pre-line' }}>
                   {hotel.description || 'Chưa có thông tin giới thiệu chi tiết về chỗ nghỉ này.'}
                 </Text>
              </Box>

              <Divider mb={40} />

              {/* AMENITIES */}
              <Box mb={40}>
                 <Title order={3} size="h3" mb="lg" fw={700}>Tiện nghi phổ biến</Title>
                 <Grid>
                   {amenities.map((amenity: string, idx: number) => (
                     <Grid.Col span={{ base: 6, sm: 4 }} key={idx}>
                       <Group gap="sm">
                          {getAmenityIcon(amenity)}
                          <Text size="sm" fw={500}>{amenity}</Text>
                       </Group>
                     </Grid.Col>
                   ))}
                 </Grid>
              </Box>

              <Divider mb={40} />

              {/* AVAILABLE ROOMS */}
              <Box mb={40}>
                 <Title order={3} size="h3" mb="lg" fw={700}>Phòng trống</Title>
                 <Stack gap="xl">
                   {hotel.rooms?.map((room) => {
                     const isSelected = selectedRoomId === room.id;
                     const roomImages = Array.isArray(room.images) ? room.images : typeof room.images === 'string' ? JSON.parse(room.images) : [];
                     const roomImg = roomImages[0] || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&q=80';
                     return (
                       <Card 
                         key={room.id} 
                         withBorder 
                         p="md" 
                         radius="md" 
                         style={{ borderColor: isSelected ? '#0b63d6' : undefined, boxShadow: isSelected ? '0 0 0 1px #0b63d6' : 'none' }}
                       >
                         <Grid align="center" gutter="md">
                           <Grid.Col span={{ base: 12, sm: 4 }}>
                             <img src={roomImg} alt={room.type} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: '8px' }} />
                           </Grid.Col>
                           <Grid.Col span={{ base: 12, sm: 5 }}>
                             <Text fw={700} size="lg" mb={4}>{room.type}</Text>
                             <Group gap="xs" mb="xs" c="dimmed">
                               <IconBuilding size={16} /> 
                               <Text size="sm">Tối đa {room.capacity} khách</Text>
                             </Group>
                             <Group gap="xs">
                               <Badge color="green" variant="light">Bao gồm bữa sáng</Badge>
                               <Badge color="gray" variant="light">Không hoàn tiền</Badge>
                             </Group>
                           </Grid.Col>
                           <Grid.Col span={{ base: 12, sm: 3 }}>
                             <Stack justify="flex-end" align="flex-end" h="100%">
                               {/* Dummy original price */}
                               <Text td="line-through" c="dimmed" size="xs">{(room.price * 1.2).toLocaleString()} ₫</Text>
                               <Group gap={4} align="baseline">
                                  <Text fw={700} size="xl">{room.price.toLocaleString()} ₫</Text>
                                  <Text size="xs" c="dimmed">/ đêm</Text>
                               </Group>
                               <Button 
                                 mt="sm" 
                                 variant={isSelected ? "filled" : "outline"} 
                                 color="#0b63d6" 
                                 fullWidth
                                 onClick={() => setSelectedRoomId(room.id)}
                               >
                                 {isSelected ? 'Đã chọn' : 'Chọn phòng'}
                               </Button>
                             </Stack>
                           </Grid.Col>
                         </Grid>
                       </Card>
                     )
                   })}
                 </Stack>
              </Box>

              <Divider mb={40} />

              {/* REVIEWS */}
              <Box mb={40}>
                 <Group justify="space-between" mb="lg">
                    <Title order={3} size="h3" fw={700}>
                      Đánh giá của khách
                      {hotel.reviews && hotel.reviews.length > 0 && (
                        <Text span c="dimmed" fw={400} size="sm" ml={8}>({hotel.reviews.length} đánh giá)</Text>
                      )}
                    </Title>
                    {hotel.reviews && hotel.reviews.length > 3 && (
                      <Button variant="subtle" size="sm" onClick={() => setShowAllReviews(v => !v)}>
                        {showAllReviews ? 'Thu gọn' : `Xem tất cả (${hotel.reviews.length})`}
                      </Button>
                    )}
                 </Group>
                 
                 <Stack gap="xl">
                    {(!hotel.reviews || hotel.reviews.length === 0) && (
                      <Text c="dimmed">Chưa có đánh giá nào.</Text>
                    )}
                    {(showAllReviews ? hotel.reviews : hotel.reviews?.slice(0, 3))?.map((review) => {
                      const reviewImgs: string[] = (() => {
                        if (!review.images) return [];
                        if (Array.isArray(review.images)) return review.images;
                        try { const p = JSON.parse(review.images); return Array.isArray(p) ? p : []; } catch { return []; }
                      })();
                      const highlights: string[] = (() => {
                        if (!review.highlights) return [];
                        if (Array.isArray(review.highlights)) return review.highlights;
                        try { const p = JSON.parse(review.highlights as any); return Array.isArray(p) ? p : []; } catch { return []; }
                      })();
                      return (
                        <div key={review.id} style={{ paddingBottom: 24, borderBottom: '1px solid #f3f4f6' }}>
                          <Group justify="space-between" mb="sm">
                            <Group>
                              <Avatar src={review.user?.avatar || undefined} color="blue" radius="xl" size="md">
                                 {review.user?.firstName?.charAt(0)}{review.user?.lastName?.charAt(0)}
                              </Avatar>
                              <div>
                                 <Text fw={600} size="sm">{review.user?.firstName} {review.user?.lastName}</Text>
                                 <Text size="xs" c="dimmed">{dayjs(review.createdAt).format('DD/MM/YYYY')}</Text>
                              </div>
                            </Group>
                            <Group gap={4} align="center" style={{ background: '#111827', borderRadius: 6, padding: '4px 10px' }}>
                              <IconStar size={14} color="#facc15" fill="#facc15" />
                              <Text fw={700} size="sm" c="white">{review.rating.toFixed(1)}</Text>
                            </Group>
                          </Group>

                          {/* Highlights tags */}
                          {highlights.length > 0 && (
                            <Group gap={6} mb="xs">
                              {highlights.map((h, i) => (
                                <Badge key={i} variant="light" color="blue" size="sm" radius="xl">{h}</Badge>
                              ))}
                            </Group>
                          )}

                          {review.comment && (
                            <Text size="sm" lh={1.7} mb={reviewImgs.length > 0 ? 'sm' : 0}>{review.comment}</Text>
                          )}

                          {/* Review images */}
                          {reviewImgs.length > 0 && (
                            <Group gap="xs" mt="xs">
                              {reviewImgs.map((imgUrl, i) => (
                                <div key={i} style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                  <img src={imgUrl} alt={`Review ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                              ))}
                            </Group>
                          )}

                          {/* Sub-ratings */}
                          {(review.cleanlinessRating || review.serviceRating || review.locationRating || review.valueRating) && (
                            <Group gap="xl" mt="sm">
                              {review.cleanlinessRating && <Text size="xs" c="dimmed">Vệ sinh: <strong>{review.cleanlinessRating}/5</strong></Text>}
                              {review.serviceRating && <Text size="xs" c="dimmed">Dịch vụ: <strong>{review.serviceRating}/5</strong></Text>}
                              {review.locationRating && <Text size="xs" c="dimmed">Vị trí: <strong>{review.locationRating}/5</strong></Text>}
                              {review.valueRating && <Text size="xs" c="dimmed">Giá trị: <strong>{review.valueRating}/5</strong></Text>}
                            </Group>
                          )}
                        </div>
                      );
                    })}
                 </Stack>
              </Box>

           </Grid.Col>

           {/* RIGHT STICKY CONTENT */}
           <Grid.Col span={{ base: 12, md: 4 }}>
              <div style={{ position: 'sticky', top: 100 }}>
                 
                 {/* BOOKING CARD */}
                 <Card withBorder padding="xl" radius="md" shadow="sm">
                    <Group justify="space-between" align="center" mb="lg">
                      <div>
                        <Text size="sm" c="dimmed">Giá từ</Text>
                        <Group gap={4} align="baseline">
                           <Text fw={800} size="xl" style={{ color: '#111827' }}>
                             {currentSelectedRoom ? currentSelectedRoom.price.toLocaleString() : hotel.rooms?.[0]?.price?.toLocaleString() || '0' } ₫
                           </Text>
                           <Text size="sm" c="dimmed">/ đêm</Text>
                        </Group>
                      </div>
                      <Badge color="teal" variant="light" leftSection={<IconCheck size={12}/>}>
                        Tức thì
                      </Badge>
                    </Group>

                    <Grid gutter="xs" mb="md">
                      <Grid.Col span={6}>
                        <Card withBorder p="xs" radius="sm">
                           <Text size="xs" fw={600} c="dimmed">Nhận phòng</Text>
                           <Text size="sm" fw={500}>{dayjs(initCheckIn).format('DD MMM, YYYY')}</Text>
                        </Card>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Card withBorder p="xs" radius="sm">
                           <Text size="xs" fw={600} c="dimmed">Trả phòng</Text>
                           <Text size="sm" fw={500}>{dayjs(initCheckOut).format('DD MMM, YYYY')}</Text>
                        </Card>
                      </Grid.Col>
                      <Grid.Col span={12}>
                        <Card withBorder p="xs" radius="sm">
                           <Text size="xs" fw={600} c="dimmed">Khách & Phòng</Text>
                           <Text size="sm" fw={500}>2 Người lớn, 1 Phòng</Text>
                        </Card>
                      </Grid.Col>
                    </Grid>

                    <Stack gap="xs" mb="xl">
                      <Group justify="space-between">
                         <Text size="sm" c="dimmed" style={{ textDecoration: 'underline' }}>Tiền phòng</Text>
                         <Text size="sm" fw={500}>{(currentSelectedRoom?.price || 0).toLocaleString()} ₫</Text>
                      </Group>
                      <Group justify="space-between">
                         <Text size="sm" c="dimmed" style={{ textDecoration: 'underline' }}>Thuế & phí</Text>
                         <Text size="sm" fw={500}>0 ₫</Text>
                      </Group>
                      <Divider my={4} />
                      <Group justify="space-between">
                         <Text size="md" fw={700}>Tổng cộng</Text>
                         <Text size="md" fw={700}>{(currentSelectedRoom?.price || 0).toLocaleString()} ₫</Text>
                      </Group>
                    </Stack>

                    <Button 
                      fullWidth 
                      size="md" 
                      radius="md" 
                      color="teal"
                      onClick={handleBookNow}
                      disabled={!currentSelectedRoom}
                    >
                      Đặt ngay →
                    </Button>
                    <Text size="xs" c="dimmed" ta="center" mt="sm">Bạn chưa bị trừ tiền lúc này</Text>
                 </Card>

                 {/* MAP */}
                 <div id="map" style={{ marginTop: 32, borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                    <Title order={4} fw={600} p="md" bg="gray.0">Vị trí trên bản đồ</Title>
                    <iframe
                      width="100%"
                      height="250"
                      style={{ border: 0, display: 'block' }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.location + ', ' + hotel.city)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                 </div>

              </div>
           </Grid.Col>
         </Grid>

         {/* SẢN PHẨM TƯƠNG TỰ */}
         {relatedHotels && relatedHotels.length > 0 && (
           <Box mt={60}>
             <Title order={3} size="h3" mb="lg" fw={700}>Khách sạn tương tự</Title>
             <Grid gutter="md">
               {relatedHotels.slice(0, 4).map((h) => (
                 <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={h.id}>
                   <Card withBorder radius="md" p="sm" className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate(`/hotels/${h.id}`)}>
                     <Card.Section>
                       <img src={Array.isArray(h.images) ? h.images[0] : (typeof h.images === 'string' ? JSON.parse(h.images)[0] : 'https://images.unsplash.com/photo-1564501049714-8f6a89519604?w=400&q=80')} alt={h.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                     </Card.Section>
                     <Text fw={600} mt="md" lineClamp={1}>{h.name}</Text>
                     <Group justify="space-between" mt="xs">
                       <Group gap={4}>
                         <IconStar size={14} color="#10b981" fill="#10b981" />
                         <Text size="sm" fw={600} c="green.8">{h.rating.toFixed(1)}</Text>
                       </Group>
                       <Text size="sm" fw={700} c="blue">{h.rooms?.[0]?.price?.toLocaleString() || 0} ₫</Text>
                     </Group>
                   </Card>
                 </Grid.Col>
               ))}
             </Grid>
           </Box>
         )}

         {/* SẢN PHẨM ĐÃ XEM */}
         {isAuthenticated && viewedHotels && viewedHotels.length > 0 && (
           <Box mt={60}>
             <Title order={3} size="h3" mb="lg" fw={700}>Khách sạn bạn đã xem</Title>
             <Grid gutter="md">
               {viewedHotels.slice(0, 4).map((h) => (
                 <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={h.id}>
                   <Card withBorder radius="md" p="sm" className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate(`/hotels/${h.id}`)}>
                     <Card.Section>
                       <img src={Array.isArray(h.images) ? h.images[0] : (typeof h.images === 'string' ? JSON.parse(h.images)[0] : 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&q=80')} alt={h.name} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                     </Card.Section>
                     <Text fw={600} mt="md" lineClamp={1}>{h.name}</Text>
                     <Text size="xs" c="dimmed">{h.city}</Text>
                     <Group justify="space-between" mt="xs">
                       <Group gap={4}>
                         <IconStar size={14} color="#10b981" fill="#10b981" />
                         <Text size="sm" fw={600} c="green.8">{h.rating.toFixed(1)}</Text>
                       </Group>
                     </Group>
                   </Card>
                 </Grid.Col>
               ))}
             </Grid>
           </Box>
         )}

      </Container>
    </AppLayout>
  );
};
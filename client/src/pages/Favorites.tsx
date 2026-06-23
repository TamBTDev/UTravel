import React, { useEffect, useState } from 'react';
import { Container, Title, Tabs, Grid, Card, Text, Group, Box, Anchor, Loader, Center } from '@mantine/core';
import { IconHeart, IconEye, IconStar, IconMapPin } from '@tabler/icons-react';
import { AppLayout } from '../components/layout';
import apiClient from '@/lib/api-client';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppStore';

const parseImg = (val: any): string => {
  if (!val) return 'https://images.unsplash.com/photo-1564501049714-8f6a89519604?w=400&q=80';
  if (Array.isArray(val)) return val[0] || 'https://images.unsplash.com/photo-1564501049714-8f6a89519604?w=400&q=80';
  if (typeof val === 'string') {
    try {
      const p = JSON.parse(val);
      return Array.isArray(p) && p.length > 0 ? p[0] : 'https://images.unsplash.com/photo-1564501049714-8f6a89519604?w=400&q=80';
    } catch {
      return val;
    }
  }
  return 'https://images.unsplash.com/photo-1564501049714-8f6a89519604?w=400&q=80';
};

export const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [viewed, setViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        const [favRes, viewedRes] = await Promise.all([
          apiClient.get('/users/favorites'),
          apiClient.get('/users/viewed')
        ]);
        setFavorites(favRes.data.data);
        setViewed(viewedRes.data.data);
      } catch (error) {
        console.error('Lỗi tải danh sách', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, navigate]);

  const HotelCard = ({ item }: { item: any }) => {
    const hotel = item.hotel;
    return (
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }} key={item.id}>
        <Card withBorder radius="md" p="sm" className="cursor-pointer hover:shadow-md transition-all" onClick={() => navigate(`/hotels/${hotel.id}`)}>
          <Card.Section>
            <img src={parseImg(hotel.images)} alt={hotel.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
          </Card.Section>
          <Text fw={600} mt="md" lineClamp={1}>{hotel.name}</Text>
          <Group gap={4} mt={4} wrap="nowrap">
            <IconMapPin size={14} color="#6b7280" />
            <Text size="sm" c="dimmed" lineClamp={1}>{hotel.location}, {hotel.city}</Text>
          </Group>
          <Group justify="space-between" mt="xs">
            <Group gap={4}>
              <IconStar size={14} color="#10b981" fill="#10b981" />
              <Text size="sm" fw={600} c="green.8">{hotel.rating?.toFixed(1) || '0.0'}</Text>
            </Group>
          </Group>
        </Card>
      </Grid.Col>
    );
  };

  return (
    <AppLayout>
      <Container size="xl" py="xl">
        <Title order={1} size="h2" mb="xl" fw={800} style={{ color: '#111827' }}>
          Danh sách của bạn
        </Title>

        {loading ? (
          <Center h={300}><Loader color="blue" /></Center>
        ) : (
          <Tabs defaultValue="favorites" color="blue">
            <Tabs.List mb="lg">
              <Tabs.Tab value="favorites" leftSection={<IconHeart size={16} />}>
                Khách sạn Yêu thích ({favorites.length})
              </Tabs.Tab>
              <Tabs.Tab value="viewed" leftSection={<IconEye size={16} />}>
                Đã xem gần đây ({viewed.length})
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="favorites">
              {favorites.length === 0 ? (
                <Box py="xl" ta="center">
                  <IconHeart size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
                  <Text c="dimmed">Bạn chưa có khách sạn yêu thích nào.</Text>
                  <Anchor href="/hotels" mt="sm" display="inline-block" fw={500}>Khám phá ngay</Anchor>
                </Box>
              ) : (
                <Grid gutter="lg">
                  {favorites.map(fav => <HotelCard key={fav.id} item={fav} />)}
                </Grid>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="viewed">
              {viewed.length === 0 ? (
                <Box py="xl" ta="center">
                  <IconEye size={48} color="#d1d5db" style={{ marginBottom: 16 }} />
                  <Text c="dimmed">Bạn chưa xem khách sạn nào gần đây.</Text>
                  <Anchor href="/hotels" mt="sm" display="inline-block" fw={500}>Khám phá ngay</Anchor>
                </Box>
              ) : (
                <Grid gutter="lg">
                  {viewed.map(v => <HotelCard key={v.id} item={v} />)}
                </Grid>
              )}
            </Tabs.Panel>
          </Tabs>
        )}
      </Container>
    </AppLayout>
  );
};

import { Container, Title, Text, Button, Group, Card, Grid } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/layout';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      {/* Hero section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 2rem',
        borderRadius: '0.5rem',
        marginBottom: '3rem',
        textAlign: 'center',
      }}>
        <Title size="h1" style={{ color: 'white', marginBottom: '1rem' }}>
          Chào mừng đến UTravel
        </Title>
        <Text size="xl" mb="xl">
          Tìm và đặt khách sạn tuyệt vời trên toàn thế giới
        </Text>
        <Group justify="center">
          <Button size="lg" onClick={() => navigate('/hotels')}>
            Tìm kiếm khách sạn
          </Button>
          <Button size="lg" variant="white" color="blue">
            Xem ưu đãi
          </Button>
        </Group>
      </div>

      {/* Featured hotels section */}
      <Container mb="xl">
        <Title mb="xl">Khách sạn nổi bật</Title>
        <Grid>
          {[1, 2, 3, 4].map((i) => (
            <Grid.Col key={i} span={{ base: 12, md: 6, lg: 3 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Card.Section mb="sm">
                  <div style={{
                    height: '200px',
                    background: '#e5e7eb',
                    borderRadius: '0.25rem'
                  }} />
                </Card.Section>
                <Title order={4}>Khách sạn {i}</Title>
                <Text size="sm" c="dimmed" mb="md">
                  Mô tả khách sạn tuyệt vời này...
                </Text>
                <Group justify="space-between">
                  <Text fw={600}>$100/night</Text>
                  <Button size="sm">Chi tiết</Button>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    </AppLayout>
  );
};

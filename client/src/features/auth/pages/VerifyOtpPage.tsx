import { Container, Grid, Box, Title, Text, Stack } from '@mantine/core';
import { AppLayout } from '../../../components/layout';
import { AuthBenefits } from '../components';
import { OtpVerification } from '../components/OtpVerification';

export const VerifyOtpPage = () => {
  return (
    <AppLayout withContainer={false}>
      <Box
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.05,
          position: 'absolute',
          top: 70,
          left: 0,
          right: 0,
          height: 300,
          zIndex: -1,
        }}
      />

      <Container size="lg" py="xl">
        <Grid gutter="xl" align="stretch">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack gap="lg" justify="center" h="100%">
              <div>
                <Title
                  order={1}
                  size="h2"
                  fw={700}
                  mb="md"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  Bảo Mật Tối Đa
                </Title>
                <Text size="lg" c="dimmed" mb="xl">
                  Chúng tôi sử dụng xác thực qua email để đảm bảo tài khoản của bạn luôn được an toàn tuyệt đối.
                </Text>
              </div>

              <AuthBenefits />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Box h="100%" style={{ display: 'flex', alignItems: 'center' }}>
              <OtpVerification />
            </Box>
          </Grid.Col>
        </Grid>
      </Container>
    </AppLayout>
  );
};

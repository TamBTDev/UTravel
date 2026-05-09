import { Group, Button, Text, Stack } from '@mantine/core';
import { IconBrandGoogle, IconBrandFacebook } from '@tabler/icons-react';

/**
 * Social login buttons component
 * (TODO: Integrate with OAuth providers)
 */
export const SocialLoginButtons = () => {
  const handleGoogleLogin = () => {
    // TODO: Implement Google OAuth
    console.log('Google login clicked');
  };

  const handleFacebookLogin = () => {
    // TODO: Implement Facebook OAuth
    console.log('Facebook login clicked');
  };

  return (
    <Stack gap="md">
      {/* Divider with text */}
      <Group gap="xs" grow>
        <div style={{ height: 1, background: '#e9ecef' }} />
        <Text size="xs" c="dimmed" fw={500}>
          HOẶC
        </Text>
        <div style={{ height: 1, background: '#e9ecef' }} />
      </Group>

      {/* Social buttons */}
      <Group gap="md" grow>
        <Button
          variant="default"
          leftSection={<IconBrandGoogle size={16} />}
          onClick={handleGoogleLogin}
          disabled
        >
          Google
        </Button>
        <Button
          variant="default"
          leftSection={<IconBrandFacebook size={16} />}
          onClick={handleFacebookLogin}
          disabled
        >
          Facebook
        </Button>
      </Group>

      <Text size="xs" c="dimmed" ta="center">
        (Coming soon)
      </Text>
    </Stack>
  );
};

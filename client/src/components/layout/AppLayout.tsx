import { ReactNode } from 'react';
import { Box, Container } from '@mantine/core';
import { Navbar } from './Navbar';
import { AppFooter } from './Footer';

interface AppLayoutProps {
  children: ReactNode;
  withContainer?: boolean;
  containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const AppLayout = ({
  children,
  withContainer = true,
  containerSize = 'xl',
}: AppLayoutProps) => {
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <Box component="main" style={{ flex: 1, padding: '2rem 0' }}>
        {withContainer ? (
          <Container size={containerSize} px="md">
            {children}
          </Container>
        ) : (
          children
        )}
      </Box>

      <AppFooter />
    </Box>
  );
};

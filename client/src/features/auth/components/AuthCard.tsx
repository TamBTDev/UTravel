import { Card, CardProps } from '@mantine/core';
import { ReactNode } from 'react';

interface AuthCardProps extends Omit<CardProps, 'children'> {
  children: ReactNode;
}

/**
 * Card wrapper cho auth forms
 * Provides consistent styling cho tất cả auth cards
 */
export const AuthCard = ({ children, ...props }: AuthCardProps) => {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      {...props}
    >
      {children}
    </Card>
  );
};

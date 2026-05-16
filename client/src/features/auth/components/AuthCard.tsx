import { Card, CardProps } from "@mantine/core";
import { ReactNode } from "react";

interface AuthCardProps extends Omit<CardProps, "children"> {
  children: ReactNode;
}

export const AuthCard = ({ children, ...props }: AuthCardProps) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder {...props}>
      {children}
    </Card>
  );
};

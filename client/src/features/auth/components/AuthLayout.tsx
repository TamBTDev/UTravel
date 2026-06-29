import { ReactNode } from "react";
import { Grid, Box, Text, Title, Stack } from "@mantine/core";

interface AuthLayoutProps {
  children: ReactNode;
  rightPanelType: "image" | "color";
  imageUrl?: string;
  title: string;
  description: string;
}

export const AuthLayout = ({
  children,
  rightPanelType,
  imageUrl,
  title,
  description,
}: AuthLayoutProps) => {
  return (
    <Box
      style={{
        width: "100%", // Đảm bảo layout bung rộng tối đa
        minHeight: 650, // Chiều cao tối thiểu cố định để form không bị bẹp và vừa vặn màn hình
        display: "flex",
        backgroundColor: "#ffffff",

        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
        border: "1px solid #e5e7eb",
        margin: "0 auto",
        maxWidth: "1200px"
      }}
    >
      <Grid gutter={0} m={0} w="100%" align="stretch" style={{ flex: 1 }}>
        {/* Left Form Panel */}

        <Grid.Col
          span={{ base: 12, md: 5, lg: 5 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3rem 2rem",
          }}
        >
          <Box w="100%" maw={420}>
            {children}
          </Box>
        </Grid.Col>

        {/* Right Info Panel */}
        <Grid.Col
          span={{ base: 0, md: 7, lg: 7 }}
          style={{ display: "flex" }} // Ẩn trên mobile
          display={{ base: "none", md: "flex" }}
        >
          {rightPanelType === "image" && imageUrl ? (
            <Box
              style={{
                flex: 1,
                width: "100%",
                position: "relative",

                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Overlay Panel at bottom */}
              <Box
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "3rem",
                  background: "linear-gradient(to top, rgba(15,23,42,0.95), rgba(15,23,42,0.6) 50%, transparent)",
                  color: "white",
                }}
              >
                <Title order={2} size="h1" c="white" mb="sm" fw={700}>
                  {title}
                </Title>
                <Text size="lg" style={{ opacity: 0.9 }}>
                  {description}
                </Text>
              </Box>
            </Box>
          ) : (
            <Box
              style={{
                flex: 1,
                width: "100%",
                backgroundColor: "#0f172a", // Màu nền tối

                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "4rem",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  position: "absolute",
                  top: "-20%",
                  right: "-10%",
                  width: "50%",
                  height: "50%",
                  background: "radial-gradient(circle, rgba(11,99,214,0.15) 0%, transparent 70%)",
                  borderRadius: "50%",
                }}
              />
              <Stack gap="sm" style={{ zIndex: 1 }}>
                <Title order={2} size="h1" c="white" fw={700}>
                  {title}
                </Title>
                <Text size="lg" style={{ color: "#94a3b8", maxWidth: 500 }}>
                  {description}
                </Text>
              </Stack>
            </Box>
          )}
        </Grid.Col>
      </Grid>
    </Box>
  );
};

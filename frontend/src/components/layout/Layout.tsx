import { Box, Container } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Header />

      <Container sx={{ flex: 1, py: 4 }}>
        {children}
      </Container>

      <Footer />
    </Box>
  );
}
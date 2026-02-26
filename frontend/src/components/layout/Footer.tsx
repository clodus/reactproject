import { Box, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Box
      sx={{
        mt: "auto",
        py: 3,
        textAlign: "center",
        backgroundColor: "#1976d2",
        color: "white",
      }}
    >
      <Typography variant="body2">
        © {new Date().getFullYear()} PHand
      </Typography>
    </Box>
  );
}
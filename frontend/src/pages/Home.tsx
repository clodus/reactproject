import {Typography,Button,Container,Box,Grid,Paper} from "@mui/material";

export default function HomePage() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      
      {/* HERO SECTION */}
      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          py: 8,
          textAlign: "center",
        }}
      >
        <Container>
          <Typography variant="h3" gutterBottom>
            Bienvenue sur PHand 🚀
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Gérez vos utilisateurs et vos projets simplement.
          </Typography>
          <Button variant="contained" size="large" sx={{ mt: 3 }}>
            Commencer
          </Button>
        </Container>
      </Box>

      {/* FEATURES */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4}>
          <Grid>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6">Gestion Utilisateurs</Typography>
              <Typography variant="body2" color="text.secondary">
                Créez et gérez vos utilisateurs facilement.
              </Typography>
            </Paper>
          </Grid>

          <Grid>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6">Gestion Projets</Typography>
              <Typography variant="body2" color="text.secondary">
                Associez des utilisateurs à plusieurs projets.
              </Typography>
            </Paper>
          </Grid>

          <Grid>
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6">Performance</Typography>
              <Typography variant="body2" color="text.secondary">
                Architecture moderne avec FastAPI & React.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

    </Box>
  );
}
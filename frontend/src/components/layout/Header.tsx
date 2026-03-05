import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <AppBar 
      position="static"
      sx={{ width: '100%', boxShadow: 'none' }} // width 100% et pas d'ombre si tu veux
    >
      <Toolbar sx={{ width: '100%', px: '0 !important'}}> {/* px:0 supprime padding horizontal */}
        <Typography variant="h6" sx={{ mr: 5, ml: 5 }}>
          PHand
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          <Button color="inherit" component={Link} to="/resources">
            Resources
          </Button>
          <Button color="inherit" component={Link} to="/jobs">
            Jobs
          </Button>
          <Button color="inherit" component={Link} to="/projects">
            Projects
          </Button>
          <Button color="inherit" component={Link} to="/requests">
            Requests
          </Button>
          <Button color="inherit" component={Link} to="/roadmap">
            Roadmap
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
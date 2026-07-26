import React from "react";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return "/";

    switch (user.role) {
      case "ORG_ADMIN":
        return "/admin";
      case "TEACHER":
        return "/teacher";
      case "STUDENT":
        return "/student";
      default:
        return "/";
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h5"
          sx={{ flexGrow: 1, fontFamily: "Poppins" }}
        >
          LearnSphere
        </Typography>

        {!user ? (
          <Button
            color="inherit"
            component={Link}
            to="/login"
            sx={{ fontFamily: "Poppins" }}
          >
            Login
          </Button>
        ) : (
          <>
            <Button
              color="inherit"
              component={Link}
              to={getDashboardLink()}
            >
              Dashboard
            </Button>

            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

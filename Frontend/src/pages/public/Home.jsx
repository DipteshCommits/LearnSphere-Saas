import React from "react";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import ClassIcon from "@mui/icons-material/Class";
import PeopleIcon from "@mui/icons-material/People";
import QuizIcon from "@mui/icons-material/Quiz";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

// Styled Components
const HeroSection = styled(Box)({
    background: "linear-gradient(135deg, #1976D2 30%, #FF9800 90%)",
    color: "#fff",
    textAlign: "center",
    padding: "80px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh"
});

const FeatureCard = styled(Box)({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    transition: "0.3s",
    "&:hover": {
        transform: "translateY(-5px)",
    },
});

const CTAButton = styled(Button)({
    marginTop: "20px",
    backgroundColor: "#FF9800",
    "&:hover": {
        backgroundColor: "#E68900",
    },
});

const Home = () => {
    const navigate = useNavigate("/");

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <HeroSection
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                sx={{ px: { xs: 2, md: 6 }, textAlign: "center" }} // ✅ Responsive padding
            >
                <Typography style={{ fontFamily: "Poppins" }} variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
                    Empower Schools, Enable Students
                </Typography>
                <Typography style={{ fontFamily: "Poppins" }} variant="h6" sx={{ mt: 2, fontSize: { xs: "1rem", md: "1.5rem" } }}>
                    A modern platform for institutes to manage courses, students, and exams efficiently.
                </Typography>
                <Box sx={{ mt: 4, display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                    <CTAButton style={{ fontFamily: "Poppins" }} variant="contained" size="large">
                        Get Started
                    </CTAButton>
                    {/* <CTAButton variant="contained" size="large" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </CTAButton> */}
                </Box>
            </HeroSection>

            {/* Features Section */}
            <Container sx={{ mt: 6 }}>
                <Typography style={{ fontFamily: "Poppins" }} variant="h4" textAlign="center" fontWeight="bold" sx={{ mb: 4 }}>
                    Key Features
                </Typography>
                <Grid container spacing={3} justifyContent="center">
                    {[
                        { icon: <SchoolIcon fontSize="large" />, title: "Institute Management", desc: "Easily manage your institute's data and operations." },
                        { icon: <ClassIcon fontSize="large" />, title: "Course Enrollment", desc: "Let students enroll in the courses you offer." },
                        { icon: <PeopleIcon fontSize="large" />, title: "Student Portal", desc: "Students can track progress and access materials." },
                        { icon: <QuizIcon fontSize="large" />, title: "Exam Portal", desc: "Conduct online exams and manage results." },
                    ].map((feature, index) => (
                        <Grid key={index}>
                            <FeatureCard component={motion.div} whileHover={{ scale: 1.05 }}>
                                {feature.icon}
                                <Typography style={{ fontFamily: "Poppins" }} variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
                                    {feature.title}
                                </Typography>
                                <Typography style={{ fontFamily: "Poppins" }} sx={{ mt: 1 }}>{feature.desc}</Typography>
                            </FeatureCard>
                        </Grid>
                    ))}
                </Grid>
            </Container>


            {/* Call to Action Section */}
            <Box sx={{ textAlign: "center", mt: 6, mb: 6, px: 2 }}>
                <Typography style={{ fontFamily: "Poppins" }} variant="h5" fontWeight="bold">
                    Ready to Get Started?
                </Typography>
                <Typography style={{ fontFamily: "Poppins" }} sx={{ mt: 1 }}>Join now and streamline your school management.</Typography>
                <CTAButton style={{ fontFamily: "Poppins" }} onClick={() => navigate("/signup")} variant="contained" size="large">Sign Up Now</CTAButton>
            </Box>

        </>
    );
};

export default Home;

import {
    Box,
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";
import {
    Dashboard,
    Business,
    School,
    MenuBook,
    Groups,
    Person,
    People,
    AssignmentInd,
    EventNote,
    FactCheck,
    Payments,
    Campaign,
    BarChart,
    AdminPanelSettings,
    Settings,
    ExpandLess,
    ExpandMore,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { useState } from "react";

const menuItems = [
    {
        text: "Dashboard",
        icon: <Dashboard />,
        path: "/admin",
    },

    {
        text: "School",
        icon: <Business />,
        children: [
            {
                text: "School Profile",
                path: "/admin/school-profile",
            },
            {
                text: "Academic Years",
                path: "/admin/academic-years",
            },
        ],
    },

    {
        text: "Academic Structure",
        icon: <School />,
        children: [
            {
                text: "Grades",
                path: "/admin/grades",
            },
            {
                text: "Sections",
                path: "/admin/sections",
            },
            {
                text: "Subjects",
                comingSoon: true,
            },
        ],
    },

    {
        text: "Students",
        icon: <People />,
        children: [
            {
                text: "Students",
                path: "/admin/students",
            },
            {
                text: "Admissions",
                path: "/admin/admissions",
            },
            {
                text: "Enrollments",
                comingSoon: true,
            },
        ],
    },

    {
        text: "Teachers",
        icon: <Person />,
        children: [
            {
                text: "Teachers",
                comingSoon: true,
            },
            {
                text: "Departments",
                comingSoon: true,
            },
            {
                text: "Assignments",
                comingSoon: true,
            },
        ],
    },

    {
        text: "Academics",
        icon: <MenuBook />,
        children: [
            {
                text: "Timetable",
                comingSoon: true,
            },
            {
                text: "Attendance",
                comingSoon: true,
            },
            {
                text: "Homework",
                comingSoon: true,
            },
        ],
    },

    {
        text: "Examinations",
        icon: <FactCheck />,
        children: [
            {
                text: "Exams",
                comingSoon: true,
            },
            {
                text: "Marks",
                comingSoon: true,
            },
            {
                text: "Report Cards",
                comingSoon: true,
            },
        ],
    },

    {
        text: "Finance",
        icon: <Payments />,
        children: [
            {
                text: "Fees",
                comingSoon: true,
            },
            {
                text: "Payments",
                comingSoon: true,
            },
        ],
    },

    {
        text: "Communication",
        icon: <Campaign />,
        children: [
            {
                text: "Announcements",
                comingSoon: true,
            },
            {
                text: "Messages",
                comingSoon: true,
            },
        ],
    },

    {
        text: "Reports",
        icon: <BarChart />,
        comingSoon: true,
    },

    {
        text: "Administration",
        icon: <AdminPanelSettings />,
        children: [
            {
                text: "Users",
                comingSoon: true,
            },
            {
                text: "Roles & Permissions",
                comingSoon: true,
            },
            {
                text: "Audit Logs",
                comingSoon: true,
            },
            {
                text: "Settings",
                comingSoon: true,
            },
        ],
    },
];

const AdminSidebar = ({ width }) => {
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (menu) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menu]: !prev[menu],
        }));
    };

    return (
        <Box
            sx={{
                width,
                position: "fixed",
                height: "100vh",
                bgcolor: "#fff",
                borderRight: "1px solid #e5e7eb",
                overflowY: "auto",
                p: 2,
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    mb: 3,
                }}
            >
                LearnSphere
            </Typography>

            <List disablePadding>
                {menuItems.map((item) => (
                    <Box key={item.text}>
                        {item.children ? (
                            <>
                                <ListItemButton
                                    onClick={() => toggleMenu(item.text)}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                    }}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>

                                    <ListItemText primary={item.text} />

                                    {openMenus[item.text] ? (
                                        <ExpandLess />
                                    ) : (
                                        <ExpandMore />
                                    )}
                                </ListItemButton>

                                <Collapse
                                    in={openMenus[item.text]}
                                    timeout="auto"
                                    unmountOnExit
                                >
                                    <List disablePadding>
                                        {item.children.map((child) => (
                                            <ListItemButton
                                                key={child.text}
                                                component={child.comingSoon ? "div" : NavLink}
                                                to={child.comingSoon ? undefined : child.path}
                                                disabled={child.comingSoon}
                                                sx={{
                                                    pl: 7,
                                                    borderRadius: 2,
                                                    mb: 0.5,
                                                    ...(child.comingSoon && {
                                                        opacity: 0.65,
                                                        cursor: "default",
                                                    }),

                                                    "&.active": {
                                                        bgcolor: "#e0f2fe",
                                                        color: "#0284c7",
                                                        fontWeight: 600,
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={child.text}
                                                    secondary={child.comingSoon ? "Coming soon" : undefined}
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            </>
                        ) : (
                            <ListItemButton
                                component={item.comingSoon ? "div" : NavLink}
                                to={item.comingSoon ? undefined : item.path}
                                disabled={item.comingSoon}
                                sx={{
                                    borderRadius: 2,
                                    mb: 0.5,
                                    ...(item.comingSoon && {
                                        opacity: 0.65,
                                        cursor: "default",
                                    }),

                                    "&.active": {
                                        bgcolor: "#e0f2fe",
                                        color: "#0284c7",

                                        "& .MuiListItemIcon-root": {
                                            color: "#0284c7",
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>

                                <ListItemText
                                    primary={item.text}
                                    secondary={item.comingSoon ? "Coming soon" : undefined}
                                />
                            </ListItemButton>
                        )}
                    </Box>
                ))}
            </List>
        </Box>
    );
};

export default AdminSidebar;
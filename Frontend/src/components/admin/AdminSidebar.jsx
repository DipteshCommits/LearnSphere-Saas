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
                path: "/admin/subjects",
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
                path: "/admin/enrollments",
            },
        ],
    },

    {
        text: "Teachers",
        icon: <Person />,
        children: [
            {
                text: "Teachers",
                path: "/admin/teachers",
            },
            {
                text: "Departments",
                path: "/admin/departments",
            },
            {
                text: "Assignments",
                path: "/admin/teacher-assignments",
            },
        ],
    },

    {
        text: "Academics",
        icon: <MenuBook />,
        children: [
            {
                text: "Timetable",
                path: "/admin/timetable",
            },
            {
                text: "Attendance",
                path: "/admin/attendance",
            },
            {
                text: "Homework",
                path: "/admin/homework",
            },
        ],
    },

    {
        text: "Examinations",
        icon: <FactCheck />,
        children: [
            {
                text: "Exams",
                path: "/admin/exams",
            },
            {
                text: "Marks",
                path: "/admin/marks",
            },
            {
                text: "Report Cards",
                path: "/admin/report-cards",
            },
        ],
    },

    {
        text: "Finance",
        icon: <Payments />,
        children: [
            {
                text: "Fees",
                path: "/admin/fees",
            },
            {
                text: "Payments",
                path: "/admin/payments",
            },
        ],
    },

    {
        text: "Communication",
        icon: <Campaign />,
        children: [
            {
                text: "Announcements",
                path: "/admin/announcements",
            },
            {
                text: "Messages",
                path: "/admin/messages",
            },
        ],
    },

    {
        text: "Reports",
        icon: <BarChart />,
        path: "/admin/reports",
    },

    {
        text: "Administration",
        icon: <AdminPanelSettings />,
        children: [
            {
                text: "Users",
                path: "/admin/users",
            },
            {
                text: "Roles & Permissions",
                path: "/admin/roles",
            },
            {
                text: "Audit Logs",
                path: "/admin/audit-logs",
            },
            {
                text: "Settings",
                path: "/admin/settings",
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
                                                component={NavLink}
                                                to={child.path}
                                                sx={{
                                                    pl: 7,
                                                    borderRadius: 2,
                                                    mb: 0.5,

                                                    "&.active": {
                                                        bgcolor: "#e0f2fe",
                                                        color: "#0284c7",
                                                        fontWeight: 600,
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={child.text}
                                                />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Collapse>
                            </>
                        ) : (
                            <ListItemButton
                                component={NavLink}
                                to={item.path}
                                sx={{
                                    borderRadius: 2,
                                    mb: 0.5,

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

                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        )}
                    </Box>
                ))}
            </List>
        </Box>
    );
};

export default AdminSidebar;
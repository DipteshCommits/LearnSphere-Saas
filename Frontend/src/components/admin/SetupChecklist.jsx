import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
} from "@mui/material";
import { CheckCircle, RadioButtonUnchecked } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const SetupChecklist = ({checklist}) => {
    console.log("Checklist data:", checklist);
    const navigate = useNavigate();

    const items = [
        {
            label: "Create Academic Year",
            done: checklist.academicYear,
            path: "/admin/academic-years",
        },
        {
            label: "Add Grades",
            done: checklist.grades,
            path: "/admin/grades",
        },
        {
            label: "Add Sections",
            done: checklist.sections,
            path: "/admin/sections",
        },
        {
            label: "Add Students",
            done: checklist.students,
            path: "/admin/students",
        },
    ];

    return (
        <Card sx={{ bgcolor: "#ffffff" }}>
            <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Setup Checklist
                </Typography>

                <List>
                    {items.map((item) => (
                        <ListItem
                            key={item.label}
                            secondaryAction={
                                !item.done && (
                                    <Button
                                        size="small"
                                        onClick={() => navigate(item.path)}
                                    >
                                        Go
                                    </Button>
                                )
                            }
                        >
                            <ListItemIcon>
                                {item.done ? (
                                    <CheckCircle color="success" />
                                ) : (
                                    <RadioButtonUnchecked color="disabled" />
                                )}
                            </ListItemIcon>

                            <ListItemText primary={item.label} />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default SetupChecklist;

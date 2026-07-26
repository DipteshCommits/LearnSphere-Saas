import { useEffect, useState } from "react";
import axios from "../../../utils/axios";
import { Typography, Button } from "@mui/material";

import StudentsTable from '../../../components/admin/students/StudentsTable';
import StudentSearchBar from '../../../components/admin/students/StudentSearchBar';
import { useNavigate } from 'react-router-dom';

export default function StudentsList() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await axios.get("/org-admin/students");
                setStudents(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }

        }

        fetchStudents();
    }, []);


    return (
        <>
            <Typography variant="h4" gutterBottom>
                Students
            </Typography>


            <StudentSearchBar />

            <Button variant="contained" sx={{ mb: 2 }} onClick={() => navigate("/admin/students/new")}>
                ➕ Add Student
            </Button>

            <StudentsTable students={students} loading={loading} />
        </>
    );


}
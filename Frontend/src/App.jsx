import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Home from "./pages/public/Home";
import LoginSelectType from "./pages/login/LoginSelectType";
import LoginSelectRole from "./pages/login/LoginSelectRole";
import LoginForm from "./pages/login/LoginForm";

import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Students from "./pages/admin/Students";
import SchoolProfile from "./pages/admin/school/schoolProfile";
import AcademicYears from "./pages/admin/AcademicYears";
import Grades from "./pages/admin/Grades";
import Sections from "./pages/admin/Sections";
import AddStudent from "./pages/admin/students/AddStudent";
import ChangePassword from "./pages/login/ChangePassword";
import StudentProfile from "./pages/admin/students/StudentProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginSelectType />} />
        <Route path="/login/:type" element={<LoginSelectRole />} />
        <Route path="/login/:type/:role" element={<LoginForm />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* Admin (Protected + Layout) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ORG_ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:studentId" element={<StudentProfile />} />
          <Route path="admissions" element={<AddStudent />} />
          <Route path="school-profile" element={<SchoolProfile />} />
          <Route path="academic-years" element={<AcademicYears />} />
          <Route path="grades" element={<Grades />} />
          <Route path="sections" element={<Sections />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

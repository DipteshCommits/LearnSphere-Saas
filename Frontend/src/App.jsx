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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginSelectType />} />
        <Route path="/login/:type" element={<LoginSelectRole />} />
        <Route path="/login/:type/:role" element={<LoginForm />} />

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
          <Route path="school-profile" element={<SchoolProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

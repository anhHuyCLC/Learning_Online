import Home from "./pages/Home.tsx";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import TeacherDashboard from "./pages/TeacherDashboard.tsx";
import StudentEnrollments from "./pages/StudentEnrollments.tsx";
import UserProfile from "./pages/UserProfile.tsx";

import "./styles/vars.css";
import "./styles/home.css";
import "./styles/auth.css";
import "./styles/dashboard.css";
import "./styles/components.css";
import "./styles/enrollments.css";
import "./styles/userProfile.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import CourseDetail from "./pages/CourseDetail.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/my-enrollments" element={<StudentEnrollments />} />
        <Route path="/profile" element={<UserProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

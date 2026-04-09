import Home from "./pages/Home.tsx";
import Register from "./pages/Register.tsx";
import Login from "./pages/Login.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import TeacherDashboard from "./pages/TeacherDashboard.tsx";
import StudentEnrollments from "./pages/StudentEnrollments.tsx";
import UserProfile from "./pages/UserProfile.tsx";
import QuizPage from "./pages/QuizPage.tsx";
import CourseLearningPage from "./pages/CourseLearningPage.tsx";
import LessonPage from "./pages/LessonPage.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import TeacherLayout from "./components/TeacherLayout.tsx";
import AdminLayout from "./components/AdminLayout.tsx";

import "./styles/vars.css";
import "./styles/home.css";
import "./styles/auth.css";
import "./styles/dashboard.css";
import "./styles/components.css";
import "./styles/enrollments.css";
import "./styles/userProfile.css";
import "./styles/courseLearning.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import CourseDetail from "./pages/CourseDetail.tsx";
import TeacherCourses from "./pages/TeacherCourses.tsx";
import TeacherCourseForm from "./pages/TeacherCourseForm.tsx";
import AdminCourses from "./pages/AdminCourses.tsx";
import TeacherCourseStudents from "./pages/TeacherCourseStudents.tsx";
import TeacherStudents from "./pages/TeacherStudents.tsx";
import AdminCourseForm from "./pages/AdminCourseForm.tsx";
import TeacherQuizzes from "./pages/TeacherQuizzes.tsx";
import TeacherQuizEditor from "./pages/TeacherQuizEditor.tsx";
import Settings from "./pages/Settings.tsx";
import AdminUsers from "./pages/AdminUsers.tsx";
import AdminCategories from "./pages/AdminCategories.tsx";
import AdminTransactions from "./pages/AdminTransactions.tsx";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/course/:id" element={<CourseDetail />} />
        <Route path="/settings" element={<Settings /> } />
        {/* Protected Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'teacher', 'admin']} />}>
          <Route path="/courses/:id/learn" element={<CourseLearningPage />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonPage />} />
          <Route path="/my-enrollments" element={<StudentEnrollments />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/quiz/lesson/:lessonId" element={<QuizPage />} />
        </Route>

        {/* Protected Teacher Routes */}
        <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
          <Route element={<TeacherLayout />}>
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/courses" element={<TeacherCourses />} />
            <Route path="/teacher/students" element={<TeacherStudents />} />
            <Route path="/teacher/quizzes" element={<TeacherQuizzes />} />
            <Route path="/teacher/quizzes/lesson/:lessonId" element={<TeacherQuizEditor />} />
            <Route path="/teacher/courses/new" element={<TeacherCourseForm />} />
            <Route path="/teacher/courses/edit/:id" element={<TeacherCourseForm />} />
            <Route path="/teacher/courses/:courseId/students" element={<TeacherCourseStudents />} />
            {/* Add more teacher routes here later */}
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/courses/new" element={<AdminCourseForm />} />
            <Route path="/admin/courses/edit/:id" element={<AdminCourseForm />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/transactions" element={<AdminTransactions />} />
            
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

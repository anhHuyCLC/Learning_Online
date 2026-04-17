import DashboardLayout from "./DashboardLayout";

const TeacherLayout = () => {
  const teacherNavLinks = [
    { 
      name: "Tổng quan", 
      path: "/teacher", 
      icon: "📊" 
    },
    { 
      name: "Khóa học của tôi", 
      path: "/teacher/courses", 
      icon: "📚" 
    },
    { 
      name: "Học viên", 
      path: "/teacher/students", 
      icon: "👥" 
    },
    { 
      name: "Bài kiểm tra", 
      path: "/teacher/quizzes", 
      icon: "✍️" 
    },
  ];

  return (
    <DashboardLayout 
      roleName="Teacher" 
      logoLetter="T" 
      navLinks={teacherNavLinks} 
    />
  );
};

export default TeacherLayout;
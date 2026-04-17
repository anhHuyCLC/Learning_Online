import DashboardLayout from "./DashboardLayout";

const AdminLayout = () => {
  const links = [
    { name: "Tổng quan", path: "/admin", icon: "📊" },
    { name: "Quản lý người dùng", path: "/admin/users", icon: "👥" },
    { name: "Kiểm duyệt khóa học", path: "/admin/courses", icon: "📚" },
    { name: "Danh mục", path: "/admin/categories", icon: "📑" },
    { name: "Giao dịch", path: "/admin/transactions", icon: "💳" },
  ];
  return <DashboardLayout roleName="Admin" logoLetter="A" navLinks={links} />;
};
export default AdminLayout;
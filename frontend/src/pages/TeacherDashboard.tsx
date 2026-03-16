import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store";
import { logout } from "../features/authSlice";
import "../styles/dashboard.css";
import { useState } from "react";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (user?.role !== "teacher") {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-form-side">
            <div>
              <h1>Truy cập bị từ chối</h1>
              <p className="auth-subtitle">
                Bạn không có quyền truy cập trang này. Chỉ giáo viên mới có thể xem bảng điều khiển này.
              </p>
              <button
                className="auth-button auth-btn-primary"
                onClick={() => navigate("/")}
                style={{ marginTop: "24px" }}
              >
                Quay lại trang chủ
              </button>
            </div>
          </div>
          <div className="auth-image-side">
            <div className="image-content">
              <div className="image-icon">🔒</div>
              <h2>Bảo mật</h2>
              <p>Trang này được bảo vệ và chỉ dành cho giáo viên.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const stats = [
    { icon: "📚", title: "Khóa Học Của Tôi", value: "5", meta: "2 khóa hoạt động" },
    { icon: "👥", title: "Tổng Học Viên", value: "342", meta: "+45 tuần này" },
    { icon: "⭐", title: "Đánh Giá Trung Bình", value: "4.7/5", meta: "từ 156 đánh giá" },
    { icon: "📊", title: "Tỉ Lệ Hoàn Thành", value: "68%", meta: "+8% so với tháng trước" },
  ];

  const myCourses = [
    { id: 1, name: "React Mastery", students: 89, rating: 4.8 },
    { id: 2, name: "Node.js Backend", students: 76, rating: 4.6 },
    { id: 3, name: "TypeScript Advanced", students: 63, rating: 4.9 },
    { id: 4, name: "Web Security", students: 54, rating: 4.7 },
    { id: 5, name: "API Design", students: 60, rating: 4.5 },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <h3 style={{ color: "white", margin: 0 }}>Giảng Dạy</h3>
          </div>
          <ul className="sidebar-menu">
            <li className="sidebar-item">
              <a href="#" className="sidebar-link active">
                <span className="sidebar-icon">📊</span>
                Bảng Điều Khiển
              </a>
            </li>
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                <span className="sidebar-icon">📚</span>
                Khóa Học Của Tôi
              </a>
            </li>
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                <span className="sidebar-icon">✍️</span>
                Tạo Khóa Học
              </a>
            </li>
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                <span className="sidebar-icon">💬</span>
                Tin Nhắn
              </a>
            </li>
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                <span className="sidebar-icon">⚙️</span>
                Cài Đặt
              </a>
            </li>
          </ul>
        </aside>

        {/* Header */}
        <header className="dashboard-header">
          <h1 className="header-title">Bảng Điều Khiển Giáo Viên</h1>
          <div className="header-actions">
            <div className="user-menu">
              <div className="user-avatar">{user?.name?.charAt(0).toUpperCase() || "T"}</div>
              <span className="user-name">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: "#ef4444",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Đăng Xuất
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          <h1 className="main-title">Chào mừng, {user?.name}!</h1>
          <p className="main-subtitle">Quản lý khóa học và học viên của bạn</p>

          {/* Stats Grid */}
          <div className="dashboard-grid">
            {stats.map((stat, index) => (
              <div key={index} className="widget-card">
                <div className="widget-header">
                  <div>
                    <div className="widget-title">{stat.title}</div>
                    <div className="widget-meta">{stat.meta}</div>
                  </div>
                  <div className="widget-icon">{stat.icon}</div>
                </div>
                <div className="widget-value">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* My Courses */}
          <div className="table-container">
            <div style={{ padding: "24px" }}>
              <h2 style={{ marginTop: 0, marginBottom: "24px" }}>Khóa Học Của Tôi</h2>
              <table className="dashboard-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Tên Khóa Học</th>
                    <th>Số Học Viên</th>
                    <th>Đánh Giá</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {myCourses.map((course) => (
                    <tr key={course.id}>
                      <td>
                        <strong>{course.name}</strong>
                      </td>
                      <td>{course.students} học viên</td>
                      <td>
                        <strong>⭐ {course.rating}/5</strong>
                      </td>
                      <td>
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            color: "#0066ff",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontWeight: "600",
                          }}
                        >
                          Chỉnh Sửa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Section */}
          <div className="form-section">
            <h2 style={{ marginTop: 0 }}>Tạo Khóa Học Mới</h2>
            <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
              Chia sẻ kiến thức của bạn và tạo một khóa học mới cho cộng đồng
            </p>
            <button
              style={{
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                color: "white",
                border: "none",
                padding: "12px 32px",
                borderRadius: "9999px",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              + Tạo Khóa Học
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

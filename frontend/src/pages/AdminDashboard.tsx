import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store";
import { logout } from "../features/authSlice";
import "../styles/dashboard.css";
import { useState } from "react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (user?.role !== "admin") {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-form-side">
            <div>
              <h1>Truy cập bị từ chối</h1>
              <p className="auth-subtitle">
                Bạn không có quyền truy cập trang này. Chỉ quản trị viên mới có thể xem bảng điều khiển này.
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
              <p>Trang này được bảo vệ và chỉ dành cho quản trị viên.</p>
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
    { icon: "👥", title: "Tổng Người Dùng", value: "1,234", meta: "+12% tuần này" },
    { icon: "📚", title: "Khóa Học", value: "48", meta: "+3 khóa mới" },
    { icon: "📊", title: "Tổng Enroll", value: "5,890", meta: "+234 hôm nay" },
    { icon: "⭐", title: "Đánh Giá Trung Bình", value: "4.8/5", meta: "từ 1,200 đánh giá" },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <h3 style={{ color: "white", margin: 0 }}>Quản Lý</h3>
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
                <span className="sidebar-icon">👥</span>
                Quản Lý Người Dùng
              </a>
            </li>
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                <span className="sidebar-icon">📚</span>
                Quản Lý Khóa Học
              </a>
            </li>
            <li className="sidebar-item">
              <a href="#" className="sidebar-link">
                <span className="sidebar-icon">📋</span>
                Báo Cáo
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
          <h1 className="header-title">Bảng Điều Khiển Quản Trị Viên</h1>
          <div className="header-actions">
            <div className="user-menu">
              <div className="user-avatar">{user?.name?.charAt(0).toUpperCase() || "A"}</div>
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
          <p className="main-subtitle">Xem các thống kê và quản lý hệ thống của bạn</p>

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

          {/* Users Table */}
          <div className="table-container">
            <div className="dashboard-table" style={{ padding: "24px" }}>
              <h2 style={{ marginTop: 0, marginBottom: "24px" }}>Người Dùng Gần Đây</h2>
              <table className="dashboard-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Vai Trò</th>
                    <th>Ngày Tạo</th>
                    <th>Trạng Thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Trần Minh Anh</td>
                    <td>minh.anh@example.com</td>
                    <td>Student</td>
                    <td>2026-03-10</td>
                    <td>
                      <span className="status-badge status-active">Hoạt Động</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Nguyễn Văn Bình</td>
                    <td>van.binh@example.com</td>
                    <td>Teacher</td>
                    <td>2026-03-08</td>
                    <td>
                      <span className="status-badge status-active">Hoạt Động</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Phạm Thị Cúc</td>
                    <td>thi.cuc@example.com</td>
                    <td>Student</td>
                    <td>2026-03-05</td>
                    <td>
                      <span className="status-badge status-inactive">Không Hoạt Động</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

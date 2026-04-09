import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/store";
import { getStudentEnrollments } from "../features/enrollmentSlice";
import { Header } from "../components/Header";
import { useNavigate } from "react-router-dom";
import "../styles/userProfile.css";

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { enrollments, loading, error } = useAppSelector(
    (state) => state.enrollment
  );
  const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    dispatch(getStudentEnrollments());
  }, [dispatch, user, navigate]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      active: "Đang học",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    return `status-${status}`;
  };

  return (
    <div className="user-profile-page">
      <Header title="Hồ Sơ Cá Nhân" subtitle="Quản lý thông tin và khóa học của bạn" />

      <div className="profile-container">
        {/* User Info Section */}
        <div className="profile-section">
          <div className="user-info-card">
            <div className="user-avatar">
              <img
                src={
                  user.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
                }
                alt={user.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;
                }}
              />
            </div>
            <div className="user-details">
              <h2 className="user-name">{user.name}</h2>
              <p className="user-email">{user.email}</p>
              <div className="user-role">
                <span className={`role-badge role-${user.role.toLowerCase()}`}>
                  {user.role === "admin"
                    ? "Quản trị viên"
                    : user.role === "teacher"
                      ? "Giáo viên"
                      : "Học viên"}
                </span>
              </div>
              <div className="user-balance" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--f8-primary)' }}>
                  Số dư: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.balance || 0)}
                </span>
                <button className="btn-secondary btn-sm" onClick={() => navigate("/top-up")}>
                  Nạp tiền
                </button>
              </div>
            </div>
            <button
              className="btn-edit-profile"
              onClick={() => navigate("/settings")}
            >
              Chỉnh sửa hồ sơ
            </button>
          </div>
        </div>

        {/* Enrolled Courses Section */}
        <div className="profile-section">
          <h3 className="section-title">
            <span className="icon">📚</span>
            Khóa Học Đã Đăng Ký
          </h3>

          {error && (
            <div className="error-banner">
              <p>{error}</p>
            </div>
          )}

          {loading ? (
            <div className="loading-state">
              <p>Đang tải dữ liệu...</p>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <p className="empty-title">Bạn chưa đăng ký khóa học nào</p>
              <p className="empty-desc">
                Hãy khám phá các khóa học thú vị từ trang chủ
              </p>
              <button
                className="btn-primary"
                onClick={() => {
                  navigate("/")
                  setTimeout(() => {
                    document
                      .getElementById("courses-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }, 100)
                }}
              >
                Xem các khóa học
              </button>
            </div>
          ) : (
            <div className="courses-grid">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="course-card">
                  <div className="course-image">
                    <img
                      src={
                        enrollment.course_image
                          ? `${API_URL}${enrollment.course_image}`
                          : "https://via.placeholder.com/300x200?text=Course"
                      }
                      alt={enrollment.course_name}
                    />
                    <div className={`status-badge ${getStatusClass(enrollment.status)}`}>
                      {getStatusLabel(enrollment.status)}
                    </div>
                  </div>
                  <div className="course-info">
                    <h4 className="course-title">{enrollment.course_name}</h4>
                    <p className="course-desc">{enrollment.course_description}</p>

                    <div className="course-meta">
                      <div className="meta-item">
                        <span className="meta-label">Giáo viên:</span>
                        <span className="meta-value">{enrollment.teacher_name}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Giá khóa học:</span>
                        <span className="meta-value">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(enrollment.course_price) || 0)}
                        </span>
                      </div>
                    </div>

                    <div className="progress-container">
                      <div className="progress-label">
                        <span>Tiến độ học tập</span>
                        <span className="progress-percent">
                          {Math.round(Number(enrollment.progress) || 0)}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.round(Number(enrollment.progress) || 0)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="course-date">
                      <span className="icon">📅</span>
                      Đăng ký: {new Date(enrollment.enrolled_at).toLocaleDateString("vi-VN")}
                    </div>

                    <button
                      className="btn-continue"
                      onClick={() => navigate(`/courses/${enrollment.course_id}/learn`)}
                    >
                      Tiếp tục học →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

export default UserProfile;

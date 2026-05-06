import { useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.png";
import "../styles/home.css";
import { useAppDispatch, useAppSelector } from "../app/store";
import { useEffect } from "react";
import { getCourses } from "../features/courseSlice";
import { logout } from "../features/authSlice";
import { type Courses } from "../type/coursesType";
import type { RootState } from "../app/store";

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const API_URL = "http://localhost:3000";
  const DEFAULT_IMAGE = "https://via.placeholder.com/300x200?text=Course";

  const user = useAppSelector((state: RootState) => state.auth.user);
  const { courses, loading, error } = useAppSelector((state) => state.courses);
  const isLogin = !!user;

  // Luôn fetch danh sách khóa học bất kể trạng thái đăng nhập
  useEffect(() => {
    dispatch(getCourses());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const features = [
    {
      icon: "🎓",
      title: "Học Tập Tương Tác",
      description: "Tham gia với nội dung động và bài học tương tác được thiết kế cho những người học hiện đại"
    },
    {
      icon: "🚀",
      title: "Giảng Viên Chuyên Gia",
      description: "Học từ những chuyên gia ngành với nhiều năm kinh nghiệm thực tế"
    },
    {
      icon: "📊",
      title: "Theo Dõi Tiến Độ",
      description: "Giám sát hành trình học tập của bạn với phân tích chi tiết và thông tin chi sâu"
    },
    {
      icon: "🏆",
      title: "Nhận Chứng Chỉ",
      description: "Được công nhận với các chứng chỉ chuyên nghiệp sau khi hoàn thành"
    }
  ];

  const stats = [
    { number: "50K+", label: "Học Viên Hoạt Động" },
    { number: "500+", label: "Khóa Học Chuyên Gia" },
    { number: "98%", label: "Tỷ Lệ Hài Lòng" },
    { number: "4.9/5", label: "Xếp Hạng Trung Bình" }
  ];

  return (
    <div className="landing-container">
      {/* Navigation Header */}
      <header className="landing-header">
        <div className="nav-container">
          <div className="logo-section">
            <img src={logo} alt="Logo" />
          </div>
          <nav className="nav-links">
            <a
              href="#features"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#features")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Tính Năng
            </a>

            <a
              href="#landing-footer"
              className="nav-link"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector("#landing-footer")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              Về Chúng Tôi
            </a>
          </nav>

          <div className="nav-auth">
            {!isLogin ? (
              <>
                <button
                  className="btn-text"
                  onClick={() => navigate("/login")}
                >
                  Đăng Nhập
                </button>
                <button
                  className="btn-premium"
                  onClick={() => navigate("/register")}
                >
                  Bắt Đầu Ngay
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-text"
                  onClick={() => navigate("/profile")}
                  title="Hồ sơ cá nhân"
                >
                  👤 {user?.name}
                </button>
                {/* <button
                  className="btn-text"
                  onClick={() => navigate("/my-enrollments")}
                  title="Các khóa học của tôi"
                >
                  📚 Khóa học
                </button> */}
                <button
                  className="btn-text"
                  onClick={() => navigate("/recommendations")}
                  title="Khóa học được đề xuất"
                >
                  🎓 Đề Xuất
                </button>
                <button className="btn-text" onClick={handleLogout}>
                  Đăng Xuất
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Thành Thạo Bất Kỳ Kỹ Năng Trong Thời Gian Của Bạn</h1>
            <p className="hero-subtitle">
              Tham gia hàng ngàn học viên chuyển đổi sự nghiệp của họ bằng các khóa học cao cấp của chúng tôi
            </p>
            <div className="hero-cta">
              <button
                className="btn-premium btn-large"
                onClick={() => navigate(isLogin ? "/dashboard" : "/register")}
              >
                {isLogin ? "Xem Bảng Điều Khiển" : "Bắt Đầu Học Miễn Phí"}
              </button>
              <button
                className="btn-secondary btn-large"
                onClick={() =>
                  document
                    .getElementById("courses-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Khám Phá Khóa Học
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="gradient-blob blob-1"></div>
            <div className="gradient-blob blob-2"></div>
            <div className="hero-card">
              <div className="card-header">Khóa Học Hàng Đầu</div>
              <div className="course-preview">
                <div className="course-item">
                  <span className="course-badge">Phổ Biến</span>
                  <span className="course-name">Thành Thạo React</span>
                </div>
                <div className="course-item">
                  <span className="course-badge">Xu Hướng</span>
                  <span className="course-name">AI & Máy Học</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Tại Sao Chọn Chúng Tôi</h2>
          <p>Mọi thứ bạn cần để thành công trong hành trình học tập của mình</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses-section" className="courses-section">
        <div className="section-header">
          <h2>{isLogin ? "Khóa Học Của Bạn" : "Khám Phá Các Khóa Học"}</h2>
          <p>{isLogin ? "Tiếp tục cuộc phiêu lưu học tập của bạn" : "Hàng ngàn khóa học chất lượng đang chờ đón bạn"}</p>
        </div>

        <div className="courses-grid">
          {courses.map((course: Courses) => {
            const imageUrl = course.image
              ? course.image.startsWith("http")
                ? course.image
                : `${API_URL}${course.image}`
              : DEFAULT_IMAGE;

            return (
              <div key={course.id} className="course-card">
                <div className="course-image">
                  <img
                    src={imageUrl}
                    alt={course.title}
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;

                      if (img.src !== DEFAULT_IMAGE) {
                        img.src = DEFAULT_IMAGE;
                      }
                    }}
                  />
                </div>

                <div className="course-meta">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>

                  <div className="course-footer">
                    {/* 👉 dùng duration từ DB */}
                    <span className="duration">
                      {course.duration
                        ? `${Math.floor(course.duration / 60)}h ${course.duration % 60}m`
                        : "Đang cập nhật"}
                    </span>

                    <button
                      className="btn-text"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      {isLogin ? "Tiếp Tục →" : "Xem Chi Tiết →"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading">Đang tải khóa học...</div>}
      </section>

  <section className="final-cta">
    <div className="cta-content">
      <h2>Sẵn Sàng Chuyển Đổi Sự Nghiệp Của Bạn?</h2>
      <p>Tham gia hơn 50.000 học viên đã bắt đầu hành trình học tập của họ</p>
    </div>
  </section>


{/* Footer */ }
<footer id="landing-footer" className="landing-footer">
  <div className="footer-content">
    <div className="footer-section">
      <h4>Sản Phẩm</h4>
      <a href="#features">Tính Năng</a>
      <a href="#pricing">Giá Cả</a>
      <a href="#about">Về Chúng Tôi</a>
    </div>
    <div className="footer-section">
      <h4>Tài Nguyên</h4>
      <a href="#blog">Blog</a>
      <a href="#help">Trung Tâm Trợ Giúp</a>
      <a href="#contact">Liên Hệ</a>
    </div>
    <div className="footer-section">
      <h4>Pháp Lý</h4>
      <a href="#privacy">Quyền Riêng Tư</a>
      <a href="#terms">Điều Khoản</a>
      <a href="#cookies">Cookie</a>
    </div>
    <div className="footer-section">
      <h4>Kết Nối</h4>
      <a href="#twitter">Twitter</a>
      <a href="#linkedin">LinkedIn</a>
      <a href="#github">GitHub</a>
    </div>
  </div>
  <div className="footer-bottom">
    <p>&copy; {new Date().getFullYear()} Nền Tảng Học Tập. Bảo lưu mọi quyền.</p>
  </div>
</footer>
    </div >
  );
}
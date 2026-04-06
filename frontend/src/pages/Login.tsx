import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "../styles/auth.css";
import { useAppDispatch, useAppSelector } from "../app/store";
import { loginUser, clearError } from "../features/authSlice";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useAppDispatch();
  const { loading, error, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "teacher") {
        navigate("/teacher");
      } else if (user.role === "student") {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }

    await dispatch(loginUser({ email, password }));
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-side">
          <div>
            <h1>Chào mừng trở lại</h1>
            <p className="auth-subtitle">
              Đăng nhập vào tài khoản của bạn để tiếp tục học tập
            </p>

            {error && <div className="auth-message message-error">{error}</div>}

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu của bạn"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-button auth-btn-primary"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <span className="button-loading">
                    <span className="spinner-small"></span>
                    Đang đăng nhập...
                  </span>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </form>

            <div className="auth-divider">
              <div className="divider-line"></div>
              <span className="divider-text">hoặc</span>
              <div className="divider-line"></div>
            </div>

            <div className="auth-footer">
              Chưa có tài khoản?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/register");
                }}
              >
                Đăng ký ngay
              </a>
            </div>

            <button
              className="auth-button auth-btn-secondary"
              onClick={() => navigate("/")}
              disabled={loading}
              style={{ marginTop: "16px" }}
            >
              Quay lại trang chủ
            </button>
          </div>
        </div>

        <div className="auth-image-side">
          <div className="image-content">
            <div className="image-icon">🎓</div>
            <h2>Tiến bộ nhanh hơn</h2>
            <p>Với nền tảng học tập hiện đại của chúng tôi, bạn sẽ đạt được mục tiêu nhanh hơn bao giờ hết.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import { registerUser, clearError } from "../features/authSlice";
import { useAppDispatch, useAppSelector } from "../app/store";
import { useState, useEffect } from "react";

function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    const result = await dispatch(
      registerUser({ name, email, password }),
    ).unwrap();

    if (result.success) {
      navigate("/login");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleRegister();
    }
  };

  const isFormValid = name && email && password && confirmPassword && password === confirmPassword;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-form-side">
          <div>
            <h1>Bắt đầu hành trình</h1>
            <p className="auth-subtitle">
              Tạo tài khoản mới và bắt đầu học tập với hàng ngàn khoá học chất lượng
            </p>

            {error && <div className="auth-message message-error">{error}</div>}

            <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label className="form-label">Tên của bạn</label>
                <input
                  type="text"
                  placeholder="Nhập tên của bạn"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu</label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="button"
                className="auth-button auth-btn-primary"
                onClick={handleRegister}
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <span className="button-loading">
                    <span className="spinner-small"></span>
                    Đang xử lý...
                  </span>
                ) : (
                  "Tạo tài khoản"
                )}
              </button>
            </form>

            <div className="auth-divider">
              <div className="divider-line"></div>
              <span className="divider-text">hoặc</span>
              <div className="divider-line"></div>
            </div>

            <div className="auth-footer">
              Đã có tài khoản?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/login");
                }}
              >
                Đăng nhập ngay
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
            <div className="image-icon">🚀</div>
            <h2>Bắt đầu ngay</h2>
            <p>Tham gia cộng đồng học tập của hơn 50,000 học viên thành công trên toàn thế giới.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

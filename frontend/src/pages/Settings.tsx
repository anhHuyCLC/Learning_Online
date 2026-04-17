import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store";
import { Header } from "../components/Header";
import { updateUserProfile } from "../features/authSlice";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setName(user.name || "");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password) {
      if (!currentPassword) {
        setMessage({ type: "error", text: "Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới!" });
        return;
      }
    }

    if (password && password !== confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await dispatch(updateUserProfile({ name, currentPassword, password })).unwrap();
      setMessage({ 
        type: "success", 
        text: "Cập nhật thông tin thành công!" 
      });
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error || "Đã xảy ra lỗi khi cập nhật thông tin.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Header title="Cài Đặt Tài Khoản" subtitle="Cập nhật thông tin cá nhân của bạn" />

      <div className="settings-container">
        <div className="card">
          <div className="card-header border-bottom">
            <h2 className="heading-2">Thông Tin Cá Nhân</h2>
          </div>

          {message.text && (
            <div className={`p-4 mb-4 ${message.type === 'error' ? 'error-container' : 'badge-emerald'}`} style={{ borderRadius: '8px', height: 'auto', textAlign: 'left', fontWeight: 'bold' }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="form-group">
              <label className="form-label">Họ và Tên</label>
              <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nhập họ và tên của bạn" />
            </div>

            <div className="form-group">
              <label className="form-label">Email (Không thể thay đổi)</label>
              <input type="email" className="form-input" value={user?.email || ""} disabled style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }} />
            </div>

            <div className="form-group">
              <label className="form-label">Mật Khẩu Hiện Tại (Bắt buộc nếu muốn đổi mật khẩu mới)</label>
              <input type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Nhập mật khẩu hiện tại" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mật Khẩu Mới (Để trống nếu không đổi)</label>
                <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nhập mật khẩu mới" minLength={6} />
              </div>

              <div className="form-group">
                <label className="form-label">Xác Nhận Mật Khẩu Mới</label>
                <input type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu mới" minLength={6} />
              </div>
            </div>

            <div className="mt-6" style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Đang Cập Nhật..." : "Lưu Thay Đổi"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Settings;
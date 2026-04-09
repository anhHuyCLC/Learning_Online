import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../app/store";
import { Header } from "../components/Header";
import "../styles/Dashboard.css"; 

const UserSettings: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);

    const [name, setName] = useState(user?.name || "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    if (!user) return null;

    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    };

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
            return;
        }
        setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="dashboard-container settings-container">
            <Header title="Cài Đặt Tài Khoản" subtitle="Quản lý thông tin cá nhân và bảo mật" />

            {message && (
                <div className={message.type === 'success' ? 'status-badge badge-emerald' : 'error-container'} style={{ marginBottom: '20px', display: 'block', padding: '12px', height: 'auto', textAlign: 'left' }}>
                    {message.text}
                </div>
            )}

            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header border-bottom">
                    <h2 className="heading-2">Thông Tin Cá Nhân</h2>
                </div>
                <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                        <label className="form-label">Email (Không thể thay đổi)</label>
                        <input type="email" className="form-input" value={user.email} disabled style={{ background: '#f5f5f5', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Họ và tên</label>
                        <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn-primary">Lưu Thay Đổi</button>
                    </div>
                </form>
            </div>

            <div className="card">
                <div className="card-header border-bottom">
                    <h2 className="heading-2">Bảo Mật & Mật Khẩu</h2>
                </div>
                <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                        <label className="form-label">Mật khẩu hiện tại</label>
                        <input type="password" className="form-input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Mật khẩu mới</label>
                            <input type="password" className="form-input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Xác nhận mật khẩu mới</label>
                            <input type="password" className="form-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn-secondary">Đổi Mật Khẩu</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserSettings;
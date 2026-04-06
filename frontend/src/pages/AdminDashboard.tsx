import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchAdminDashboardData, updateUserRole, deleteUser } from '../features/adminSlice';
import type { User } from '../type/userType';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { stats, users, loading, error } = useAppSelector((state) => state.admin);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'teacher' | 'student'>('student');

  useEffect(() => {
    dispatch(fetchAdminDashboardData());
  }, [dispatch]);

  const handleDelete = (userId: number, userName: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${userName}"? Hành động này không thể hoàn tác.`)) {
      dispatch(deleteUser(userId));
    }
  };

  const handleOpenRoleModal = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role);
  };

  const handleUpdateRole = () => {
    if (editingUser) {
      dispatch(updateUserRole({ userId: editingUser.id, role: newRole }));
      setEditingUser(null);
    }
  };

  const statItems = [
    { icon: '👥', title: 'Tổng Người Dùng', value: stats.totalUsers, color: 'icon-primary' },
    { icon: '📚', title: 'Tổng Khóa Học', value: stats.totalCourses, color: 'icon-indigo' },
    { icon: '💰', title: 'Tổng Doanh Thu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue || 0), color: 'icon-emerald' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-info">
          <h1 className="heading-1">Bảng Điều Khiển Admin</h1>
          <p className="text-muted">Tổng quan hệ thống và quản lý người dùng.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statItems.map(item => (
          <div key={item.title} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon ${item.color}`}>{item.icon}</div>
            </div>
            <p className="stat-title">{item.title}</p>
            <h3 className="stat-value">{item.value}</h3>
          </div>
        ))}
      </div>

      {/* User Management Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="heading-2">Quản Lý Người Dùng</h2>
        </div>

        {loading && users.length === 0 && <div className="loading-container"><div className="spinner"></div></div>}
        {error && <div className="error-container">{error}</div>}

        {!loading && !error && (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Người Dùng</th>
                  <th>Email</th>
                  <th>Vai Trò</th>
                  <th>Ngày Tạo</th>
                  <th className="text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td className='text-mono'>{user.id}</td>
                    <td>
                      <div className="user-info">
                        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
                        <span className="user-name">{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status-badge badge-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="text-center">
                      <button className="btn-secondary btn-sm" onClick={() => handleOpenRoleModal(user)}>Đổi vai trò</button>
                      <button className="btn-danger btn-sm" style={{marginLeft: '8px'}} onClick={() => handleDelete(user.id, user.name)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Change Modal */}
      {editingUser && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Đổi vai trò cho {editingUser.name}</h3>
            <div className="form-group">
              <label className='form-label'>Vai trò mới</label>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value as any)} className="form-input">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setEditingUser(null)}>Hủy</button>
              <button className="btn-primary" onClick={handleUpdateRole}>Cập nhật</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
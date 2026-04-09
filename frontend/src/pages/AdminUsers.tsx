import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchAdminDashboardData, updateUserRole, deleteUser } from '../features/adminSlice';
import type { User } from '../type/userType';
import '../styles/Dashboard.css';

const AdminUsers = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error } = useAppSelector((state) => state.admin);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'teacher' | 'student'>('student');
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-info">
          <h1 className="heading-1">Quản Lý Người Dùng</h1>
          <p className="text-muted">Xem, chỉnh sửa vai trò hoặc xóa tài khoản người dùng.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <h2 className="heading-2">Tất Cả Người Dùng ({filteredUsers.length})</h2>
          <div className="search-bar" style={{ border: '1px solid var(--f8-border)', borderRadius: '8px', padding: '4px 12px', background: '#f9fafb' }}>
            <input 
              type="text" 
              placeholder="Tìm kiếm tên, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', outline: 'none', padding: '8px', background: 'transparent' }}
            />
          </div>
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
                {filteredUsers.length > 0 ? filteredUsers.map(user => (
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
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted p-4">Không tìm thấy người dùng nào phù hợp.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

export default AdminUsers;
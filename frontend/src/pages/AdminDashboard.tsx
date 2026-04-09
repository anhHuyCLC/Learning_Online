import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchAdminDashboardData } from '../features/adminSlice';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { stats, loading, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminDashboardData());
  }, [dispatch]);

  const statItems = [
    { icon: '👥', title: 'Tổng Người Dùng', value: stats.totalUsers, color: 'icon-primary', path: '/admin/users' },
    { icon: '📚', title: 'Tổng Khóa Học', value: stats.totalCourses, color: 'icon-indigo', path: '/admin/courses' },
    { icon: '💰', title: 'Tổng Doanh Thu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue || 0), color: 'icon-emerald', path: '/admin/transactions' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-info">
          <h1 className="heading-1">Bảng Điều Khiển Admin</h1>
          <p className="text-muted">Theo dõi các chỉ số quan trọng và hoạt động của nền tảng.</p>
        </div>
      </div>

      {loading && <div className="loading-container"><div className="spinner"></div></div>}
      {error && <div className="error-container">{error}</div>}

      {!loading && !error && (
        <div className="stats-grid">
          {statItems.map(item => (
            <div 
              key={item.title} 
              className="stat-card"
              onClick={() => navigate(item.path)}
              style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="stat-header">
                <div className={`stat-icon ${item.color}`}>{item.icon}</div>
              </div>
              <p className="stat-title">{item.title}</p>
              <h3 className="stat-value">{item.value}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchTeacherDashboardData } from '../features/teacherSlice';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { stats, courses, loading, error } = useAppSelector((state) => state.teacher);
    const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        dispatch(fetchTeacherDashboardData());
    }, [dispatch]);

    const statItems = [
        { icon: '📚', title: 'Tổng Khóa Học', value: stats.totalCourses, color: 'icon-primary' },
        { icon: '👥', title: 'Tổng Học Viên', value: stats.totalStudents, color: 'icon-indigo' },
        { icon: '💰', title: 'Tổng Doanh Thu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue || 0), color: 'icon-emerald' },
    ];

    const handleViewStudents = (course: any) => {
        navigate(`/teacher/courses/${course.id}/students`);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-info">
                    <h1 className="heading-1">Bảng Điều Khiển Giáo Viên</h1>
                    <p className="text-muted">Quản lý khóa học và theo dõi hiệu suất của bạn.</p>
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

            {/* My Courses Table */}
            <div className="card">
                <div className="card-header">
                    <h2 className="heading-2">Các Khóa Học Của Tôi</h2>
                    <button className="btn-primary btn-sm" onClick={() => navigate('/teacher/courses/new')}>Tạo khóa học mới</button>
                </div>

                {loading && courses.length === 0 && <div className="loading-container"><div className="spinner"></div></div>}
                {error && <div className="error-container">{error}</div>}

                {!loading && !error && (
                    courses.length === 0 ? (
                        <div className="text-center p-4">
                            <span style={{ fontSize: '48px' }}>📭</span>
                            <h3 className="heading-2 mt-4">Bạn chưa có khóa học nào</h3>
                            <p className="text-muted mt-4">Hãy bắt đầu tạo khóa học đầu tiên để chia sẻ kiến thức của bạn.</p>
                            <button className="btn-primary mt-4" onClick={() => navigate('/teacher/courses/new')}>Tạo khóa học ngay</button>
                        </div>
                    ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Khóa học</th>
                                    <th>Giá</th>
                                    <th>Số học viên</th>
                                    <th>Ngày tạo</th>
                                    <th className="text-center">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td>
                                            <div className="user-info">
                                                <img 
                                                    src={course.image ? (course.image.startsWith('http') ? course.image : `${API_URL}${course.image}`) : `https://via.placeholder.com/40x40?text=${course.name.charAt(0)}`} 
                                                    alt={course.name} 
                                                    className="course-thumbnail-sm" 
                                                />
                                                <span className="user-name">{course.name}</span>
                                            </div>
                                        </td>
                                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price || 0)}</td>
                                        <td>{course.enrollment_count || 0}</td>
                                        <td>{new Date(course.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td className="text-center">
                                            <button className="btn-secondary btn-sm" onClick={() => handleViewStudents(course)}>Xem học viên</button>
                                            <button className="btn-text" style={{ marginLeft: '8px' }} onClick={() => navigate(`/teacher/courses/edit/${course.id}`)}>Quản lý</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
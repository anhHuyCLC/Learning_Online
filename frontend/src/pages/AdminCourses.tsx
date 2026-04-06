import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { getAllCoursesAdmin, deleteCourse } from '../features/courseSlice';
import '../styles/Dashboard.css';

const AdminCourses = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { courses, loading, error } = useAppSelector((state) => state.courses);
    const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        dispatch(getAllCoursesAdmin());
    }, [dispatch]);

    const handleDelete = (courseId: number, courseName: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn khóa học "${courseName}"?`)) {
            dispatch(deleteCourse(courseId));
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-info">
                    <h1 className="heading-1">Quản Lý Khóa Học</h1>
                    <p className="text-muted">Xem, chỉnh sửa hoặc xóa bất kỳ khóa học nào trên hệ thống.</p>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="heading-2">Tất Cả Khóa Học ({courses.length})</h2>
                    {/* Optional: Add search bar here */}
                </div>

                {loading && <div className="loading-container"><div className="spinner"></div></div>}
                {error && <div className="error-container">{error}</div>}

                {!loading && !error && (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Khóa học</th>
                                    <th>Giáo viên</th>
                                    <th>Giá</th>
                                    <th>Ngày tạo</th>
                                    <th className="text-center">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td className="text-mono">{course.id}</td>
                                        <td>
                                            <div className="user-info">
                                                <img 
                                                    src={course.image ? `${API_URL}${course.image}` : `https://via.placeholder.com/40x40?text=${course.name.charAt(0)}`} 
                                                    alt={course.name} 
                                                    className="avatar" 
                                                    style={{ borderRadius: '8px', objectFit: 'cover' }} 
                                                />
                                                <span className="user-name">{course.name}</span>
                                            </div>
                                        </td>
                                        <td>{course.teacher_name || 'N/A'}</td>
                                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price || 0)}</td>
                                        <td>{new Date(course.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td className="text-center">
                                            <button 
                                                className="btn-secondary btn-sm" 
                                                onClick={() => navigate(`/teacher/courses/edit/${course.id}`)}
                                            >
                                                Sửa
                                            </button>
                                            <button 
                                                className="btn-danger btn-sm" 
                                                style={{ marginLeft: '8px' }}
                                                onClick={() => handleDelete(course.id, course.name)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCourses;
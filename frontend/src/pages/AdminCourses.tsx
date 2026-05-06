import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { getAllCoursesAdmin, deleteCourse } from '../features/courseSlice';
import '../styles/dashboard.css';

const AdminCourses = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { courses, loading, error } = useAppSelector((state) => state.courses);
    const API_URL = "http://localhost:3000";
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(getAllCoursesAdmin());
    }, [dispatch]);

    const handleDelete = (courseId: number, courseName: string) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn khóa học "${courseName}"?`)) {
            dispatch(deleteCourse(courseId));
        }
    };

    const filteredCourses = courses.filter(course => {
        const courseName = course.title || '';
        return courseName.toLowerCase().includes(searchTerm.toLowerCase()) || 
               (course.teacher_name && course.teacher_name.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-info">
                    <h1 className="heading-1">Quản Lý Khóa Học</h1>
                    <p className="text-muted">Xem, chỉnh sửa hoặc xóa bất kỳ khóa học nào trên hệ thống.</p>
                </div>
            </div>

            <div className="card">
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <h2 className="heading-2">Tất Cả Khóa Học ({filteredCourses.length})</h2>
                    <div className="search-bar" style={{ border: '1px solid var(--f8-border)', borderRadius: '8px', padding: '4px 12px', background: '#f9fafb' }}>
                        <input 
                            type="text" 
                            placeholder="Tìm tên khóa học, giáo viên..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', padding: '8px', background: 'transparent' }}
                        />
                    </div>
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
                                {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                                    <tr key={course.id}>
                                        <td className="text-mono">{course.id}</td>
                                        <td>
                                            <div className="user-info">
                                                <img 
                                                    src={course.image ? (course.image.startsWith('http') ? course.image : `${API_URL}${course.image}`) : `https://via.placeholder.com/40x40?text=${(course.title || 'C').charAt(0)}`} 
                                                    alt={course.title} 
                                                    className="avatar" 
                                                    style={{ borderRadius: '8px', objectFit: 'cover' }} 
                                                />
                                                <span className="user-name">{course.title}</span>
                                            </div>
                                        </td>
                                        <td>{course.teacher_name || 'N/A'}</td>
                                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price || 0)}</td>
                                        <td>{(course as any).created_at ? new Date((course as any).created_at).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                        <td className="text-center">
                                            <button 
                                                className="btn-secondary btn-sm" 
                                                onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                                            >
                                                Sửa
                                            </button>
                                            <button 
                                                className="btn-danger btn-sm" 
                                                style={{ marginLeft: '8px' }}
                                                onClick={() => handleDelete(course.id, course.title || '')}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted p-4">Không tìm thấy khóa học nào phù hợp.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCourses;
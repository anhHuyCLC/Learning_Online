import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchCourseStudents } from '../features/teacherSlice';
import '../styles/dashboard.css';

const TeacherCourseStudents = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const dispatch = useAppDispatch();
    const { selectedCourseStudents, loadingModal, error } = useAppSelector((state) => state.teacher);
    const course = useAppSelector((state) => state.teacher.courses.find(c => c.id === Number(courseId)));

    useEffect(() => {
        if (courseId) {
            dispatch(fetchCourseStudents(Number(courseId)));
        }
    }, [dispatch, courseId]);

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-info">
                    <h1 className="heading-1">Học viên: {course?.title || 'Đang tải...'}</h1>
                    <p className="text-muted">Danh sách tất cả học viên đã đăng ký khóa học này.</p>
                </div>
                <Link to="/teacher" className="btn-secondary">
                    <span>⬅️</span> Quay lại Dashboard
                </Link>
            </div>

            <div className="card">
                {loadingModal && <div className="loading-container"><div className="spinner"></div></div>}
                {error && <div className="error-container">{error}</div>}

                {!loadingModal && !error && (
                    selectedCourseStudents.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px', height: 'auto' }}>
                            <div className="empty-icon" style={{fontSize: '48px'}}>🤷</div>
                            <h3 style={{fontSize: '18px'}}>Chưa có học viên nào</h3>
                            <p className="text-muted">Khóa học này chưa có học viên nào đăng ký.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Tên</th>
                                        <th>Email</th>
                                        <th>Ngày tham gia</th>
                                        <th>Tiến độ</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedCourseStudents.map((student) => (
                                        <tr key={student.id}>
                                            <td>{student.name}</td>
                                            <td>{student.email}</td>
                                            <td>{new Date(student.enrolled_at).toLocaleDateString('vi-VN')}</td>
                                            <td>{student.progress}%</td>
                                            <td>
                                                <span className={`status-badge ${student.status === 'active' ? 'badge-teacher' : 'badge-emerald'}`}>
                                                    {student.status === 'active' ? 'Đang học' : 'Hoàn thành'}
                                                </span>
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

export default TeacherCourseStudents;
import type { CourseStudent } from '../type/teacherTypes';
import '../styles/Dashboard.css';

interface Props {
    courseName: string;
    students: CourseStudent[];
    loading: boolean;
    onClose: () => void;
}

const CourseStudentsModal = ({ courseName, students, loading, onClose }: Props) => {
    return (
        <div className="modal-backdrop">
            <div className="modal" style={{ maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                <h3>Học viên khóa học: {courseName}</h3>
                <div style={{ flex: '1 1 auto', overflowY: 'auto', margin: '0 -24px', padding: '0 24px' }}>
                    {loading ? (
                        <div className="loading-container" style={{ height: '300px' }}><div className="spinner"></div></div>
                    ) : students.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px', height: 'auto' }}>
                            <div className="empty-icon" style={{fontSize: '48px'}}>🤷</div>
                            <h3 style={{fontSize: '18px'}}>Chưa có học viên nào</h3>
                            <p className="text-muted">Khóa học này chưa có học viên nào đăng ký.</p>
                        </div>
                    ) : (
                        <div className="table-container" style={{margin: 0, padding: 0}}>
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
                                    {students.map((student) => (
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
                    )}
                </div>
                <div className="modal-actions">
                    <button className="btn-secondary" onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default CourseStudentsModal;
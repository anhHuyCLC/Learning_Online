import type { CourseStudent } from '../type/teacherTypes';
import { Modal } from './Modal';
import { Button } from './Button';
import { Loading } from './Loading';
import '../styles/Dashboard.css';

interface Props {
  courseName: string;
  students: CourseStudent[];
  loading: boolean;
  onClose: () => void;
}

const CourseStudentsModal = ({ courseName, students, loading, onClose }: Props) => {
  return (
    <Modal isOpen={true} onClose={onClose} title={`Học viên: ${courseName}`} size="large">
      {loading ? (
        <Loading message="Đang tải danh sách học viên..." />
      ) : students.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🤷</div>
          <h3>Chưa có học viên nào</h3>
          <p className="text-muted">Khóa học này hiện chưa có người đăng ký.</p>
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
              {students.map((student) => (
                <tr key={student.id}>
                  <td><strong>{student.name}</strong></td>
                  <td>{student.email}</td>
                  <td>{new Date(student.enrolled_at).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="progress-bar-mini">
                        {student.progress}%
                    </div>
                  </td>
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
      <div className="modal-footer-actions" style={{ marginTop: '20px', textAlign: 'right' }}>
        <Button variant="secondary" onClick={onClose}>Đóng</Button>
      </div>
    </Modal>
  );
};

export default CourseStudentsModal;
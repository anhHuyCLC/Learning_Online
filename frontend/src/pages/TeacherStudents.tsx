import { useState, useEffect } from "react";
import teacherService from "../services/teacherService";
import "../styles/dashboard.css";

export default function TeacherStudents() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await teacherService.getMyCourses();
        const coursesData = res.courses || res.data || res;
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourseId(coursesData[0].id);
        }
      } catch (err: any) {
        setError("Không thể tải danh sách khóa học.");
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedCourseId) return;
      setLoading(true);
      try {
        const res = await teacherService.getCourseStudents(Number(selectedCourseId));
        setStudents(res.data || []);
      } catch (err: any) {
        setError("Không thể tải danh sách học viên.");
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [selectedCourseId]);

  if (loading && courses.length === 0) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ padding: 0, border: 'none', position: 'static' }}>
        <div className="header-info">
          <h2 className="heading-1">👨‍🎓 Quản lý học viên</h2>
          <p className="text-muted">Theo dõi tiến độ và trạng thái học tập của học viên trong các khóa học của bạn.</p>
        </div>
      </div>

      {error && <div className="error-container" style={{ height: 'auto', padding: '16px' }}>{error}</div>}

      <div className="card">
        <div className="form-group" style={{ maxWidth: '400px' }}>
          <label className="form-label">Chọn khóa học:</label>
          <select
            className="form-input"
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(Number(e.target.value))}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
        </div>

        <div className="table-container mt-6">
          <table className="data-table">
            <thead>
              <tr>
                <th>Học viên</th>
                <th>Email</th>
                <th>Ngày đăng ký</th>
                <th>Tiến độ</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center">Đang tải dữ liệu...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted">Chưa có học viên nào đăng ký khóa học này.</td></tr>
              ) : (
                students.map(student => (
                  <tr key={student.id}>
                    <td className="font-bold">{student.name}</td>
                    <td className="text-muted">{student.email}</td>
                    <td>{new Date(student.enrolled_at).toLocaleDateString("vi-VN")}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#e8e8e8', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${student.progress}%`, height: '100%', background: 'var(--f8-success)' }}></div>
                        </div>
                        <span className="text-mono text-muted">{student.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${student.status === 'completed' ? 'badge-emerald' : 'badge-amber'}`}>
                        {student.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
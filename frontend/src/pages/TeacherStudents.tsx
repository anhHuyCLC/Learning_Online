import { useState, useEffect } from "react";
import { fetchCoursesByTeacher, fetchCourseStudents } from "../services/courseService";
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
        const res = await fetchCoursesByTeacher();
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
        const res = await fetchCourseStudents(Number(selectedCourseId));
        setStudents(res.data || res.students || res || []);
      } catch (err: any) {
        setError("Không thể tải danh sách học viên.");
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, [selectedCourseId]);

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      active: "Đang học",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status: string) => {
    if (status === 'completed') return 'badge-emerald';
    if (status === 'cancelled') return 'badge-rose';
    return 'badge-amber'; // Mặc định cho active
  };

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
              <option key={course.id} value={course.id}>{course.title || course.name}</option>
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
                students.map(student => {
                  const formattedProgress = Math.round(Number(student.progress) || 0);

                  return (
                    <tr key={student.id}>
                      <td className="font-bold">{student.name}</td>
                      <td className="text-muted">{student.email}</td>
                      <td>{new Date(student.enrolled_at || Date.now()).toLocaleDateString("vi-VN")}</td>
                      
                      <td style={{ minWidth: '200px' }}>
                        <div className="progress-container" style={{ marginBottom: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
                            <span className="text-muted">Tiến độ học tập</span>
                            <span style={{ color: 'var(--f8-success)' }}>
                              {formattedProgress}%
                            </span>
                          </div>
                          <div className="progress-track" style={{ margin: 0 }}>
                            <div className="progress-fill-success" style={{ width: `${formattedProgress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      
                      <td>
                        <span className={`status-badge ${getStatusClass(student.status)}`}>
                          {getStatusLabel(student.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { fetchCoursesByTeacher, fetchCourseById } from "../services/courseService";
import { Link } from "react-router-dom";
import "../styles/dashboard.css";

export default function TeacherQuizzes() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [lessons, setLessons] = useState<any[]>([]);
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
    const loadCourseDetails = async () => {
      if (!selectedCourseId) return;
      setLoading(true);
      try {
        const res = await fetchCourseById(Number(selectedCourseId));
        const courseData = res.course || res;
        setLessons(courseData.lessons || []);
      } catch (err: any) {
        setError("Không thể tải thông tin bài học.");
      } finally {
        setLoading(false);
      }
    };
    loadCourseDetails();
  }, [selectedCourseId]);

  if (loading && courses.length === 0) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ padding: 0, border: 'none', position: 'static' }}>
        <div className="header-info">
          <h2 className="heading-1">📝 Quản lý Bài tập (Quizzes)</h2>
          <p className="text-muted">Xem và quản lý các bài kiểm tra/trắc nghiệm cho từng bài học của bạn.</p>
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
                <th style={{ width: '80px' }}>Thứ tự</th>
                <th>Tên bài học</th>
                <th>Trạng thái Quiz</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center">Đang tải dữ liệu...</td></tr>
              ) : lessons.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-muted">Khóa học này chưa có bài học nào.</td></tr>
              ) : (
                lessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td className="text-muted text-center">{lesson.lesson_order}</td>
                    <td className="font-bold">{lesson.title}</td>
                    <td>
                      <span className={`status-badge ${lesson.has_quiz ? 'badge-emerald' : 'badge-rose'}`}>
                        {lesson.has_quiz ? '✅ Đã có Quiz' : '❌ Chưa có Quiz'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/teacher/quizzes/lesson/${lesson.id}`} className="btn-secondary btn-sm">
                        {lesson.has_quiz ? 'Chỉnh sửa Quiz' : 'Tạo Quiz'}
                      </Link>
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
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCoursesByTeacher, deleteCourse } from "../services/courseService";
import type { Courses } from "../type/coursesType";
import "../styles/Dashboard.css";

export default function TeacherCourses() {
  const [courses, setCourses] = useState<Courses[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // Lưu ý: Nếu backend của bạn trả về { data: [...] } thì cần .data
      // Dựa theo courseService.ts, nó trả thẳng response.data
      const data = await fetchCoursesByTeacher();
      // Lọc khóa học hoặc gán trực tiếp tùy cấu trúc API trả về
      setCourses(Array.isArray(data) ? data : data.courses || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách khóa học.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${name}" không? Thao tác này không thể hoàn tác.`)) {
      try {
        await deleteCourse(id);
        // Cập nhật lại UI sau khi xóa thành công
        setCourses(courses.filter(course => course.id !== id));
      } catch (err: any) {
        alert("Lỗi khi xóa khóa học: " + err.message);
      }
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <span className="error-icon">⚠️</span>
        <p>{error}</p>
        <button onClick={loadCourses} className="btn-primary mt-4">Thử lại</button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-info">
          <h2 className="heading-1">My Courses</h2>
          <p className="text-muted">Quản lý các khóa học bạn đang giảng dạy.</p>
        </div>
        <Link to="/teacher/courses/new" className="btn-primary">
          <span>➕</span> Tạo khóa học mới
        </Link>
      </div>

      <div className="card">
        {courses.length === 0 ? (
          <div className="text-center p-4">
            <span style={{ fontSize: '48px' }}>📭</span>
            <h3 className="heading-2 mt-4">Bạn chưa có khóa học nào</h3>
            <p className="text-muted mt-4">Hãy bắt đầu tạo khóa học đầu tiên để chia sẻ kiến thức của bạn.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Giá</th>
                  <th>Số bài học</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="user-info">
                        {/* Hiển thị ảnh thu nhỏ của khóa học */}
                        <img 
                          src={course.image ? (course.image.startsWith('http') ? course.image : `${API_URL}${course.image}`) : "https://via.placeholder.com/150"} 
                          alt={course.name} 
                          style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div>
                          <div className="user-name">{course.title || course.name}</div>
                          <div className="text-muted" style={{ fontSize: '12px' }}>ID: {course.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-bold text-mono">
                      {course.price > 0 ? `${course.price.toLocaleString()}đ` : <span className="status-badge badge-emerald">Miễn phí</span>}
                    </td>
                    <td>{course.lessons?.length || 0} bài</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/teacher/courses/edit/${course.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                          ✏️ Sửa
                        </Link>
                        <button 
                          onClick={() => handleDelete(course.id, course.title || course.name)} 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--f8-danger)' }}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
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
}
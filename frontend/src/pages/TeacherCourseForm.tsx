import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createCourse, updateCourse, fetchCourseById } from "../services/courseService";
import "../styles/Dashboard.css";

export default function TeacherCourseForm() {
  const { id } = useParams(); // Lấy ID từ URL nếu đang ở chế độ Edit
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Khởi tạo state cho dữ liệu khóa học
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    price: 0,
    image: "",
    description: "",
    detail_description: "",
  });

  // Nếu là chế độ Edit, gọi API để lấy dữ liệu cũ điền vào form
  useEffect(() => {
    if (isEditMode) {
      loadCourseData();
    }
  }, [id]);

  const loadCourseData = async () => {
    try {
      const data = await fetchCourseById(Number(id));
      const course = data.course || data; // Tùy cấu trúc backend trả về
      setFormData({
        name: course.name || "",
        title: course.title || "",
        price: course.price || 0,
        image: course.image || "",
        description: course.description || "",
        detail_description: course.detail_description || "",
      });
    } catch (err: any) {
      setError("Không thể tải thông tin khóa học để chỉnh sửa.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("title", formData.title);
    dataToSend.append("price", String(formData.price));
    dataToSend.append("image", formData.image);
    dataToSend.append("description", formData.description);
    dataToSend.append("detail_description", formData.detail_description);

    try {
      if (isEditMode) {
        await updateCourse(Number(id), dataToSend);
        alert("Cập nhật khóa học thành công!");
      } else {
        await createCourse(dataToSend);
        alert("Tạo khóa học mới thành công!");
      }
      navigate("/teacher/courses"); // Quay lại trang danh sách
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi lưu khóa học.");
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-info">
          <h2 className="heading-1">{isEditMode ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}</h2>
          <p className="text-muted">
            {isEditMode ? `Cập nhật thông tin cho khóa học ID: ${id}` : "Điền thông tin chi tiết để xuất bản khóa học của bạn."}
          </p>
        </div>
        <Link to="/teacher/courses" className="btn-secondary">
          <span>⬅️</span> Quay lại
        </Link>
      </div>

      <div className="card">
        {error && (
          <div className="error-container" style={{ height: 'auto', padding: '12px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tên khóa học (Name)</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} 
                className="form-input" placeholder="VD: ReactJS Cơ bản" required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tiêu đề phụ (Title)</label>
              <input 
                type="text" name="title" value={formData.title} onChange={handleChange} 
                className="form-input" placeholder="VD: Xây dựng nền tảng vững chắc" 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Giá tiền (VNĐ)</label>
              <input 
                type="number" name="price" value={formData.price} onChange={handleChange} 
                className="form-input" min="0" required 
              />
              <span className="text-muted" style={{ fontSize: '12px' }}>Nhập 0 nếu là khóa học miễn phí.</span>
            </div>
            <div className="form-group">
              <label className="form-label">URL Ảnh Thumbnail</label>
              <input 
                type="url" name="image" value={formData.image} onChange={handleChange} 
                className="form-input" placeholder="https://..." 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả ngắn (Description)</label>
            <textarea 
              name="description" value={formData.description} onChange={handleChange} 
              className="form-textarea" style={{ minHeight: '80px' }} required 
              placeholder="Tóm tắt nội dung khóa học trong 1-2 câu..."
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả chi tiết (Detail Description)</label>
            <textarea 
              name="detail_description" value={formData.detail_description} onChange={handleChange} 
              className="form-textarea" 
              placeholder="Học viên sẽ nhận được gì? Yêu cầu đầu vào?..."
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <Link to="/teacher/courses" className="btn-secondary">Hủy bỏ</Link>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : (isEditMode ? "💾 Cập nhật" : "🚀 Xuất bản")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
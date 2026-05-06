import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createCourse, updateCourse, fetchCourseById } from "../services/courseService";
import "../styles/dashboard.css";

export default function AdminCourseForm() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const returnPath = "/admin/courses";

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    price: 0,
    duration: 0,
    image: "",
    description: "",
    detail_description: "",
  });

  useEffect(() => {
    if (isEditMode) {
      loadCourseData();
    }
  }, [id]);

  const loadCourseData = async () => {
    try {
      const data = await fetchCourseById(Number(id));
      const course = data.course || data; 
      setFormData({
        title: course.title || "",
        price: course.price || 0,
        duration: course.duration || 0,
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
      [name]: (name === "price" || name === "duration") ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Gửi dạng JSON chuẩn để backend dễ dàng map với req.body
    const dataToSend = { ...formData };

    try {
      if (isEditMode) {
        await updateCourse(Number(id), dataToSend);
        alert("Cập nhật khóa học thành công (Quyền Admin)!");
      } else {
        await createCourse(dataToSend);
        alert("Tạo khóa học mới thành công (Quyền Admin)!");
      }
      navigate(returnPath); // Quay lại trang danh sách
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
          <h2 className="heading-1">{isEditMode ? "Quản trị: Chỉnh sửa khóa học" : "Quản trị: Tạo khóa học mới"}</h2>
          <p className="text-muted">
            {isEditMode ? `Cập nhật thông tin cho khóa học ID: ${id} với quyền Quản trị viên` : "Thêm khóa học mới vào hệ thống."}
          </p>
        </div>
        {/* <Link to={returnPath} className="btn-secondary">
          <span>⬅️</span> Quay lại
        </Link> */}
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
          <label className="form-label">Tên khóa học (Title)</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-input" placeholder="VD: ReactJS Cơ bản" required />
            </div>
            <div className="form-group">
              <label className="form-label">Thời lượng (Phút)</label>
              <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="form-input" min="0" placeholder="VD: 120" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Giá tiền (VNĐ)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-input" min="0" required />
              <span className="text-muted" style={{ fontSize: '12px' }}>Nhập 0 nếu là khóa học miễn phí.</span>
            </div>
            <div className="form-group">
              <label className="form-label">URL Ảnh Thumbnail</label>
              <input type="text" name="image" value={formData.image} onChange={handleChange} className="form-input" placeholder="https://..." />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả ngắn (Description)</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" style={{ minHeight: '80px' }} required placeholder="Tóm tắt nội dung khóa học trong 1-2 câu..."></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Mô tả chi tiết (Detail Description)</label>
            <textarea name="detail_description" value={formData.detail_description} onChange={handleChange} className="form-textarea" placeholder="Học viên sẽ nhận được gì? Yêu cầu đầu vào?..."></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <Link to={returnPath} className="btn-secondary">Hủy bỏ</Link>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : (isEditMode ? "💾 Lưu Cập Nhật" : "🚀 Thêm Khóa Học")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
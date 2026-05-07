import { useState, useEffect } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { createCourse, updateCourse, fetchCourseById } from "../services/courseService";
import { getCategories } from "../services/categoryService";
import "../styles/dashboard.css";

export default function TeacherCourseForm() {
  const { id } = useParams(); // Lấy ID từ URL nếu đang ở chế độ Edit
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Boolean(id);

  // Xác định đường dẫn quay lại dựa trên URL (Admin hay Teacher)
  const returnPath = location.pathname.includes("/admin") ? "/admin/courses" : "/teacher/courses";

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  // Khởi tạo state cho dữ liệu khóa học
  const [formData, setFormData] = useState({
    title: "",
    price: 0,
    duration: 0,
    image: "",
    description: "",
    detail_description: "",
    category_id: "",
    teacher_id: "",
  });

  useEffect(() => {
      const loadCategory = async () => {
        try {
          const res = await getCategories();
          if (res.success || res.data) setCategories(res.data || res);
        } catch (err) {
          console.error("Lỗi khi tải danh mục:", err);
        }
      };
      loadCategory();
    }, []);

  useEffect(() => {
    if (isEditMode) {
      loadCourseData();
    }
  }, [id]);

  // Lấy danh sách danh mục khi load trang
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getCategories();
        if (res.success || res.data) setCategories(res.data || res);
      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
      }
    };
    fetchCats();
  }, []);

  const loadCourseData = async () => {
    try {
      const data = await fetchCourseById(Number(id));
      const course = data.course || data || {}; // Tùy cấu trúc backend trả về
      if (course) {
        setFormData({
          title: course.title || "",
          price: course.price || 0,
          duration: course.duration || 0,
          image: course.image || "",
          description: course.description || "",
          detail_description: course.detail_description || "",
          category_id: course.category_id || "",
          teacher_id: course.teacher_id || "", 
        });
      }
    } catch (err: any) {
      setError("Không thể tải thông tin khóa học để chỉnh sửa.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === "price" || name === "duration") ? Number(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: "" }));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: "" }));
    // Reset the file input so the user can select the same file again if they want
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'image' && imageFile) return;
      if (value !== null && value !== undefined) {
        dataToSend.append(key, String(value));
      }
    });
    
    if (imageFile) {
      dataToSend.append("image", imageFile);
    }

    try {
      if (isEditMode) {
        await updateCourse(Number(id), dataToSend);
        alert("Cập nhật khóa học thành công!");
      } else {
        await createCourse(dataToSend);
        alert("Tạo khóa học mới thành công!");
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
          <h2 className="heading-1">{isEditMode ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}</h2>
          <p className="text-muted">
            {isEditMode ? `Cập nhật thông tin cho khóa học ID: ${id}` : "Điền thông tin chi tiết để xuất bản khóa học của bạn."}
          </p>
        </div>
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
              <label className="form-label">Danh mục (Category)</label>
              <select 
                name="category_id" value={formData.category_id} onChange={handleChange} 
                className="form-input" required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tên khóa học (Title)</label>
              <input 
                type="text" name="title" value={formData.title} onChange={handleChange} 
                className="form-input" placeholder="VD: ReactJS Cơ bản" required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Thời lượng (Phút)</label>
              <input 
                type="number" name="duration" value={formData.duration} onChange={handleChange} 
                className="form-input" min="0" placeholder="VD: 120"
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
              <label className="form-label">Ảnh Thumbnail (URL hoặc Tải lên)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="text" name="image" value={formData.image} onChange={handleChange} 
                  className="form-input" placeholder="Nhập URL ảnh (https://...)" disabled={!!imageFile}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="text-muted" style={{ fontSize: '14px', whiteSpace: 'nowrap' }}>Hoặc tải ảnh lên:</span>
                  <input 
                    type="file" accept="image/*" onChange={handleImageChange} 
                    className="form-input" style={{ padding: '8px' }}
                  />
                </div>
                {(imagePreview || formData.image) && (
                  <div style={{ marginTop: '8px' }}>
                    <p className="text-muted" style={{ fontSize: '12px', marginBottom: '4px' }}>Xem trước ảnh:</p>
                    <img 
                      src={imagePreview || (formData.image.startsWith('http') ? formData.image : `http://localhost:3000${formData.image}`)} 
                      alt="Preview" 
                      style={{ width: '100%', maxWidth: '200px', height: 'auto', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--f8-border)' }} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x120?text=No+Image';
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{ marginTop: '8px', fontSize: '12px', padding: '4px 8px', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--f8-danger)', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <span style={{fontSize: '14px'}}>🗑️</span>
                      Xóa ảnh
                    </button>
                  </div>
                )}
              </div>
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
            <Link to={returnPath} className="btn-secondary">Hủy bỏ</Link>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Đang lưu..." : (isEditMode ? "💾 Cập nhật" : "🚀 Xuất bản")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
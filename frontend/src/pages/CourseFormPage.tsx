import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { createCourse, updateCourse, getCourseById } from '../features/courseSlice';
import '../styles/dashboard.css'; // Tái sử dụng style từ dashboard

const CourseFormPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const isEditing = Boolean(courseId);
    const { loading, error } = useAppSelector((state) => state.courses);
    // Lấy thông tin khóa học hiện tại nếu đang chỉnh sửa
    const existingCourse = useAppSelector((state) => 
        state.courses.courses.find(c => c.id === Number(courseId))
    );

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (isEditing && courseId) {
            // Nếu chưa có trong state, fetch từ API
            if (!existingCourse) {
                dispatch(getCourseById(Number(courseId)));
            } else {
                setName(existingCourse.name);
                setDescription(existingCourse.description);
                setPrice(existingCourse.price || 0);
                if (existingCourse.image) {
                    const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:3000";
                    setImagePreview(`${API_URL}${existingCourse.image}`);
                }
            }
        }
    }, [courseId, isEditing, existingCourse, dispatch]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', String(price));
        if (image) {
            formData.append('image', image);
        }

        let resultAction;
        if (isEditing && courseId) {
            resultAction = await dispatch(updateCourse({ id: Number(courseId), courseData: formData }));
        } else {
            resultAction = await dispatch(createCourse(formData));
        }

        if (createCourse.fulfilled.match(resultAction) || updateCourse.fulfilled.match(resultAction)) {
            navigate('/teacher'); // Quay về trang dashboard của giáo viên
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1 className="heading-1">{isEditing ? 'Chỉnh Sửa Khóa Học' : 'Tạo Khóa Học Mới'}</h1>
            </div>

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Tên khóa học</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ví dụ: Lập trình ReactJS cho người mới bắt đầu"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mô tả</label>
                        <textarea
                            className="form-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Mô tả ngắn gọn về nội dung khóa học"
                            rows={5}
                            required
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Giá (VND)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Ảnh bìa khóa học</label>
                            <input
                                type="file"
                                className="form-input"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>

                    {imagePreview && (
                        <div className="form-group">
                            <label className="form-label">Xem trước ảnh</label>
                            <img src={imagePreview} alt="Xem trước" style={{ width: '200px', height: 'auto', borderRadius: '8px', border: '1px solid var(--f8-border)' }} />
                        </div>
                    )}

                    {error && <div className="error-container" style={{marginBottom: '20px'}}>{error}</div>}

                    <div className="modal-actions" style={{ marginTop: '32px' }}>
                        <button type="button" className="btn-secondary" onClick={() => navigate('/teacher')}>
                            Hủy
                        </button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật khóa học' : 'Tạo khóa học')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseFormPage;
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/store";
import { getCourseById, clearError } from "../features/courseSlice";
import { checkEnrollment, enrollInCourse, unenrollFromCourse, reEnrollInCourse } from "../features/enrollmentSlice";
import { submitCourseReview } from "../services/courseService";
import { Loading } from "../components";
import "../styles/courseDetail.css";

export default function CourseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { courses, loading, error } = useAppSelector((state) => state.courses);
    const { isEnrolled, enrollmentData, loading: enrollmentLoading } = useAppSelector((state) => state.enrollment);
    const { user } = useAppSelector((state) => state.auth);
    const course = courses[0];
    const courseId = id ? parseInt(id, 10) : 0;
    const enrollment = enrollmentData[courseId];
    const isUserEnrolled = isEnrolled[courseId] || false;
    const [enrollError, setEnrollError] = useState<string | null>(null);

    const [rating, setRating] = useState<number>(0);
    const [hoverRating, setHoverRating] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [submittingReview, setSubmittingReview] = useState<boolean>(false);
    const API_URL = "http://localhost:3000";

    useEffect(() => {
        if (id) {
            dispatch(getCourseById(courseId));
        }
        return () => {
            dispatch(clearError());
        };
    }, [id, dispatch, courseId]);

    // Check enrollment status
    useEffect(() => {
        if (user && courseId) {
            dispatch(checkEnrollment(courseId));
        }
    }, [user, courseId, dispatch]);

    const handleEnroll = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        setEnrollError(null);
        try {
            await dispatch(enrollInCourse(courseId)).unwrap();
            setTimeout(() => {
                dispatch(checkEnrollment(courseId));
            }, 300);
        } catch (err: any) {
            if (err === "INSUFFICIENT_BALANCE") {
                setEnrollError("Số dư của bạn không đủ để đăng ký khóa học này.");
            } else {
                setEnrollError(err || "Lỗi khi đăng ký khóa học");
            }
        }
    };

    const handleUnenroll = async () => {
        if (!window.confirm("Bạn chắc chắn muốn hủy đăng ký khóa học này?")) {
            return;
        }

        setEnrollError(null);
        try {
            await dispatch(unenrollFromCourse(courseId)).unwrap();
            setTimeout(() => {
                dispatch(checkEnrollment(courseId));
            }, 300);
        } catch (err: any) {
            setEnrollError(err || "Lỗi khi hủy đăng ký");
        }
    };

    const handleReEnroll = async () => {
        setEnrollError(null);
        try {
            await dispatch(reEnrollInCourse(courseId)).unwrap();
            setTimeout(() => {
                dispatch(checkEnrollment(courseId));
            }, 300);
        } catch (err: any) {
            setEnrollError(err || "Lỗi khi ghi danh lại");
        }
    };

    const handleSubmitReview = async () => {
        if (rating === 0) return;
        setSubmittingReview(true);
        try {
            await submitCourseReview(courseId, rating, comment);
            alert("Cảm ơn bạn đã đánh giá khóa học!");
            setRating(0);
            setComment("");
            dispatch(getCourseById(courseId)); // Load lại course để cập nhật đánh giá mới
        } catch (err: any) {
            alert(err.message || "Có lỗi xảy ra khi gửi đánh giá");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="course-detail-error">
                <h2>❌ Lỗi</h2>
                <p>{error}</p>
                <button onClick={() => navigate(-1)}>← Quay Lại</button>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-detail-error">
                <h2>🔍 Khóa Học Không Tồn Tại</h2>
                <p>Khóa học bạn tìm kiếm không được tìm thấy trong hệ thống.</p>
                <button onClick={() => navigate(-1)}>← Quay Lại</button>
            </div>
        );
    }

    return (
        <div className="course-detail">
            <button className="course-detail-back" onClick={() => navigate(-1)}>
                ← Quay Lại
            </button>

            <div className="course-detail-container">
                <div className="course-detail-image">
                    {(() => {
                        const imageUrl = course.image?.startsWith("http")
                            ? course.image
                            : course.image?.startsWith("/uploads")
                            ? `${API_URL}${course.image}`
                            : `${API_URL}/uploads/courses/${course.image}`;
                        return (
                            <img
                                src={imageUrl}
                                alt={course.title}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "https://via.placeholder.com/400x300?text=Course+Image";
                                }}
                            />
                        );
                    })()}
                </div>

                <div className="course-detail-content">
                    <h1 className="course-detail-title">{course.title}</h1>

                    {/* Course Stats */}
                    <div className="course-stats">
                        <div className="stat-item">
                            <span className="stat-value">⭐ {course.avg_rating || "0.0"}</span>
                            <span className="stat-label">Đánh Giá</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">👥 {course.student_count || 0}</span>
                            <span className="stat-label">Học Viên</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">📚 {course.lessons?.length || 0}</span>
                            <span className="stat-label">Bài Học</span>
                        </div>
                    </div>

                    <div className="course-detail-meta">
                        <div className="meta-instructor">
                            <img 
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${course.teacher_name}`} 
                                alt={course.teacher_name} 
                                className="instructor-avatar" 
                            />
                            <div className="instructor-info">
                                <span className="instructor-label">👨‍🏫 Giảng Viên</span>
                                <span className="instructor-name">{course.teacher_name || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="meta-price-section">
                            <span className="price-label">💰 Học Phí:</span>
                            <span className="meta-price">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price || 0)}
                            </span>
                        </div>
                    </div>

                    <div className="course-detail-description">
                        <h3>📖 Mô Tả Chi Tiết</h3>
                        {(course.detail_description || course.description || '').split('\n').filter(line => line.trim() !== '').map((line, idx) => (
                            <p key={idx}>{line}</p>
                        ))}
                    </div>

                    {enrollError && (
                        <div className="enrollment-error">
                            <p>⚠️ {enrollError}</p>
                            {enrollError.includes("Số dư") && (
                                <button 
                                    className="btn-primary" 
                                    onClick={() => navigate('/top-up')}
                                >
                                    💳 Nạp Tiền Ngay
                                </button>
                            )}
                        </div>
                    )}

                    <div className="course-actions">
                        {isUserEnrolled ? (
                            enrollment?.status === 'completed' ? (
                                <button
                                    className="course-detail-btn primary-btn"
                                    onClick={handleReEnroll}
                                    disabled={enrollmentLoading}
                                >
                                    <span className="btn-icon">🔄</span>
                                    {enrollmentLoading ? "Đang Xử Lý..." : "Học Lại"}
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="course-detail-btn primary-btn"
                                        onClick={() => navigate(`/courses/${courseId}/learn`)}
                                    >
                                        <span className="btn-icon">▶️</span>
                                        Vào Học
                                    </button>
                                    <button
                                        className="course-detail-btn secondary-btn"
                                        onClick={handleUnenroll}
                                        disabled={enrollmentLoading}
                                    >
                                        <span className="btn-icon">❌</span>
                                        {enrollmentLoading ? "Đang Xử Lý..." : "Hủy Đăng Ký"}
                                    </button>
                                </>
                            )
                        ) : (
                            <button
                                className="course-detail-btn primary-btn"
                                onClick={handleEnroll}
                                disabled={enrollmentLoading}
                            >
                                <span className="btn-icon">✨</span>
                                {enrollmentLoading ? "Đang Xử Lý..." : "Đăng Ký Ngay"}
                            </button>
                        )}
                    </div>

                    {/* Form Viết Đánh Giá (Chỉ hiện khi đã đăng ký) */}
                    {isUserEnrolled && (
                        <div className="review-form-container" style={{ marginTop: '30px' }}>
                            <h4 style={{ fontSize: '18px', marginBottom: '12px', fontWeight: 'bold', color: '#1e293b' }}>
                                Viết đánh giá của bạn
                            </h4>
                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span 
                                        key={star} 
                                        className={`star ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <textarea 
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Chia sẻ cảm nhận của bạn về khóa học này..."
                                className="form-textarea"
                                rows={3}
                                style={{ width: '100%', marginBottom: '12px' }}
                            />
                            <button 
                                className="course-detail-btn primary-btn" 
                                onClick={handleSubmitReview}
                                disabled={submittingReview || rating === 0}
                                style={{ width: 'auto', padding: '10px 24px' }}
                            >
                                {submittingReview ? "Đang gửi..." : "Gửi Đánh Giá"}
                            </button>
                        </div>
                    )}

                    {/* Phần Đánh Giá Khóa Học */}
                    <div className="course-reviews" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', color: '#1e293b' }}>
                            💬 Đánh Giá Từ Học Viên ({course.review_count || 0})
                        </h3>
                        {course.reviews && course.reviews.length > 0 ? (
                            <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {course.reviews.map((review: any) => (
                                    <div key={review.id} className="review-item" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span className="review-user" style={{ fontWeight: 'bold', color: '#1e293b' }}>👤 {review.user_name}</span>
                                            <span className="review-rating" style={{ color: '#f59e0b', fontSize: '14px' }}>{'⭐'.repeat(review.rating)}</span>
                                        </div>
                                        <p className="review-comment" style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                                            {review.comment}
                                        </p>
                                        <span className="review-date" style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px', display: 'block' }}>
                                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#64748b', fontStyle: 'italic', background: '#f8fafc', padding: '16px', borderRadius: '8px' }}>Chưa có đánh giá nào cho khóa học này. Hãy là người đầu tiên học và để lại cảm nhận nhé!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
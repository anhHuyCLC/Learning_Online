import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/store";
import { getCourseById, clearError } from "../features/courseSlice";
import { checkEnrollment, enrollInCourse, unenrollFromCourse, reEnrollInCourse } from "../features/enrollmentSlice";
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
    const API_URL = (import.meta as any).env.VITE_API_URL || "https://gout-atop-protract.ngrok-free.dev";

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

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="course-detail-error">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-detail-error">
                <h2>Course Not Found</h2>
                <p>The course you're looking for doesn't exist.</p>
                <button onClick={() => navigate(-1)}>Go Back</button>
            </div>
        );
    }

    return (
        <div className="course-detail">
            <button className="course-detail-back" onClick={() => navigate(-1)}>
                ← Back
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

                    <div className="course-detail-meta">
                        <div className="meta-item">
                            <span className="meta-label">Instructor:</span>
                            <span className="meta-value">{course.teacher_name}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Price:</span>
                            <span className="meta-price">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price || 0)}
                            </span>
                        </div>
                    </div>

                    <div className="course-detail-description">
                        <h3>Mô Tả Chi Tiết</h3>
                        <p>{course.detail_description || course.description}</p>
                    </div>

                    {enrollError && (
                        <div className="enrollment-error" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <p>{enrollError}</p>
                            {enrollError.includes("Số dư") && (
                                <button 
                                    className="btn-primary" 
                                    onClick={() => navigate('/top-up')}
                                    style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '13px' }}
                                >
                                    Nạp tiền ngay
                                </button>
                            )}
                        </div>
                    )}

                    <div className="course-actions">
                        {isUserEnrolled ? (
                            enrollment?.status === 'completed' ? (
                                <button
                                    className="course-detail-btn"
                                    onClick={handleReEnroll}
                                    disabled={enrollmentLoading}
                                >
                                    {enrollmentLoading ? "Đang xử lý..." : "Ghi danh lại"}
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="course-detail-btn view-course-btn"
                                        onClick={() => navigate(`/courses/${courseId}/learn`)}
                                    >
                                        Vào học
                                    </button>
                                    <button
                                        className="course-detail-btn unenroll-btn"
                                        onClick={handleUnenroll}
                                        disabled={enrollmentLoading}
                                    >
                                        {enrollmentLoading ? "Đang xử lý..." : "Hủy Đăng Ký"}
                                    </button>
                                </>
                            )
                        ) : (
                            <button
                                className="course-detail-btn"
                                onClick={handleEnroll}
                                disabled={enrollmentLoading}
                            >
                                {enrollmentLoading ? "Đang xử lý..." : "Đăng Ký Ngay"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
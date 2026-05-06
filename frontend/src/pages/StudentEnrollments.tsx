import React, { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/store";
import { getStudentEnrollments, unenrollFromCourse } from "../features/enrollmentSlice";
import { Header } from "../components/Header";
import "../styles/enrollments.css";

const StudentEnrollments: React.FC = () => {
    const dispatch = useAppDispatch();
    const { enrollments, loading, error } = useAppSelector((state) => state.enrollment);
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
    const [unenrollingId, setUnenrollingId] = useState<number | null>(null);
    const API_URL = (import.meta as ImportMeta).env.VITE_API_URL || "https://gout-atop-protract.ngrok-free.dev";

    useEffect(() => {
        dispatch(getStudentEnrollments());
    }, [dispatch]);

    const handleUnenroll = async (courseId: number) => {
        if (window.confirm("Bạn chắc chắn muốn hủy đăng ký khóa học này?")) {
            setUnenrollingId(courseId);
            try {
                await dispatch(unenrollFromCourse(courseId));
            } finally {
                setUnenrollingId(null);
            }
        }
    };

    const enrollmentCounts = useMemo(() => {
        return {
            all: enrollments.length,
            active: enrollments.filter((e) => e.status === "active").length,
            completed: enrollments.filter((e) => e.status === "completed").length,
        };
    }, [enrollments]);

    const filteredEnrollments = useMemo(() => {
        if (filter === "all") {
            return enrollments;
        }
        return enrollments.filter((enrollment) => enrollment.status === filter);
    }, [enrollments, filter]);
    
    return (
        <div className="enrollments-page">
            <Header title="Khóa Học Của Tôi" subtitle="Danh sách các khóa học bạn đã đăng ký" />
            {error && (
                <div className="error-banner">
                    <p>{error}</p>
                </div>
            )}

            <div className="enrollments-container">
                <div className="filter-tabs">
                    <button
                        className={`filter-tab ${filter === "all" ? "active" : ""}`}
                        onClick={() => setFilter("all")}
                    >
                        Tất Cả ({enrollmentCounts.all})
                    </button>
                    <button
                        className={`filter-tab ${filter === "active" ? "active" : ""}`}
                        onClick={() => setFilter("active")}
                    >
                        Đang Học ({enrollmentCounts.active})
                    </button>
                    <button
                        className={`filter-tab ${filter === "completed" ? "active" : ""}`}
                        onClick={() => setFilter("completed")}
                    >
                        Hoàn Thành ({enrollmentCounts.completed})
                    </button>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Đang tải khóa học...</p>
                    </div>
                ) : filteredEnrollments.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📚</div>
                        <h3>
                            {filter === "all"
                                ? "Bạn chưa đăng ký khóa học nào"
                                : `Không có khóa học ${filter === "active" ? "đang học" : "hoàn thành"}`}
                        </h3>
                        <p>
                            {filter === "all"
                                ? "Hãy khám phá những khóa học thú vị trên trang chủ"
                                : "Hãy chọn filter khác để xem khóa học"}
                        </p>
                    </div>
                ) : (
                    <div className="enrollments-grid">
                        {filteredEnrollments.map((enrollment) => (
                            <div key={enrollment.id} className="enrollment-card">
                                <div className="enrollment-image">
                                    <img 
                                        src={enrollment.course_image 
                                            ? (enrollment.course_image.startsWith("http") 
                                                ? enrollment.course_image 
                                                : `${API_URL}${enrollment.course_image}`) 
                                            : "https://via.placeholder.com/300x200?text=Course"} 
                                        alt={enrollment.course_name} 
                                    />
                                    <span className={`status-badge status-${enrollment.status}`}>
                                        {enrollment.status === "active" ? "🔄 Đang Học" : "✅ Hoàn Thành"}
                                    </span>
                                </div>

                                <div className="enrollment-content">
                                    <h3>{enrollment.course_name}</h3>
                                    <p className="teacher-name">👨‍🏫 {enrollment.teacher_name}</p>
                                    <p className="course-description">{enrollment.course_description.substring(0, 100)}...</p>

                                    <div className="progress-section">
                                        <div className="progress-header">
                                            <span>Tiến độ học tập</span>
                                            <span className="progress-percent">{Math.round(Number(enrollment.progress) || 0)}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-fill"
                                                style={{ width: `${Math.round(Number(enrollment.progress) || 0)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="enrollment-footer">
                                        <span className="enrolled-date">
                                            📅 Đăng ký: {new Date(enrollment.enrolled_at).toLocaleDateString("vi-VN")}
                                        </span>

                                        <button
                                            className="btn-unenroll"
                                            onClick={() => handleUnenroll(enrollment.course_id)}
                                            disabled={unenrollingId === enrollment.course_id}
                                        >
                                            {unenrollingId === enrollment.course_id ? "Đang xử lý..." : "Hủy Đăng Ký"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentEnrollments;

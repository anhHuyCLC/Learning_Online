import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/store";
import { getCourseById, clearError } from "../features/courseSlice";
import { Loading } from "../components";
import "../styles/courseDetail.css";

export default function CourseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { courses, loading, error } = useAppSelector((state) => state.courses);
    const course = courses[0]; // getCourseById stores single course in array
    const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

    useEffect(() => {
        if (id) {
            const courseId = parseInt(id, 10);
            dispatch(getCourseById(courseId));
        }
        return () => {
            dispatch(clearError());
        };
    }, [id, dispatch]);

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
                        console.log("Course image field:", course.image);
                        console.log("Final image URL:", imageUrl);
                        return (
                            <img
                                src={imageUrl}
                                alt={course.title}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    // console.error("Image load error:", {
                                    //     failedUrl: target.src,
                                    //     imageField: course.image,
                                    //     apiUrl: API_URL
                                    // });
                                    target.src = "https://via.placeholder.com/400x300?text=Course+Image";
                                }}
                            />
                        );
                    })()}
                </div>

                <div className="course-detail-content">
                    <h1 className="course-detail-title">{course.title}</h1>
                    <p className="course-detail-name">Course: {course.name}</p>

                    <div className="course-detail-meta">
                        <div className="meta-item">
                            <span className="meta-label">Instructor:</span>
                            <span className="meta-value">{course.teacher_name}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Price:</span>
                            <span className="meta-price">
                                {Number(course.price).toFixed(0)} VNĐ
                            </span>
                        </div>
                    </div>

                    <div className="course-detail-description">
                        <h3>Mô Tả Chi Tiết</h3>
                        <p>{course.detail_description || course.description}</p>
                    </div>

                    <button className="course-detail-btn">Enroll Now</button>
                </div>
            </div>
        </div>
    );
}
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchTeacherDashboardData } from '../features/teacherSlice';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const TeacherDashboard = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { stats, courses, loading, error } = useAppSelector((state) => state.teacher);
    const API_URL = "http://localhost:3000";
    const [pendingQuestions, setPendingQuestions] = useState<any[]>([]);
    const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        dispatch(fetchTeacherDashboardData());
        loadPendingQuestions();
    }, [dispatch]);

    const loadPendingQuestions = async () => {
        try {
            const res = await apiClient.get('/teacher/pending-questions');
            setPendingQuestions(res.data.questions || res.data || []);
        } catch (err) {
            console.error("Lỗi khi tải câu hỏi:", err);
        }
    };

    const handleReplyQuestion = async (questionId: number, lessonId: number) => {
        const content = replyContent[questionId];
        if (!content?.trim()) return;
        
        try {
            await apiClient.post(`/lessons/${lessonId}/comments`, { content, parent_id: questionId });
            setReplyContent(prev => ({ ...prev, [questionId]: '' }));
            alert("Đã gửi câu trả lời!");
            loadPendingQuestions();
        } catch (err) {
            alert("Lỗi khi gửi câu trả lời.");
        }
    };

    const calculatedRevenue = courses.reduce((total, course) => {
        const price = Number(course.price) || 0;
        const enrollments = Number(course.enrollment_count) || 0;
        return total + (price * enrollments);
    }, 0);

    const finalRevenue = (Number(stats.totalRevenue) > 0) ? Number(stats.totalRevenue) : calculatedRevenue;

    const statItems = [
        { icon: '📚', title: 'Tổng Khóa Học', value: stats.totalCourses, color: 'icon-primary' },
        { icon: '👥', title: 'Tổng Học Viên', value: stats.totalStudents, color: 'icon-indigo' },
        { 
            icon: '💰', 
            title: 'Tổng Doanh Thu', 
            // Hiển thị số tiền đã được tính toán an toàn
            value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalRevenue), 
            color: 'icon-emerald' 
        },
    ];

    const handleViewStudents = (course: any) => {
        navigate(`/teacher/courses/${course.id}/students`);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-info">
                    <h1 className="heading-1">Bảng Điều Khiển Giáo Viên</h1>
                    <p className="text-muted">Quản lý khóa học và theo dõi hiệu suất của bạn.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statItems.map(item => (
                    <div key={item.title} className="stat-card">
                        <div className="stat-header">
                            <div className={`stat-icon ${item.color}`}>{item.icon}</div>
                        </div>
                        <p className="stat-title">{item.title}</p>
                        <h3 className="stat-value">{item.value}</h3>
                    </div>
                ))}
            </div>

            {/* Pending Questions Table */}
            <div className="card mt-6">
                <div className="card-header">
                    <h2 className="heading-2">Câu Hỏi Chờ Trả Lời</h2>
                </div>
                
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Học viên</th>
                                <th>Khóa học - Bài học</th>
                                <th>Nội dung câu hỏi</th>
                                <th>Thời gian</th>
                                <th className="text-center" style={{ width: '250px' }}>Trả lời</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingQuestions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center p-4 text-muted">
                                        🎉 Hiện tại không có câu hỏi nào đang chờ xử lý.
                                    </td>
                                </tr>
                            ) : (
                                pendingQuestions.map((q) => (
                                    <tr key={q.id}>
                                        <td className="font-bold">{q.user_name}</td>
                                        <td>
                                            <div style={{ fontSize: '13px', color: 'var(--f8-primary)' }}>{q.course_title}</div>
                                            <div style={{ fontSize: '12px' }}>{q.lesson_title}</div>
                                        </td>
                                        <td>{q.content}</td>
                                        <td>{new Date(q.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input 
                                                    type="text" 
                                                    className="form-input" 
                                                    placeholder="Nhập câu trả lời..." 
                                                    style={{ padding: '6px 10px', fontSize: '13px' }}
                                                    value={replyContent[q.id] || ''}
                                                    onChange={(e) => setReplyContent({...replyContent, [q.id]: e.target.value})}
                                                    onKeyPress={(e) => e.key === 'Enter' && handleReplyQuestion(q.id, q.lesson_id)}
                                                />
                                                <button className="btn-primary btn-sm" onClick={() => handleReplyQuestion(q.id, q.lesson_id)}>
                                                    Gửi
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* My Courses Table */}
            <div className="card mt-6">
                <div className="card-header">
                    <h2 className="heading-2">Các Khóa Học Của Tôi</h2>
                    <button className="btn-primary btn-sm" onClick={() => navigate('/teacher/courses/new')}>Tạo khóa học mới</button>
                </div>

                {loading && courses.length === 0 && <div className="loading-container"><div className="spinner"></div></div>}
                {error && <div className="error-container">{error}</div>}

                {!loading && !error && (
                    courses.length === 0 ? (
                        <div className="text-center p-4">
                            <span style={{ fontSize: '48px' }}>📭</span>
                            <h3 className="heading-2 mt-4">Bạn chưa có khóa học nào</h3>
                            <p className="text-muted mt-4">Hãy bắt đầu tạo khóa học đầu tiên để chia sẻ kiến thức của bạn.</p>
                            <button className="btn-primary mt-4" onClick={() => navigate('/teacher/courses/new')}>Tạo khóa học ngay</button>
                        </div>
                    ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Khóa học</th>
                                    <th>Giá</th>
                                    <th>Số học viên</th>
                                    <th>Ngày tạo</th>
                                    <th className="text-center">Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td>
                                            <div className="user-info">
                                                <img 
                                                    src={course.image ? (course.image.startsWith('http') ? course.image : `${API_URL}${course.image}`) : `https://via.placeholder.com/40x40?text=${course.title.charAt(0)}`} 
                                                    alt={course.title} 
                                                    className="course-thumbnail-sm" 
                                                />
                                                <span className="user-name">{course.title}</span>
                                            </div>
                                        </td>
                                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price || 0)}</td>
                                        <td>{course.enrollment_count || 0}</td>
                                        <td>{new Date(course.created_at).toLocaleDateString('vi-VN')}</td>
                                        <td className="text-center">
                                            <button className="btn-secondary btn-sm" onClick={() => handleViewStudents(course)}>Xem học viên</button>
                                            <button className="btn-text" style={{ marginLeft: '8px' }} onClick={() => navigate(`/teacher/courses/edit/${course.id}`)}>Quản lý</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
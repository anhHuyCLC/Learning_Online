import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { getCourseById } from '../features/courseSlice';
import { getProgressForCourse, markLessonAsCompleted } from '../features/progressSlice';
import { fetchQuizByLessonId, fetchQuizStatus } from '../features/quizSlice'; // IMPORT MỚI
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import type { Lesson } from '../type/coursesType';
import apiClient from '../services/apiClient';
import '../styles/courseLearning.css';

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const courseIdNum = parseInt(courseId || '0', 10);
  const lessonIdNum = parseInt(lessonId || '0', 10);

  const { courses, loading: courseLoading, error } = useAppSelector((state) => state.courses);
  const { completedLessons } = useAppSelector((state) => state.progress);
  
  const { quiz, passedLessonQuizzes } = useAppSelector((state) => state.quiz);
  const { user } = useAppSelector((state: any) => state.auth);

  const course = courses?.[0];
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'discussion'>('overview');
  const [showToast, setShowToast] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const estimatedVideoDuration = 20 * 60; 

  useEffect(() => {
    if (courseIdNum) {
      dispatch(getCourseById(courseIdNum));
      dispatch(getProgressForCourse(courseIdNum));
    }
  }, [dispatch, courseIdNum]);

  useEffect(() => {
    if (course?.lessons) {
      const currentLesson = course.lessons.find((l: Lesson) => l.id === lessonIdNum);
      setLesson(currentLesson || null);
    }
  }, [course, lessonIdNum]);

  // Fetch Quiz & Quiz Status khi lesson thay đổi
  useEffect(() => {
    if (lessonIdNum) {
      dispatch(fetchQuizByLessonId(lessonIdNum));
      dispatch(fetchQuizStatus(lessonIdNum));
    }
  }, [dispatch, lessonIdNum]);

  useEffect(() => {
    if (lessonIdNum && activeTab === 'discussion') {
      loadComments();
    }
  }, [lessonIdNum, activeTab]);

  const loadComments = async () => {
    try {
      const res = await apiClient.get(`/lessons/${lessonIdNum}/comments`);
      setComments(res.data.comments || res.data || []);
    } catch (err) {
      console.error("Lỗi khi tải bình luận:", err);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      await apiClient.post(`/lessons/${lessonIdNum}/comments`, { content: newComment });
      setNewComment("");
      loadComments();
    } catch (err) {
      alert("Lỗi khi gửi câu hỏi.");
    }
  };

  const handlePostReply = async (parentId: number) => {
    if (!replyContent.trim()) return;
    try {
      await apiClient.post(`/lessons/${lessonIdNum}/comments`, { content: replyContent, parent_id: parentId });
      setReplyContent("");
      setReplyingTo(null);
      loadComments();
    } catch (err) {
      alert("Lỗi khi gửi câu trả lời.");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;
    try {
      await apiClient.delete(`/comments/${commentId}`);
      loadComments();
    } catch (err) {
      alert("Lỗi khi xóa bình luận.");
    }
  };

  const isCompleted = completedLessons.includes(lessonIdNum);
  const hasQuiz = quiz && quiz.lesson_id === lessonIdNum; 
  const isQuizPassed = passedLessonQuizzes[lessonIdNum] === true; 

  // Bắt buộc xem xong bài, và NẾU có quiz thì phải PASS quiz
  const canProceedToNext = isCompleted && (!hasQuiz || isQuizPassed);

  // Timer cho video watching
  useEffect(() => {
    if (!isCompleted && lesson?.video_url) {
      const interval = setInterval(() => {
        setWatchTime(prev => {
          const newTime = prev + 1;
          // Auto mark as completed khi đạt 80% thời lượng
          if (newTime >= estimatedVideoDuration * 0.8) {
            handleAutoMarkAsCompleted();
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isCompleted, lesson?.video_url]);

  const handleMarkAsCompleted = () => {
    dispatch(markLessonAsCompleted({ lessonId: lessonIdNum, courseId: courseIdNum }));
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleAutoMarkAsCompleted = () => {
    dispatch(markLessonAsCompleted({ lessonId: lessonIdNum, courseId: courseIdNum }));
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleBackToCourseLearning = () => {
    // Dùng lùi lịch sử để không sinh ra vòng lặp
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(`/courses/${courseIdNum}/learn`, { replace: true });
    }
  };

  const getProgressPercentage = () => {
    if (!course?.lessons?.length) return 0;
    return Math.round((completedLessons.length / course.lessons.length) * 100);
  };

  if (courseLoading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!course || !lesson) {
    return (
      <div>
        <Header title="Bài học" />
        <div className="container">
          <p>Không tìm thấy bài học.</p>
        </div>
      </div>
    );
  }

  const sortedLessons = [...(course.lessons || [])].sort((a: Lesson, b: Lesson) => (a.lesson_order ?? 0) - (b.lesson_order ?? 0));
  const currentLessonIndex = sortedLessons.findIndex(l => l.id === lesson.id);
  const nextLesson = sortedLessons[currentLessonIndex + 1];

  return (
    <div className="lesson-page-bg">
      <Header 
        title={course.title}
        onBackClick={handleBackToCourseLearning}
      />
      
      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <span className="toast-icon">✅</span>
          <div className="toast-content">
            <h4>Tuyệt vời!</h4>
            <p>Bạn đã hoàn thành bài học này.</p>
          </div>
        </div>
      )}

      <div className="lesson-page-layout">
        {/* LEFT COLUMN: Video & Content */}
        <div className="lesson-main">
          {/* Video Player */}
          <div className="video-player-wrapper">
            {lesson.video_url ? (
              <div className='video'>
                <iframe
                  className="video-iframe"
                  src={lesson.video_url}
                  title={lesson.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                {!isCompleted && (
                  <div className="video-completion-hint">
                    <p>💡 Video sẽ được tự động đánh dấu là hoàn thành khi bạn xem xong ({Math.floor(watchTime / 60)}/{Math.floor(estimatedVideoDuration / 60)} phút)</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="no-video-fallback">
                <span className="fallback-icon">🎥</span>
                <p>Bài học này không có video</p>
              </div>
            )}
          </div>

          {/* Lesson Details & Actions */}
          <div className="lesson-details-card">
            <div className="lesson-header-flex">
              <div>
                <h1 className="lesson-title-large">Bài {lesson.lesson_order}: {lesson.title}</h1>
                <div className="lesson-meta-info">
                  {hasQuiz && <span className="meta-badge quiz">📝 Có Quiz</span>}
                  {isCompleted && <span className="meta-badge completed">✅ Đã hoàn thành</span>}
                </div>
              </div>
              
              <div className="lesson-primary-actions">
                {!isCompleted ? (
                  <div className="auto-complete-status">
                    <span className="status-icon">⏳</span>
                    <span className="status-text">Vui lòng xem hết video để tự động đánh dấu hoàn thành</span>
                  </div>
                ) : (
                  hasQuiz && (
                    <button 
                      className={`btn-quiz ${isQuizPassed ? 'passed' : 'pending'}`}
                      onClick={() => navigate(`/quiz/lesson/${lessonIdNum}`)}
                    >
                      <span className="icon">📝</span>
                      {isQuizPassed ? 'Làm lại Quiz' : 'Làm Quiz ngay'}
                    </button>
                  )
                )}

                {nextLesson ? (
                  <button
                    className={`btn-next-lesson ${!canProceedToNext ? 'disabled' : ''}`}
                    onClick={(e) => {
                      if (!canProceedToNext) {
                        e.preventDefault();
                        if (!isCompleted) {
                          alert("⏳ Vui lòng xem hết video trước!");
                        } else if (hasQuiz && !isQuizPassed) {
                          alert("📝 Bạn phải hoàn thành và đạt điểm qua bài Quiz để chuyển sang bài tiếp theo!");
                        }
                      } else {
                        navigate(`/courses/${courseIdNum}/lessons/${nextLesson.id}`, { replace: true });
                      }
                    }}
                  >
                    Bài tiếp theo
                    <span className="icon">➡️</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      alert("🎉 Chúc mừng bạn đã hoàn thành xuất sắc khóa học!");
                      navigate('/profile');
                    }} 
                    className="btn-finish-course"
                    disabled={!canProceedToNext}
                  >
                    🏆 Hoàn thành khóa học
                  </button>
                )}
              </div>
            </div>
            
            {hasQuiz && isCompleted && !isQuizPassed && (
              <div className="quiz-warning-banner">
                ⚠️ Bạn cần hoàn thành bài Quiz để có thể qua bài học tiếp theo.
              </div>
            )}

            {/* Tabs Navigation */}
            <div className="lesson-tabs">
              <button 
                className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Tổng quan
              </button>
              <button 
                className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
                onClick={() => setActiveTab('materials')}
              >
                Tài liệu
              </button>
              <button 
                className={`tab-btn ${activeTab === 'discussion' ? 'active' : ''}`}
                onClick={() => setActiveTab('discussion')}
              >
                Thảo luận
              </button>
            </div>
            
            <div className="lesson-tab-content">
              {activeTab === 'overview' && (
                <div className="content-overview">
                  <h3>Nội dung bài học</h3>
                  <div className="content-text">{lesson.content || 'Chưa có mô tả cho bài học này.'}</div>
                </div>
              )}
              {activeTab === 'materials' && (
                <div className="content-empty">
                  <span className="empty-icon">📁</span>
                  <p>Chưa có tài liệu đính kèm.</p>
                </div>
              )}
              {activeTab === 'discussion' && (
                <div className="content-discussion" style={{ padding: '20px', background: '#f8fafc', borderRadius: '8px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '16px' }}>💬 Thảo luận & Hỏi đáp</h3>
                  
                  <div className="comment-box" style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Bạn có câu hỏi gì về bài học này?" 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
                    />
                    <button className="btn-primary" onClick={handlePostComment}>Gửi</button>
                  </div>

                  <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {comments.length === 0 ? (
                      <p className="text-muted text-center">Chưa có thảo luận nào. Hãy là người đầu tiên đặt câu hỏi!</p>
                    ) : (
                      comments.map(comment => (
                        <div key={comment.id} className="comment-item" style={{ background: 'white', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <strong style={{ color: comment.role === 'teacher' ? 'var(--f8-primary)' : '#1e293b' }}>
                              {comment.user_name} {comment.role === 'teacher' && '👨‍🏫'}
                            </strong>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                              {new Date(comment.created_at).toLocaleString('vi-VN')}
                            </span>
                          </div>
                          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155' }}>{comment.content}</p>
                          
                          <button 
                            className="btn-text btn-sm" 
                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          >
                            Phản hồi
                          </button>
                          
                          {(user?.id === comment.user_id || user?.role === 'teacher' || user?.role === 'admin') && (
                            <button 
                              className="btn-text btn-sm" 
                              onClick={() => handleDeleteComment(comment.id)}
                              style={{ color: 'var(--f8-danger)' }}
                            >
                              Xóa
                            </button>
                          )}

                          {/* Form Reply */}
                          {replyingTo === comment.id && (
                            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', marginLeft: '24px' }}>
                              <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Nhập câu trả lời..." 
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handlePostReply(comment.id)}
                              />
                              <button className="btn-secondary btn-sm" onClick={() => handlePostReply(comment.id)}>Gửi</button>
                            </div>
                          )}

                          {/* List Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="replies-list" style={{ marginTop: '16px', marginLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '2px solid #e2e8f0', paddingLeft: '16px' }}>
                              {comment.replies.map((reply: any) => (
                                <div key={reply.id} className="reply-item">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <strong style={{ fontSize: '13px', color: reply.role === 'teacher' ? 'var(--f8-primary)' : '#1e293b' }}>
                                      {reply.user_name} {reply.role === 'teacher' && '👨‍🏫'}
                                    </strong>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{new Date(reply.created_at).toLocaleString('vi-VN')}</span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>{reply.content}</p>
                                  
                                  {(user?.id === reply.user_id || user?.role === 'teacher' || user?.role === 'admin') && (
                                    <button 
                                      className="btn-text btn-sm" 
                                      style={{ color: 'var(--f8-danger)', padding: '4px 0', fontSize: '11px', marginTop: '4px' }}
                                      onClick={() => handleDeleteComment(reply.id)}
                                    >
                                      Xóa
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <aside className="lesson-sidebar">
          {/* Progress Card */}
          <div className="sidebar-progress-card">
            <div className="progress-header">
              <h3>Tiến độ khóa học</h3>
              <span className="progress-text">{completedLessons.length}/{course.lessons?.length || 0} bài</span>
            </div>
            <div className="progress-bar-track">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>

          {/* Playlist / Lessons List */}
          <div className="sidebar-playlist-card">
            <h3 className="playlist-title">Nội dung khóa học</h3>
            <div className="playlist-scroll">
              {sortedLessons.map((l, index) => {
                const isItemCompleted = completedLessons.includes(l.id);
                const isCurrent = l.id === lesson.id;
                
                // Lock logic
                const prevLesson = sortedLessons[index - 1];
                const isPrevLessonCompleted = prevLesson ? completedLessons.includes(prevLesson.id) : true;
                const isLocked = index !== 0 && !isPrevLessonCompleted;

                return (
                  <div 
                    key={l.id} 
                    className={`playlist-item ${isCurrent ? 'current' : ''} ${isItemCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                    onClick={() => {
                      if (!isLocked && !isCurrent) {
                        navigate(`/courses/${courseIdNum}/lessons/${l.id}`, { replace: true });
                      }
                    }}
                  >
                    <div className="item-icon">
                      {isItemCompleted ? '✓' : (isLocked ? '🔒' : (isCurrent ? '▶' : '📄'))}
                    </div>
                    <div className="item-content">
                      <div className="item-title">Bài {l.lesson_order}: {l.title}</div>
                      <div className="item-duration">
                        {l.has_quiz && <span className="item-badge">Quiz</span>}
                        ⏱️ {30 + index * 5} phút
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default LessonPage;
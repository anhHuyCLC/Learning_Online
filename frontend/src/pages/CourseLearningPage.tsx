import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { getCourseById } from '../features/courseSlice';
import { getProgressForCourse, markLessonAsCompleted } from '../features/progressSlice';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import type { Lesson } from '../type/coursesType';
import '../styles/courseLearning.css';

const CourseLearningPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id || '0', 10);
  const dispatch = useAppDispatch();
  const { courses, loading, error } = useAppSelector((state) => state.courses);
  const { completedLessons } = useAppSelector((state) => state.progress);
  const course = courses?.[0];
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

  useEffect(() => {
    if (courseId) {
      dispatch(getCourseById(courseId));
      dispatch(getProgressForCourse(courseId));
    }
  }, [dispatch, courseId]);

  const handleMarkAsCompleted = (lessonId: number) => {
    dispatch(markLessonAsCompleted({ lessonId, courseId }));
  };

  const getStatusIcon = (isCompleted: boolean, isLocked: boolean) => {
    if (isCompleted) return '✓';
    if (isLocked) return '🔒';
    return '▶';
  };

  const estimateDuration = (index: number) => {
    return `${30 + index * 5} phút`;
  };

  const getProgressPercentage = () => {
    if (!course?.lessons?.length) return 0;
    return Math.round((completedLessons.length / course.lessons.length) * 100);
  };

  const getDifficultyLevel = (index: number): 'Cơ bản' | 'Trung bình' | 'Nâng cao' => {
    if (index < 2) return 'Cơ bản';
    if (index < 5) return 'Trung bình';
    return 'Nâng cao';
  };

  const getDifficultyColor = (level: string): string => {
    switch(level) {
      case 'Cơ bản': return '#10b981';
      case 'Trung bình': return '#f59e0b';
      case 'Nâng cao': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!course) {
    return (
      <div>
        <Header title="Khóa học" />
        <div className="container">
          <p>Không tìm thấy khóa học.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Khóa học" />
      <div className="course-learning-wrapper">
        <div className="course-learning-container">
          <div className="course-learning-main">
            <div className="course-learning-header">
              <div className="header-top">
                <div>
                  <h1 className="course-title">{course.title}</h1>
                  <p className="course-description">{course.description}</p>
                </div>
                <div className="header-stats">
                  <span className="stat-badge">{course.lessons?.length || 0} bài học</span>
                </div>
              </div>
            </div>

            <div className="lessons-list">
              <div className="lessons-list-header">
                <h2>📚 Danh sách bài học</h2>
                <span className="lessons-count-info">
                  {completedLessons.length}/{course.lessons?.length || 0}
                </span>
              </div>

              {course.lessons && course.lessons.length > 0 ? (
                <ul className="lessons-list-content">
                  {[...course.lessons]
                    .sort((a: Lesson, b: Lesson) => (a.lesson_order ?? 0) - (b.lesson_order ?? 0))
                    .map((lesson: Lesson, index) => {
                      const isCompleted = completedLessons.includes(lesson.id);
                      const prevLesson = course.lessons ? course.lessons[index - 1] : undefined;
                      const isPrevLessonCompleted = prevLesson ? completedLessons.includes(prevLesson.id) : true;
                      const isLocked = index !== 0 && !isPrevLessonCompleted;
                      const isExpanded = expandedLesson === lesson.id;
                      const difficulty = getDifficultyLevel(index);

                      return (
                        <li 
                          key={lesson.id} 
                          className={`lesson-item ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''} ${isExpanded ? 'expanded' : ''}`}
                          onClick={() => !isLocked && setExpandedLesson(isExpanded ? null : lesson.id)}
                        >
                          <div className="lesson-item-icon">
                            <span className="icon-inner">{getStatusIcon(isCompleted, isLocked)}</span>
                          </div>
                          
                          <div className="lesson-item-content">
                            <Link
                              to={!isLocked ? `/courses/${courseId}/lessons/${lesson.id}` : '#'}
                              onClick={(e) => e.stopPropagation()}
                              style={{ textDecoration: 'none' }}
                            >
                              <div className="lesson-header-info">
                                <h3 className="lesson-item-title">
                                  Bài {lesson.lesson_order}: {lesson.title}
                                </h3>
                                <div className="lesson-badges">
                                  <span 
                                    className="difficulty-badge"
                                    style={{borderColor: getDifficultyColor(difficulty)}}
                                  >
                                    {difficulty}
                                  </span>
                                  {lesson.has_quiz && (
                                    <span className="quiz-badge">📝 Có Quiz</span>
                                  )}
                                </div>
                              </div>
                              <p className="lesson-item-duration">
                                ⏱️ {estimateDuration(index)}
                              </p>
                            </Link>
                            
                            {isExpanded && !isLocked && (
                              <div className="lesson-expanded-info">
                                <p className="lesson-status">
                                  {isCompleted ? '✅ Bạn đã hoàn thành bài học này' : '⏳ Bạn chưa hoàn thành bài học này'}
                                </p>
                              </div>
                            )}

                            <div className="lesson-item-meta">
                              {isCompleted ? '✅ Hoàn thành' : isLocked ? '🔒 Bị khóa' : '⏳ Chưa bắt đầu'}
                            </div>
                          </div>

                          <div className="lesson-actions">
                            {!isLocked && !isCompleted && (
                              <button 
                                className="complete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsCompleted(lesson.id);
                                }}
                                title="Đánh dấu là đã hoàn thành"
                              >
                                <span className="btn-icon">✓</span>
                                <span>Hoàn thành</span>
                              </button>
                            )}
                            {lesson.has_quiz && !isLocked && (
                              <Link 
                                to={`/courses/${courseId}/lessons/${lesson.id}/quiz`} 
                                className="quiz-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="btn-icon">📝</span>
                                <span>Quiz</span>
                              </Link>
                            )}
                          </div>
                        </li>
                      );
                    })}
                </ul>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">📭</span>
                  <p>Chưa có bài học cho khóa học này.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="lessons-sidebar">
            <div className="progress-card">
              <h3>📊 Tiến độ học tập</h3>
              
              <div className="progress-stat-group">
                <div className="progress-stat">
                  <span className="stat-value">{completedLessons.length}</span>
                  <span className="stat-label">Hoàn thành</span>
                </div>
                <div className="stat-divider"></div>
                <div className="progress-stat">
                  <span className="stat-value">{course.lessons?.length || 0}</span>
                  <span className="stat-label">Tổng số</span>
                </div>
              </div>

              <div className="progress-bar-container">
                <div className="progress-label">
                  <span className="progress-percentage">{getProgressPercentage()}%</span>
                </div>
                <div className="progress-bar-track">
                  <div 
                    className="progress-bar-fill"
                    style={{
                      width: `${getProgressPercentage()}%`,
                    }}
                  />
                </div>
              </div>

              <div className="achievement-section">
                <h4>🎯 Mục tiêu</h4>
                {getProgressPercentage() < 50 ? (
                  <p className="achievement-text">Hoàn thành 50% để đạt Mục tiêu sơ cấp</p>
                ) : getProgressPercentage() < 100 ? (
                  <p className="achievement-text">Gần xong! Hoàn thành 100% để đạt Mục tiêu hoàn hảo</p>
                ) : (
                  <p className="achievement-text success">🏆 Tuyệt vời! Bạn đã hoàn thành khóa học</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningPage;

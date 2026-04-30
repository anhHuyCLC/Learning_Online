import React, { useEffect } from 'react';
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
      <div className="course-learning-container">
        <div className="course-learning-main">
          <div className="course-learning-header">
            <h1>{course.title}</h1>
            <p>{course.description}</p>
          </div>

          <div className="lessons-list">
            <h2>📚 Danh sách bài học</h2>
            {course.lessons && course.lessons.length > 0 ? (
              <ul>
                {[...course.lessons]
                  .sort((a: Lesson, b: Lesson) => (a.lesson_order ?? 0) - (b.lesson_order ?? 0))
                  .map((lesson: Lesson, index) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const prevLesson = course.lessons ? course.lessons[index - 1] : undefined;
                    const isPrevLessonCompleted = prevLesson ? completedLessons.includes(prevLesson.id) : true;
                    const isLocked = index !== 0 && !isPrevLessonCompleted;

                    return (
                      <li 
                        key={lesson.id} 
                        className={`lesson-item ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}
                      >
                        <div className="lesson-item-icon">
                          {getStatusIcon(isCompleted, isLocked)}
                        </div>
                        
                        <div className="lesson-item-content">
                          <Link
                            to={!isLocked ? `/courses/${courseId}/lessons/${lesson.id}` : '#'}
                            style={{ textDecoration: 'none' }}
                          >
                            <h3 className="lesson-item-title">
                              {`Bài ${lesson.lesson_order}: ${lesson.title}`}
                            </h3>
                            <p className="lesson-item-duration">
                              ⏱️ {estimateDuration(index)}
                            </p>
                          </Link>
                          <div className="lesson-item-meta">
                            {isCompleted ? '✅ Hoàn thành' : isLocked ? '🔒 Bị khóa' : '⏳ Chưa bắt đầu'}
                            {lesson.has_quiz && ' • 📝 Có bài quiz'}
                          </div>
                        </div>

                        <div className="lesson-actions">
                          {!isLocked && !isCompleted && (
                            <button 
                              className="complete-btn"
                              onClick={() => handleMarkAsCompleted(lesson.id)}
                              title="Đánh dấu là đã hoàn thành"
                            >
                              ✓ Hoàn thành
                            </button>
                          )}
                          {lesson.has_quiz && !isLocked && (
                            <Link to={`/courses/${courseId}/lessons/${lesson.id}/quiz`} className="quiz-link">
                              📝 Quiz
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            ) : (
              <p>Chưa có bài học cho khóa học này.</p>
            )}
          </div>
        </div>

        <aside className="lessons-sidebar">
          <h3>📌 Tiến độ học tập</h3>
          <div style={{
            padding: 'var(--g-x)',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--g)',
              fontSize: 'var(--fs-sm)',
              color: 'var(--text-muted)'
            }}>
              <span>Hoàn thành: {completedLessons.length}</span>
              <span>/{course.lessons?.length || 0} bài</span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'var(--border)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--primary) 0%, var(--primary-600) 100%)',
                width: `${((completedLessons.length / (course.lessons?.length || 1)) * 100)}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CourseLearningPage;

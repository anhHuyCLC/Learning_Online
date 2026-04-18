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
import '../styles/courseLearning.css';

const LessonPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const courseIdNum = parseInt(courseId || '0', 10);
  const lessonIdNum = parseInt(lessonId || '0', 10);

  const { courses, loading: courseLoading, error } = useAppSelector((state) => state.courses);
  const { completedLessons } = useAppSelector((state) => state.progress);
  
  // Lấy dữ liệu quiz từ Redux
  const { quiz, passedLessonQuizzes } = useAppSelector((state) => state.quiz);

  const course = courses?.[0];
  const [lesson, setLesson] = useState<Lesson | null>(null);

  // Fetch Course & Progress
  useEffect(() => {
    if (courseIdNum) {
      dispatch(getCourseById(courseIdNum));
      dispatch(getProgressForCourse(courseIdNum));
    }
  }, [dispatch, courseIdNum]);

  // Set Current Lesson
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

  const handleMarkAsCompleted = () => {
    dispatch(markLessonAsCompleted({ lessonId: lessonIdNum, courseId: courseIdNum }));
  };

  const isCompleted = completedLessons.includes(lessonIdNum);
  const hasQuiz = quiz && quiz.lesson_id === lessonIdNum; 
  const isQuizPassed = passedLessonQuizzes[lessonIdNum] === true; 

  // Bắt buộc xem xong bài, và NẾU có quiz thì phải PASS quiz
  const canProceedToNext = isCompleted && (!hasQuiz || isQuizPassed);

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

  const nextLesson = (course.lessons || [])
    .filter((l: Lesson) => (l.lesson_order ?? 0) > (lesson.lesson_order ?? 0))
    .sort((a: Lesson, b: Lesson) => (a.lesson_order ?? 0) - (b.lesson_order ?? 0))[0];

  return (
    <div>
      <Header title={lesson.title} />
      <div className="course-learning-container">
        <div className="lesson-video-container">
          <p>{lesson.content}</p>
          {lesson.video_url ? (
            <iframe
              width="100%"
              height="500"
              src={lesson.video_url}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <p>Không có video cho bài học này.</p>
          )}
        </div>

        <div className="lesson-actions" style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          
          {/* 1. Nút đánh dấu hoàn thành (Ẩn đi nếu đã hoàn thành, thay bằng text) */}
          {!isCompleted ? (
            <button
              onClick={handleMarkAsCompleted}
              className="complete-btn"
            >
              Đánh dấu đã hoàn thành
            </button>
          ) : (
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
              ✅ Đã xem xong bài học
            </span>
          )}

          {/* 2. Button chuyển trang Quiz (Chỉ hiện khi ĐÃ xem xong & BÀI CÓ QUiZ) */}
          {hasQuiz && isCompleted && (
            <button 
              className="complete-btn" // Dùng chung class để có style giống nút kia
              style={{ backgroundColor: isQuizPassed ? '#17a2b8' : '#ff9800', color: '#fff' }}
              onClick={() => navigate(`/quiz/lesson/${lessonIdNum}`)}
            >
              {isQuizPassed ? '🔄 Làm lại Quiz' : '📝 Chuyển đến trang Làm Quiz'}
            </button>
          )}
          {hasQuiz && isCompleted && (
             <span style={{ fontSize: '0.9em' }}>
               {!isQuizPassed ? (
                 <span style={{ color: '#dc3545' }}>(Bạn cần pass Quiz để qua bài mới)</span>
               ) : (
                 <span style={{ color: '#28a745' }}>(Đã Pass Quiz)</span>
               )}
             </span>
          )}

          {/* 4. Nút Bài học tiếp theo / Hoàn thành khóa học */}
          <div style={{ marginLeft: 'auto' }}>
            {nextLesson ? (
              <button
                className={`complete-btn ${!canProceedToNext ? 'disabled' : ''}`}
                onClick={(e) => {
                  if (!canProceedToNext) {
                    e.preventDefault();
                    alert(hasQuiz 
                      ? "Bạn phải hoàn thành bài học và đạt điểm qua bài Quiz để chuyển sang bài tiếp theo!"
                      : "Vui lòng bấm 'Đánh dấu đã hoàn thành' trước khi qua bài mới!"
                    );
                  } else {
                    navigate(`/courses/${courseIdNum}/lessons/${nextLesson.id}`);
                  }
                }}
                style={{ 
                  backgroundColor: canProceedToNext ? '#007bff' : '#6c757d',
                  cursor: canProceedToNext ? 'pointer' : 'not-allowed' 
                }}
              >
                Bài học tiếp theo ➡️
              </button>
            ) : (
              <button 
                onClick={() => {
                  alert("🎉 Chúc mừng bạn đã hoàn thành xuất sắc khóa học!");
                  navigate('/profile');
                }} 
                className="complete-btn"
                disabled={!canProceedToNext}
                style={{ 
                  backgroundColor: canProceedToNext ? '#28a745' : '#6c757d',
                  cursor: canProceedToNext ? 'pointer' : 'not-allowed' 
                }}
              >
                🏆 Hoàn thành khóa học
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
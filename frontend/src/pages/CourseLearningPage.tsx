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
        <div className="course-learning-header">
          <h1>{course.title}</h1>
          <p>{course.description}</p>
        </div>

        <div className="lessons-list">
          <h2>Bài học</h2>
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
                    <li key={lesson.id} className={`lesson-item ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}>
                      <Link
                        to={!isLocked ? `/courses/${courseId}/lessons/${lesson.id}` : '#'}
                        className={`lesson-link ${isLocked ? 'disabled' : ''}`}
                      >
                        {`${lesson.title}`}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <p>Chưa có bài học cho khóa học này.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseLearningPage;

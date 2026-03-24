import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { getCourseById } from '../features/courseSlice';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import { Lesson } from '../type/coursesType';
import '../styles/courseLearning.css';

const CourseLearningPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { courses, loading, error } = useAppSelector((state) => state.courses);
  const course = courses?.[0];

  useEffect(() => {
    if (id) {
      dispatch(getCourseById(parseInt(id, 10)));
    }
  }, [dispatch, id]);

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
          {course?.lessons && course?.lessons?.length > 0 ? (
            <ul>
              {[...course.lessons] // tránh mutate state
                .sort((a, b) => (a.lesson_order ?? 0) - (b.lesson_order ?? 0))
                .map((lesson: Lesson) => (
                  <li key={lesson.id} className="lesson-item">
                    <span>{`Bài ${lesson.lesson_order}: ${lesson.title}`}</span>
                    {lesson.has_quiz ? (
                      <Link to={`/quiz/lesson/${lesson.id}`} className="quiz-link">
                        Làm Quiz
                      </Link>
                    ) : (
                      <span className="no-quiz">Chưa có quiz</span>
                    )}
                  </li>
                ))}
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

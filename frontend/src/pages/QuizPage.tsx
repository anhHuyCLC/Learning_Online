import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import { fetchQuizByLessonId, submitQuiz, resetQuiz } from '../features/quizSlice';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import './../styles/quiz.css';
import type { Question, QuestionOption } from '../features/quizSlice';
const QuizPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { quiz, loading, error, result } = useAppSelector((state) => state.quiz);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (lessonId) {
      dispatch(fetchQuizByLessonId(parseInt(lessonId, 10)));
    }
    // Reset quiz state on component unmount
    return () => {
      dispatch(resetQuiz());
    };
  }, [dispatch, lessonId]);

  const handleOptionChange = (questionId: number, optionId: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (quiz) {
      const answers = Object.keys(selectedAnswers).map((questionId) => ({
        questionId: parseInt(questionId, 10),
        selectedOptionId: selectedAnswers[parseInt(questionId, 10)],
      }));
      dispatch(submitQuiz({ id: quiz.id, answers }));
    }
  };

  if (loading === 'loading') {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (result) {
    return (
      <div className="quiz-container">
        <h2>Quiz Results</h2>
        <p className="quiz-score">Your score: {result.score.toFixed(2)}%</p>
        <div className="quiz-feedback">
          <h3>Correct Answers:</h3>
          {quiz?.questions?.map((question: Question) => (
            <div key={question.id} className="question-result">
              <p><strong>{question.content}</strong></p>
              <ul>
                {question?.options?.map((option: QuestionOption) => (
                  <li
                    key={option.id}
                    className={
                      result.correctAnswers[question.id] === option.id
                        ? 'correct'
                        : selectedAnswers[question.id] === option.id
                        ? 'incorrect'
                        : ''
                    }
                  >
                    {option.content}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <button onClick={() => navigate(-1)}>Back to Lesson</button>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {quiz ? (
        <>
          <h2>{quiz.title}</h2>
          <form>
            {quiz?.questions?.map((question: Question) => (
              <div key={question.id} className="question-block">
                <p><strong>{question.content}</strong></p>
                <ul className="options-list">
                  {question?.options?.map((option: QuestionOption) => (
                    <li key={option.id}>
                      <label>
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={option.id}
                          onChange={() => handleOptionChange(question.id, option.id)}
                          checked={selectedAnswers[question.id] === option.id}
                        />
                        {option.content}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <button type="button" onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length !== quiz.questions?.length}>
              Submit Quiz
            </button>
          </form>
        </>
      ) : (
        <p>No quiz available for this lesson.</p>
      )}
    </div>
  );
};

export default QuizPage;

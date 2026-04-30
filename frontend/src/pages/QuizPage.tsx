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
    const totalScore = result.score.toFixed(0);
    return (
      <div className="quiz-container">
        <h2>📊 Kết quả bài quiz</h2>
        <div className="quiz-score">
          {totalScore}%
        </div>
        <div style={{
          textAlign: 'center',
          fontSize: 'var(--fs-base)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--g-xx)'
        }}>
          {result.score >= 70 ? '🎉 Chúc mừng! Bạn đã vượt qua bài quiz!' : '📚 Hãy ôn lại nội dung và thử lại!'}
        </div>
        
        <div className="quiz-feedback">
          {quiz?.questions?.map((question: Question, idx: number) => {
            const isCorrect = result.correctAnswers[question.id] === selectedAnswers[question.id];
            return (
              <div key={question.id} className={`question-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                <h4>Câu {idx + 1}: {question.content}</h4>
                <ul>
                  {question?.options?.map((option: QuestionOption) => {
                    const isCorrectAnswer = result.correctAnswers[question.id] === option.id;
                    const isUserSelected = selectedAnswers[question.id] === option.id;
                    
                    return (
                      <li
                        key={option.id}
                        className={
                          isCorrectAnswer
                            ? 'correct'
                            : isUserSelected && !isCorrectAnswer
                            ? 'incorrect'
                            : ''
                        }
                      >
                        {option.content}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 'var(--g-x)', justifyContent: 'center', marginTop: 'var(--g-xx)' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{
              padding: '12px 24px',
              background: 'var(--surface)',
              color: 'var(--text-main)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all var(--trans) var(--ease)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-main)';
            }}
          >
            ← Quay lại
          </button>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              border: '2px solid var(--primary)',
              borderRadius: 'var(--radius-md)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all var(--trans) var(--ease)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--primary-light)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
          >
            🔄 Làm lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      {quiz ? (
        <>
          <h2>📝 {quiz.title}</h2>
          <form>
            {quiz?.questions?.map((question: Question, qIndex: number) => (
              <div key={question.id} className="question-block">
                <div className="question-block-number">{qIndex + 1}</div>
                <h3 className="question-text">{question.content}</h3>
                
                <ul className="options-list">
                  {question?.options?.map((option: QuestionOption) => (
                    <li key={option.id}>
                      <input
                        type="radio"
                        id={`option-${option.id}`}
                        name={`question-${question.id}`}
                        value={option.id}
                        onChange={() => handleOptionChange(question.id, option.id)}
                        checked={selectedAnswers[question.id] === option.id}
                      />
                      <label htmlFor={`option-${option.id}`}>
                        {option.content}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <button 
              className="quiz-submit-btn"
              type="button" 
              onClick={handleSubmit} 
              disabled={Object.keys(selectedAnswers).length !== quiz.questions?.length}
            >
              ✓ Nộp bài {Object.keys(selectedAnswers).length}/{quiz.questions?.length}
            </button>
          </form>
        </>
      ) : (
        <p>Không có bài quiz cho bài học này.</p>
      )}
    </div>
  );
};

export default QuizPage;
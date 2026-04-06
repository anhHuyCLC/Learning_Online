import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../styles/dashboard.css";

type Option = {
  id?: number;
  content: string;
  is_correct: boolean;
};

type Question = {
  id?: number;
  content: string;
  options: Option[];
};

type Quiz = {
  id?: number;
  title: string;
  lesson_id: number;
  questions: Question[];
};

export default function TeacherQuizEditor() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

  const [quiz, setQuiz] = useState<Quiz>({
    title: "",
    lesson_id: Number(lessonId),
    questions: [],
  });

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem("token");
        // Thay đổi URL theo API thực tế backend của bạn để lấy Quiz của bài học
        const response = await fetch(`${API_URL}/api/quizzes/lesson/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          // Nếu backend trả về dữ liệu quiz
          if (data && (data.id || data.quiz)) {
            setQuiz(data.quiz || data);
          }
        }
      } catch (err: any) {
        console.error("Lỗi tải quiz", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [lessonId]);

  const handleAddQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          content: "",
          options: [
            { content: "", is_correct: true },
            { content: "", is_correct: false },
          ],
        },
      ],
    }));
  };

  const handleRemoveQuestion = (qIndex: number) => {
    setQuiz((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions.splice(qIndex, 1);
      return { ...prev, questions: newQuestions };
    });
  };

  const handleQuestionChange = (qIndex: number, value: string) => {
    setQuiz((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex].content = value;
      return { ...prev, questions: newQuestions };
    });
  };

  const handleAddOption = (qIndex: number) => {
    setQuiz((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex].options.push({ content: "", is_correct: false });
      return { ...prev, questions: newQuestions };
    });
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    setQuiz((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex].options.splice(oIndex, 1);
      return { ...prev, questions: newQuestions };
    });
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    setQuiz((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex].options[oIndex].content = value;
      return { ...prev, questions: newQuestions };
    });
  };

  const handleSetCorrectOption = (qIndex: number, oIndex: number) => {
    setQuiz((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[qIndex].options = newQuestions[qIndex].options.map((opt, idx) => ({
        ...opt,
        is_correct: idx === oIndex,
      }));
      return { ...prev, questions: newQuestions };
    });
  };

  const handleSaveQuiz = async () => {
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      // Thay đổi URL POST/PUT theo endpoint backend của bạn
      const endpoint = quiz.id 
        ? `${API_URL}/api/quizzes/${quiz.id}` 
        : `${API_URL}/api/quizzes`;
      
      const response = await fetch(endpoint, {
        method: quiz.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(quiz),
      });

      if (!response.ok) {
        throw new Error("Không thể lưu Quiz. Vui lòng kiểm tra lại hệ thống.");
      }

      alert("Lưu Quiz thành công!");
      navigate("/teacher/quizzes");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-info">
          <h2 className="heading-1">✍️ Trình soạn thảo Quiz</h2>
          <p className="text-muted">Bài học ID: {lessonId}</p>
        </div>
        <Link to="/teacher/quizzes" className="btn-secondary">
          <span>⬅️</span> Quay lại
        </Link>
      </div>

      {error && <div className="error-container" style={{ height: "auto", padding: "16px", marginBottom: "24px" }}>{error}</div>}

      <div className="card mb-4">
        <div className="form-group mb-0">
          <label className="form-label">Tiêu đề Quiz</label>
          <input
            type="text"
            className="form-input"
            value={quiz.title}
            onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
            placeholder="Nhập tiêu đề bài trắc nghiệm (VD: Bài kiểm tra cuối khóa)"
          />
        </div>
      </div>

      {quiz.questions.map((question, qIndex) => (
        <div key={qIndex} className="card mb-4">
          <div className="card-header" style={{ padding: '16px 24px', marginBottom: 0 }}>
            <h3 className="heading-2">Câu hỏi {qIndex + 1}</h3>
            <button
              onClick={() => handleRemoveQuestion(qIndex)}
              className="btn-secondary btn-sm"
              style={{ color: 'var(--f8-danger)' }}
            >
              🗑️ Xóa câu hỏi
            </button>
          </div>
          <div style={{ padding: '0 24px 24px 24px' }}>
            <div className="form-group">
              <label className="form-label">Nội dung câu hỏi</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: '60px' }}
                value={question.content}
                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                placeholder={`Nội dung câu hỏi số ${qIndex + 1}`}
              />
            </div>
            <label className="form-label">Các lựa chọn trả lời</label>
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="radio"
                  name={`correct-option-${qIndex}`}
                  checked={option.is_correct}
                  onChange={() => handleSetCorrectOption(qIndex, oIndex)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  className="form-input"
                  value={option.content}
                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                  placeholder={`Lựa chọn ${oIndex + 1}`}
                />
                <button
                  onClick={() => handleRemoveOption(qIndex, oIndex)}
                  className="btn-text"
                  style={{ color: 'var(--f8-danger)', padding: '8px' }}
                  title="Xóa lựa chọn"
                >
                  ❌
                </button>
              </div>
            ))}
            <button onClick={() => handleAddOption(qIndex)} className="btn-secondary btn-sm">
              ➕ Thêm lựa chọn
            </button>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <button onClick={handleAddQuestion} className="btn-secondary">
          ➕ Thêm câu hỏi
        </button>
        <button onClick={handleSaveQuiz} className="btn-primary" disabled={saving}>
          {saving ? "Đang lưu..." : "💾 Lưu toàn bộ Quiz"}
        </button>
      </div>
    </div>
  );
}
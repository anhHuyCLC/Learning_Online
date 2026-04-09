import apiClient from "./apiClient";

// Get a quiz by its lesson ID
export const getQuizByLessonId = async (lessonId: number) => {
  try {
    const res = await apiClient.get(`/quizzes/lesson/${lessonId}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch quiz");
  }
};

// Get a quiz by its ID
export const getQuiz = async (id: number) => {
  try {
    const res = await apiClient.get(`/quizzes/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch quiz");
  }
};

// Submit a quiz and get the result
export const submitQuiz = async (id: number, answers: { questionId: number; selectedOptionId: number }[]) => {
  try {
    const res = await apiClient.post(`/quizzes/${id}/submit`, { answers });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to submit quiz");
  }
};

export const checkQuizStatus = async (lessonId: number) => {
  try {
    const res = await apiClient.get(`/quizzes/lesson/${lessonId}/status`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to check quiz status");
  }
};

// Get quiz for teacher editor
export const getTeacherQuizByLesson = async (lessonId: number | string) => {
  try {
    const res = await apiClient.get(`/quizzes/lesson/${lessonId}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch quiz for editor");
  }
};

// Save quiz from teacher editor
export const saveTeacherQuiz = async (quiz: any) => {
  try {
    const endpoint = quiz.id ? `/quizzes/${quiz.id}` : `/quizzes`;
    const res = await apiClient({ method: quiz.id ? "put" : "post", url: endpoint, data: quiz });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Không thể lưu Quiz. Vui lòng kiểm tra lại hệ thống.");
  }
};

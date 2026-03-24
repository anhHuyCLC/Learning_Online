import axios from "axios";

const API_URL =
  (import.meta as any).env.VITE_API_URL || "http://localhost:3000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

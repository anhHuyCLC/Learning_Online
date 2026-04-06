import apiClient from './apiClient';

const getProgressForCourse = async (courseId: number) => {
  const response = await apiClient.get(`/progress/${courseId}`);
  return response.data;
};

const markLessonAsCompleted = async (lessonId: number, courseId: number) => {
  const response = await apiClient.post(`/progress`, { lessonId, courseId });
  return response.data;
};

export const progressService = {
  getProgressForCourse,
  markLessonAsCompleted,
};
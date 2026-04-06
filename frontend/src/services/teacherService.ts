import apiClient from './apiClient';

const teacherService = {
  getDashboardStats: async () => {
    const response = await apiClient.get(`/teacher/dashboard`);
    return response.data;
  },

  getMyCourses: async () => {
    // This endpoint gets all courses owned by the logged-in teacher
    const response = await apiClient.get(`/teacher/courses`);
    return response.data;
  },

  getCourseStudents: async (courseId: number) => {
    const response = await apiClient.get(`/teacher/courses/${courseId}/students`);
    return response.data;
  },

  // You can add getCourseStatistics here later if needed
};

export default teacherService;
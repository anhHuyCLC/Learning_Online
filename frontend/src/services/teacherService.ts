import apiClient from './apiClient';

const teacherService = {
  getDashboardStats: async () => {
    const response = await apiClient.get(`/teacher/dashboard`);
    return response.data;
  },

  getMyCourses: async () => {
    const response = await apiClient.get(`/teacher/courses`);
    return response.data;
  },

  getCourseStudents: async (courseId: number) => {
    const response = await apiClient.get(`/teacher/courses/${courseId}/students`);
    return response.data;
  },
};

export default teacherService;
import apiClient from "./apiClient";
import type { Enrollment, EnrollmentCheck } from "../type/coursesType";

export const enrollmentService = {
  // Get student's enrolled courses
  getStudentEnrollments: async (): Promise<Enrollment[]> => {
    try {
      const response = await apiClient.get(`/student/enrollments`);
      return response.data.enrollments || [];
    } catch (error) {
      console.error("Get enrollments error:", error);
      throw error;
    }
  },

  // Check if student is enrolled in a course
  checkEnrollment: async (courseId: number): Promise<EnrollmentCheck> => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/check-enrollment`);
      return {
        isEnrolled: response.data.isEnrolled,
        enrollment: response.data.enrollment
      };
    } catch (error) {
      console.error("Check enrollment error:", error);
      throw error;
    }
  },

  // Enroll in a course
  enrollInCourse: async (courseId: number): Promise<number> => {
    try {
      const response = await apiClient.post(`/enrollments`, { courseId });
      return response.data.enrollmentId;
    } catch (error) {
      console.error("Enroll error:", error);
      throw error;
    }
  },

  // Unenroll from a course
  unenrollFromCourse: async (courseId: number): Promise<void> => {
    try {
      await apiClient.delete(`/enrollments/${courseId}`);
    } catch (error) {
      console.error("Unenroll error:", error);
      throw error;
    }
  },

  // Re-enroll in a course
  reEnrollInCourse: async (courseId: number): Promise<void> => {
    try {
      await apiClient.post(`/enrollments/reenroll`, { courseId });
    } catch (error) {
      console.error("Re-enroll error:", error);
      throw error;
    }
  },

  // Get enrollment count for a course
  getEnrollmentCount: async (courseId: number): Promise<number> => {
    try {
      const response = await apiClient.get(`/courses/${courseId}/enrollment-count`);
      return response.data.count || 0;
    } catch (error) {
      console.error("Get enrollment count error:", error);
      return 0;
    }
  }
};

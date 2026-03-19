import axios from "axios";
import { Enrollment, EnrollmentCheck } from "../type/coursesType";

const API_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

export const enrollmentService = {
  // Get student's enrolled courses
  getStudentEnrollments: async (): Promise<Enrollment[]> => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/student/enrollments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.enrollments || [];
    } catch (error) {
      console.error("Get enrollments error:", error);
      throw error;
    }
  },

  // Check if student is enrolled in a course
  checkEnrollment: async (courseId: number): Promise<EnrollmentCheck> => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/courses/${courseId}/check-enrollment`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
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
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/enrollments`,
        { courseId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data.enrollmentId;
    } catch (error) {
      console.error("Enroll error:", error);
      throw error;
    }
  },

  // Unenroll from a course
  unenrollFromCourse: async (courseId: number): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/enrollments/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error("Unenroll error:", error);
      throw error;
    }
  },

  // Update enrollment progress
  updateProgress: async (courseId: number, progress: number): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/enrollments/progress`,
        { courseId, progress },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error("Update progress error:", error);
      throw error;
    }
  },

  // Complete a course
  completeCourse: async (courseId: number): Promise<void> => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/enrollments/complete`,
        { courseId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error("Complete course error:", error);
      throw error;
    }
  },

  // Get enrollment count for a course
  getEnrollmentCount: async (courseId: number): Promise<number> => {
    try {
      const response = await axios.get(
        `${API_URL}/courses/${courseId}/enrollment-count`
      );
      return response.data.count || 0;
    } catch (error) {
      console.error("Get enrollment count error:", error);
      return 0;
    }
  }
};

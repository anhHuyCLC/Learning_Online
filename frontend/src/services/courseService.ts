import axios from "axios";

const API_URL =
  (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

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

export const fetchCourses = async () => {
  try {
    const res = await apiClient.get("/courses");
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch courses");
  }
};

export const fetchCourseById = async (id: number) => {
  console.log("Fetching course with ID:", id);
  try {
    const res = await apiClient.get(`/courses/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch course");
  }
};

export const createCourse = async (courseData: any) => {
  try {
    const res = await apiClient.post("/courses", courseData);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create course");
  }
};

export const updateCourse = async (id: number, courseData: any) => {
  try {
    const res = await apiClient.put(`/courses/${id}`, courseData);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to update course");
  }
};

export const deleteCourse = async (id: number) => {
  try {
    const res = await apiClient.delete(`/courses/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to delete course");
  }
};

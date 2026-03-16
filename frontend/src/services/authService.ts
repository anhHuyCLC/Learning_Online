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

export const login = async (email: string, password: string) => {
  try {
    const res = await apiClient.post("/users/login", {
      email,
      password,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  try {
    const res = await apiClient.post("/users/register", {
      name,
      email,
      password,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Register failed");
  }
};

// export const fetchCourses = async () => {
//   try {
//     const res = await apiClient.get("/courses");
//     return res.data;
//   } catch (error: any) {
//     throw new Error(error.response?.data?.message || "Failed to fetch courses");
//   }
// };

import apiClient from "./apiClient";

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

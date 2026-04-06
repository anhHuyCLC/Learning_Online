import apiClient from "./apiClient";

export const fetchCourses = async () => {
  try {
    const res = await apiClient.get("/courses");
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch courses");
  }
};

export const fetchAllCoursesAdmin = async () => {
  try {
    const res = await apiClient.get("/admin/courses");
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch all courses");
  }
}

export const fetchCourseById = async (id: number) => {
  console.log("Fetching course with ID:", id);
  try {
    const res = await apiClient.get(`/courses/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch course");
  }
};

export const createCourse = async (courseData: FormData) => {
  try {
    const res = await apiClient.post("/courses", courseData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to create course");
  }
};

export const updateCourse = async (id: number, courseData: FormData) => {
  try {
    const res = await apiClient.put(`/courses/${id}`, courseData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

export const fetchLessonById = async (id: number) => {
  try {
    const res = await apiClient.get(`/lessons/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch lesson");
  }
};

export const fetchCoursesByTeacher = async () => {
  try {
    const res = await apiClient.get("/teacher/courses");
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch teacher courses");
  }
};

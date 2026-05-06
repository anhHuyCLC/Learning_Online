import apiClient from './apiClient';

export const fetchCoursesByTeacher = async () => {
  try {
    const res = await apiClient.get('/teacher/courses');
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Không thể tải danh sách khóa học");
  }
};

export const deleteCourse = async (id: number) => {
  try {
    const res = await apiClient.delete(`/courses/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Lỗi khi xóa khóa học");
  }
};

export const fetchCourseById = async (id: number) => {
  try {
    const res = await apiClient.get(`/courses/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Không thể tải thông tin khóa học");
  }
};

export const fetchCourses = async () => {
  try {
    const res = await apiClient.get('/courses');
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Không thể tải danh sách khóa học");
  }
};

export const fetchAllCoursesAdmin = async () => {
  try {
    const res = await apiClient.get('/admin/courses');
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Không thể tải danh sách khóa học");
  }
};

export const fetchLessonById = async (id: number) => {
  try {
    const res = await apiClient.get(`/lessons/${id}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Không thể tải thông tin bài học");
  }
};

export const createCourse = async (courseData: any) => {
  try {
    const config = courseData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await apiClient.post('/courses', courseData, config);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Lỗi khi tạo khóa học mới");
  }
};

export const updateCourse = async (id: number, courseData: any) => {
  try {
    const config = courseData instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await apiClient.put(`/courses/${id}`, courseData, config);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Lỗi khi cập nhật khóa học");
  }
};

export const fetchCourseStudents = async (courseId: number) => {
  try {
    const res = await apiClient.get(`/teacher/courses/${courseId}/students`);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Không thể tải danh sách học viên");
  }
};

export const submitCourseReview = async (courseId: number, rating: number, comment: string) => {
  try {
    const res = await apiClient.post(`/courses/${courseId}/reviews`, { rating, comment });
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Lỗi khi gửi đánh giá");
  }
};
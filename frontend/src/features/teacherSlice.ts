import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import teacherService from '../services/teacherService';
import type { TeacherCourse, CourseStudent } from '../type/teacherTypes';

interface TeacherState {
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
  };
  courses: TeacherCourse[];
  selectedCourseStudents: CourseStudent[];
  loading: boolean;
  loadingModal: boolean;
  error: string | null;
}

const initialState: TeacherState = {
  stats: { totalCourses: 0, totalStudents: 0, totalRevenue: 0 },
  courses: [],
  selectedCourseStudents: [],
  loading: false,
  loadingModal: false,
  error: null,
};

export const fetchTeacherDashboardData = createAsyncThunk('teacher/fetchDashboardData', async (_, { rejectWithValue }) => {
  try {
    const statsData = await teacherService.getDashboardStats();
    const coursesData = await teacherService.getMyCourses();
    return { stats: statsData.data, courses: coursesData.courses };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch teacher data');
  }
});

export const fetchCourseStudents = createAsyncThunk('teacher/fetchCourseStudents', async (courseId: number, { rejectWithValue }) => {
    try {
        const response = await teacherService.getCourseStudents(courseId);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
    }
});

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    clearModalData: (state) => {
        state.selectedCourseStudents = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.courses = action.payload.courses;
      })
      .addCase(fetchTeacherDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCourseStudents.pending, (state) => {
        state.loadingModal = true;
      })
      .addCase(fetchCourseStudents.fulfilled, (state, action: PayloadAction<CourseStudent[]>) => {
        state.loadingModal = false;
        state.selectedCourseStudents = action.payload;
      })
      .addCase(fetchCourseStudents.rejected, (state, action) => {
        state.loadingModal = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearModalData } = teacherSlice.actions;
export default teacherSlice.reducer;
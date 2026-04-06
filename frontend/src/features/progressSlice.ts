import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { progressService } from '../services/progressService';

interface ProgressState {
  completedLessons: number[];
  loading: boolean;
  error: string | null;
}

const initialState: ProgressState = {
  completedLessons: [],
  loading: false,
  error: null,
};

export const getProgressForCourse = createAsyncThunk(
  'progress/getProgressForCourse',
  async (courseId: number, { rejectWithValue }) => {
    try {
      return await progressService.getProgressForCourse(courseId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch progress');
    }
  }
);

export const markLessonAsCompleted = createAsyncThunk(
  'progress/markLessonAsCompleted',
  async ({ lessonId, courseId }: { lessonId: number; courseId: number }, { rejectWithValue }) => {
    try {
      await progressService.markLessonAsCompleted(lessonId, courseId);
      return lessonId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark lesson as completed');
    }
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getProgressForCourse.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getProgressForCourse.fulfilled, (state, action) => {
      state.loading = false;
      state.completedLessons = action.payload;
    });
    builder.addCase(getProgressForCourse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
    builder.addCase(markLessonAsCompleted.pending, (state) => {
      state.loading = false; // No need for loading indicator on this
    });
    builder.addCase(markLessonAsCompleted.fulfilled, (state, action) => {
      if (!state.completedLessons.includes(action.payload)) {
        state.completedLessons.push(action.payload);
      }
    });
    builder.addCase(markLessonAsCompleted.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = progressSlice.actions;
export default progressSlice.reducer;

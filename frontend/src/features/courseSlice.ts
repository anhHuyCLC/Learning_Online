import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchCourseById, fetchCourses } from "../services/courseService";
import { Courses } from "../type/coursesType";
import { get } from "http";

interface CourseState {
  courses: Courses[];
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  loading: false,
  error: null,
};

export const getCourses = createAsyncThunk<
  Courses[],
  void,
  { rejectValue: string }
>("courses/getCourses", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchCourses();
    return response.courses;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch courses");
  }
});
export const getCourseById = createAsyncThunk<
  Courses,
  number,
  { rejectValue: string }
>("courses/getCourseById", async (id: number, { rejectWithValue }) => {
  try {
    const response = await fetchCourseById(id);
    return response.course;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch course");
  }
});

const courseSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(getCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch courses";
      })
      .addCase(getCourseById.pending, (state: CourseState) => {
        state.loading = true;
        state.error = null;
      })
    .addCase(getCourseById.fulfilled, (state: CourseState, action: PayloadAction<Courses>) => {
      state.loading = false;
      state.courses = [action.payload];
    })
    .addCase(getCourseById.rejected, (state: CourseState, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch course";
    });
},
});

export const { clearError } = courseSlice.actions;
export default courseSlice.reducer;

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { 
  createCourse as createCourseService, 
  updateCourse as updateCourseService, 
  deleteCourse as deleteCourseService,
  fetchCourseById, 
  fetchCourses, 
  fetchAllCoursesAdmin,
  fetchLessonById } from "../services/courseService";
import type { Courses, Lesson } from "../type/coursesType";

interface CourseState {
  courses: Courses[];
  currentCourse: Courses | null;
  currentLesson: Lesson | null;
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  currentCourse: null,
  currentLesson: null,
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
    return response.data || response.courses || response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch courses");
  }
});

export const getAllCoursesAdmin = createAsyncThunk<
  Courses[],
  void,
  { rejectValue: string }
>("courses/getAllCoursesAdmin", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchAllCoursesAdmin();
    return response.data || response.courses || response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch all courses");
  }
});

export const getCourseById = createAsyncThunk<
  Courses,
  number,
  { rejectValue: string }
>("courses/getCourseById", async (id: number, { rejectWithValue }) => {
  try {
    const response = await fetchCourseById(id);
    return response.data || response.course || response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch course");
  }
});

export const getLessonById = createAsyncThunk<
  Lesson,
  number,
  { rejectValue: string }
>("courses/getLessonById", async (id: number, { rejectWithValue }) => {
  try {
    const response = await fetchLessonById(id);
    return response.data || response.lesson || response;
  } catch (error: any) {
    return rejectWithValue(error.message || "Failed to fetch lesson");
  }
});

export const createCourse = createAsyncThunk<
  Courses,
  FormData,
  { rejectValue: string }
>('courses/createCourse', async (courseData, { rejectWithValue }) => {
  try {
    const response = await createCourseService(courseData);
    return response.data || response.course || response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create course');
  }
});

export const updateCourse = createAsyncThunk<
  Courses,
  { id: number; courseData: FormData },
  { rejectValue: string }
>('courses/updateCourse', async ({ id, courseData }, { rejectWithValue }) => {
  try {
    const response = await updateCourseService(id, courseData);
    return response.data || response.course || response;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to update course');
  }
});

export const deleteCourse = createAsyncThunk<
  number, // Return the ID of the deleted course
  number, // Pass the ID to delete
  { rejectValue: string }
>('courses/deleteCourse', async (id, { rejectWithValue }) => {
  try {
    await deleteCourseService(id);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to delete course');
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
      .addCase(getAllCoursesAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCoursesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(getAllCoursesAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getCourseById.pending, (state: CourseState) => {
        state.loading = true;
        state.error = null;
      })
    .addCase(getCourseById.fulfilled, (state: CourseState, action: PayloadAction<Courses>) => {
      state.loading = false;
      state.courses = [action.payload];
      state.currentCourse = action.payload;
    })
    .addCase(getCourseById.rejected, (state: CourseState, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch course";
    })
    .addCase(getLessonById.pending, (state: CourseState) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(getLessonById.fulfilled, (state: CourseState, action: PayloadAction<Lesson>) => {
      state.loading = false;
      state.currentLesson = action.payload;
    })
    .addCase(getLessonById.rejected, (state: CourseState, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch lesson";
    })
    // Create Course
    .addCase(createCourse.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(createCourse.fulfilled, (state, action) => {
      state.loading = false;
      state.courses.push(action.payload);
    })
    .addCase(createCourse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to create course';
    })
    // Update Course
    .addCase(updateCourse.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(updateCourse.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.courses.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
      if (state.currentCourse?.id === action.payload.id) {
        state.currentCourse = action.payload;
      }
    })
    .addCase(updateCourse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || 'Failed to update course';
    })
    // Delete Course
    .addCase(deleteCourse.pending, (state) => {
      // Optionally set a specific loading flag for deletion
    })
    .addCase(deleteCourse.fulfilled, (state, action) => {
      state.courses = state.courses.filter(c => c.id !== action.payload);
    })
    .addCase(deleteCourse.rejected, (state, action) => {
      // We can set an error, but often a toast notification is better here
      // For now, just log it or set the main error
      state.error = action.payload || 'Failed to delete course';
    });
},
});

export const { clearError } = courseSlice.actions;
export default courseSlice.reducer;

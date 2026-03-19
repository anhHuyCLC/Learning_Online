import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { enrollmentService } from "../services/enrollmentService";
import { Enrollment } from "../type/coursesType";

interface EnrollmentState {
  enrollments: Enrollment[];
  isEnrolled: { [key: number]: boolean };
  enrollmentData: { [key: number]: Enrollment | null };
  loading: boolean;
  error: string | null;
}

const initialState: EnrollmentState = {
  enrollments: [],
  isEnrolled: {},
  enrollmentData: {},
  loading: false,
  error: null
};

// Async thunks
export const getStudentEnrollments = createAsyncThunk(
  "enrollment/getStudentEnrollments",
  async (_, { rejectWithValue }) => {
    try {
      return await enrollmentService.getStudentEnrollments();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch enrollments");
    }
  }
);

export const checkEnrollment = createAsyncThunk(
  "enrollment/checkEnrollment",
  async (courseId: number, { rejectWithValue }) => {
    try {
      return { courseId, ...(await enrollmentService.checkEnrollment(courseId)) };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to check enrollment");
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  "enrollment/enrollInCourse",
  async (courseId: number, { rejectWithValue }) => {
    try {
      const enrollmentId = await enrollmentService.enrollInCourse(courseId);
      return { courseId, enrollmentId };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to enroll");
    }
  }
);

export const unenrollFromCourse = createAsyncThunk(
  "enrollment/unenrollFromCourse",
  async (courseId: number, { rejectWithValue }) => {
    try {
      await enrollmentService.unenrollFromCourse(courseId);
      return courseId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to unenroll");
    }
  }
);

export const updateProgress = createAsyncThunk(
  "enrollment/updateProgress",
  async ({ courseId, progress }: { courseId: number; progress: number }, { rejectWithValue }) => {
    try {
      await enrollmentService.updateProgress(courseId, progress);
      return { courseId, progress };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update progress");
    }
  }
);

export const completeCourse = createAsyncThunk(
  "enrollment/completeCourse",
  async (courseId: number, { rejectWithValue }) => {
    try {
      await enrollmentService.completeCourse(courseId);
      return courseId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to complete course");
    }
  }
);

const enrollmentSlice = createSlice({
  name: "enrollment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Get student enrollments
    builder.addCase(getStudentEnrollments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getStudentEnrollments.fulfilled, (state, action) => {
      state.loading = false;
      state.enrollments = action.payload;
      // Update isEnrolled map
      action.payload.forEach((enrollment) => {
        state.isEnrolled[enrollment.course_id] = true;
        state.enrollmentData[enrollment.course_id] = enrollment;
      });
    });
    builder.addCase(getStudentEnrollments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Check enrollment
    builder.addCase(checkEnrollment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(checkEnrollment.fulfilled, (state, action) => {
      state.loading = false;
      const { courseId, isEnrolled, enrollment } = action.payload;
      state.isEnrolled[courseId] = isEnrolled;
      if (enrollment) {
        state.enrollmentData[courseId] = enrollment;
      } else {
        state.enrollmentData[courseId] = null;
      }
    });
    builder.addCase(checkEnrollment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Enroll in course
    builder.addCase(enrollInCourse.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(enrollInCourse.fulfilled, (state, action) => {
      state.loading = false;
      const { courseId } = action.payload;
      state.isEnrolled[courseId] = true;
    });
    builder.addCase(enrollInCourse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Unenroll from course
    builder.addCase(unenrollFromCourse.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(unenrollFromCourse.fulfilled, (state, action) => {
      state.loading = false;
      const courseId = action.payload;
      state.isEnrolled[courseId] = false;
      state.enrollmentData[courseId] = null;
      state.enrollments = state.enrollments.filter((e) => e.course_id !== courseId);
    });
    builder.addCase(unenrollFromCourse.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update progress
    builder.addCase(updateProgress.pending, (state) => {
      state.error = null;
    });
    builder.addCase(updateProgress.fulfilled, (state, action) => {
      const { courseId, progress } = action.payload;
      if (state.enrollmentData[courseId]) {
        state.enrollmentData[courseId]!.progress = progress;
      }
      const enrollment = state.enrollments.find((e) => e.course_id === courseId);
      if (enrollment) {
        enrollment.progress = progress;
      }
    });
    builder.addCase(updateProgress.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // Complete course
    builder.addCase(completeCourse.pending, (state) => {
      state.error = null;
    });
    builder.addCase(completeCourse.fulfilled, (state, action) => {
      const courseId = action.payload;
      if (state.enrollmentData[courseId]) {
        state.enrollmentData[courseId]!.status = "completed";
        state.enrollmentData[courseId]!.progress = 100;
      }
      const enrollment = state.enrollments.find((e) => e.course_id === courseId);
      if (enrollment) {
        enrollment.status = "completed";
        enrollment.progress = 100;
      }
    });
    builder.addCase(completeCourse.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  }
});

export const { clearError } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;

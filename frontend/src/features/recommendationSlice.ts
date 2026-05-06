/**
 * Recommendation Slice
 * File: frontend/src/features/recommendationSlice.ts
 * 
 * Redux state management for the recommendation system.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recommendationService from '../services/recommendationService';
import type {
  GenerateRecommendationsResponse,
  CachedRecommendationsResponse,
  UserSegmentResponse,
  AnalyticsResponse,
  RecommendedCourse,
  FeedbackRequest,
} from '../services/recommendationService';

// ==================== TYPES ====================

interface RecommendationState {
  recommendations: RecommendedCourse[];
  cachedRecommendations: RecommendedCourse[];
  userSegment: string | null;
  segmentWeights: Record<string, number> | null;
  analytics: any | null;
  isLoading: boolean;
  error: string | null;
  lastGeneratedAt: string | null;
}

const initialState: RecommendationState = {
  recommendations: [],
  cachedRecommendations: [],
  userSegment: null,
  segmentWeights: null,
  analytics: null,
  isLoading: false,
  error: null,
  lastGeneratedAt: null,
};

// ==================== ASYNC THUNKS ====================

/**
 * Generate personalized recommendations
 */
export const generateRecommendations = createAsyncThunk(
  'recommendations/generate',
  async (_, { rejectWithValue }) => {
    try {
      const response = await recommendationService.generateRecommendations();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Get cached recommendations for user
 */
export const getCachedRecommendations = createAsyncThunk(
  'recommendations/getCached',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await recommendationService.getCachedRecommendations(userId);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Log recommendation feedback
 */
export const logFeedback = createAsyncThunk(
  'recommendations/logFeedback',
  async (feedback: FeedbackRequest, { rejectWithValue }) => {
    try {
      const response = await recommendationService.logRecommendationFeedback(feedback);
      if (response.success) {
        return response;
      }
      return rejectWithValue(response);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Update user segment
 */
export const updateUserSegment = createAsyncThunk(
  'recommendations/updateSegment',
  async (_, { rejectWithValue }) => {
    try {
      const response = await recommendationService.updateUserSegment();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/**
 * Get recommendation analytics
 */
export const getAnalytics = createAsyncThunk(
  'recommendations/getAnalytics',
  async (
    params: { segment?: string; timeframe?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await recommendationService.getRecommendationAnalytics(
        params.segment,
        params.timeframe
      );
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ==================== SLICE ====================

const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    clearRecommendations: (state) => {
      state.recommendations = [];
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Generate Recommendations
    builder
      .addCase(generateRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendations = action.payload.recommendations;
        state.lastGeneratedAt = action.payload.generatedAt;
        state.error = null;
      })
      .addCase(generateRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Cached Recommendations
    builder
      .addCase(getCachedRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getCachedRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cachedRecommendations = action.payload.recommendations;
        state.error = null;
      })
      .addCase(getCachedRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Log Feedback
    builder
      .addCase(logFeedback.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logFeedback.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(logFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update User Segment
    builder
      .addCase(updateUserSegment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserSegment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userSegment = action.payload.segment;
        state.segmentWeights = action.payload.weights;
        state.recommendations = [];
        state.error = null;
      })
      .addCase(updateUserSegment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Analytics
    builder
      .addCase(getAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
        state.error = null;
      })
      .addCase(getAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearRecommendations, clearError } = recommendationSlice.actions;
export default recommendationSlice.reducer;

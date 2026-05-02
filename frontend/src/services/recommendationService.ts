
import apiClient from './apiClient';

export interface RecommendationScore {
  relevance?: number;
  difficulty?: number;
  performance?: number;
  engagement?: number;
  progression?: number;
  popularity?: number;
  freshness?: number;
  final?: number;
}

export interface RecommendedCourse {
  courseId: number;
  courseTitle: string;
  courseDescription: string;
  difficulty: string;
  duration: number;
  price: number;
  rating: number;
  enrollmentCount: number;
  recommendationScore: number;
  scoreBreakdown: RecommendationScore;
  reason?: string;
  reasons?: string[];
}

export interface GenerateRecommendationsResponse {
  success: boolean;
  data: {
    userId: number;
    recommendations: RecommendedCourse[];
    generatedAt: string;
  };
}

export interface CachedRecommendationsResponse {
  success: boolean;
  data: {
    userId: number;
    recommendations: RecommendedCourse[];
    count: number;
  };
}

export interface AnalyticsResponse {
  success: boolean;
  data: {
    timeframe: string;
    overview: {
      totalRecommendations: number;
      totalClicks: number;
      totalEnrollments: number;
      clickThroughRate: string;
      conversionRate: string;
    };
    bySegment: Array<{
      segment: string;
      recommendations: number;
      clicks: number;
      enrollments: number;
      ctr: string;
      conversionRate: string;
      avgScore: number;
    }>;
    topRecommendedCourses: Array<{
      courseId: number;
      title: string;
      recommendmentCount: number;
      clicks: number;
      avgScore: number;
    }>;
    systemPerformance: {
      avgExecutionTime: number;
      minExecutionTime: number;
      maxExecutionTime: number;
    };
  };
}

export interface UserSegmentResponse {
  success: boolean;
  data: {
    userId: number;
    segment: string;
    weights: Record<string, number>;
    recommendationsGenerated: number;
  };
}

export interface FeedbackRequest {
  courseId: number;
  action: 'clicked' | 'enrolled' | 'rated' | 'dismissed';
  rating?: number;
  feedback?: string;
}

export interface RecommendationRule {
  id: number;
  rule_name: string;
  rule_type: string;
  rule_logic: Record<string, any>;
  applies_to_segments: string[];
  active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

const getErrorMessage = (error: any, defaultMessage: string): string => {
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') return data;
    if (data.error && typeof data.error === 'string') return data.error;
    if (data.message && typeof data.message === 'string') return data.message;
    if (data.details && typeof data.details === 'string') return data.details;
    return JSON.stringify(data); // Fallback: chuyển object thành chuỗi JSON
  }
  return error.message || defaultMessage;
};

export const generateRecommendations = async (): Promise<GenerateRecommendationsResponse> => {
  try {
    const response = await apiClient.post<GenerateRecommendationsResponse>(
      '/recommendations/generate'
    );
    return response.data;
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    throw new Error(getErrorMessage(error, 'Lỗi khi tạo đề xuất.'));
  }
};

export const getCachedRecommendations = async (userId: number): Promise<CachedRecommendationsResponse> => {
  try {
    const response = await apiClient.get<CachedRecommendationsResponse>(
      `/recommendations/${userId}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching cached recommendations:', error);
    throw new Error(getErrorMessage(error, 'Lỗi khi lấy đề xuất đã lưu.'));
  }
};

export const logRecommendationFeedback = async (feedback: FeedbackRequest): Promise<any> => {
  try {
    const response = await apiClient.post(
      '/recommendations/feedback',
      feedback
    );
    return response.data;
  } catch (error: any) {
    console.error('Error logging recommendation feedback:', error);
    throw new Error(getErrorMessage(error, 'Lỗi khi ghi nhận phản hồi.'));
  }
};

export const updateUserSegment = async (): Promise<UserSegmentResponse> => {
  try {
    const response = await apiClient.post<UserSegmentResponse>(
      '/recommendations/segment/update'
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating user segment:', error);
    throw new Error(getErrorMessage(error, 'Lỗi khi cập nhật phân khúc người dùng.'));
  }
};

export const getRecommendationAnalytics = async (
  segment?: string,
  timeframe: number = 7
): Promise<AnalyticsResponse> => {
  try {
    const params = new URLSearchParams();
    if (segment) params.append('segment', segment);
    params.append('timeframe', timeframe.toString());

    const response = await apiClient.get<AnalyticsResponse>(
      `/recommendations/analytics/performance?${params.toString()}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    throw new Error(getErrorMessage(error, 'Lỗi khi lấy dữ liệu phân tích.'));
  }
};

export const getRecommendationRules = async (): Promise<{ success: boolean; data: { rules: RecommendationRule[] } }> => {
  try {
    const response = await apiClient.get(
      '/recommendations/admin/rules'
    );
    return response.data;
  } catch (error: any) {
    console.error('Error fetching rules:', error);
    throw new Error(getErrorMessage(error, 'Lỗi khi lấy danh sách luật.'));
  }
};

export const createRecommendationRule = async (
  ruleName: string,
  ruleType: string,
  ruleLogic: Record<string, any>,
  appliesToSegments: string[]
): Promise<any> => {
  try {
    const response = await apiClient.post(
      '/recommendations/admin/rules',
      { ruleName, ruleType, ruleLogic, appliesToSegments }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error creating rule:', error);
    throw new Error(getErrorMessage(error, 'Lỗi khi tạo luật mới.'));
  }
};

export const updateRecommendationRule = async (
  ruleId: number,
  ruleLogic: Record<string, any>,
  appliesToSegments: string[],
  active: boolean
): Promise<any> => {
  try {
    const response = await apiClient.put(
      `/recommendations/admin/rules/${ruleId}`,
      { ruleLogic, appliesToSegments, active }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error updating rule:', error);
    throw new Error(getErrorMessage(error, 'Lỗi khi cập nhật luật.'));
  }
};

export default {
  generateRecommendations,
  getCachedRecommendations,
  logRecommendationFeedback,
  updateUserSegment,
  getRecommendationAnalytics,
  getRecommendationRules,
  createRecommendationRule,
  updateRecommendationRule,
};

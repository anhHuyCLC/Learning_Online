/**
 * Recommendation Routes
 * File: backend/routes/recommendationRoutes.ts
 */

import { Router } from 'express';
import { authMiddleware as protect } from '../middleware/authMiddleware';
import {
  generateRecommendations,
  getRecommendations,
  logRecommendationFeedback,
  getRecommendationAnalytics,
  updateUserSegment,
  getRecommendationRules,
  createRecommendationRule,
  updateRecommendationRule
} from '../controllers/recommendationController';

const router = Router();

// ==================== ADMIN ENDPOINTS (Must be first) ====================

/**
 * Get all recommendation rules
 * GET /api/recommendations/admin/rules
 * Auth: Required + Admin role
 */
router.get('/admin/rules', protect, getRecommendationRules);

/**
 * Create new recommendation rule
 * POST /api/recommendations/admin/rules
 * Auth: Required + Admin role
 */
router.post('/admin/rules', protect, createRecommendationRule);

/**
 * Update recommendation rule
 * PUT /api/recommendations/admin/rules/:ruleId
 * Auth: Required + Admin role
 */
router.put('/admin/rules/:ruleId', protect, updateRecommendationRule);

// ==================== ANALYTICS ENDPOINTS ====================

/**
 * Get recommendation analytics
 * GET /api/recommendations/analytics/performance?segment=segment_type&timeframe=7
 * Auth: Optional
 */
router.get('/analytics/performance', getRecommendationAnalytics);

// ==================== USER ENDPOINTS ====================

/**
 * Generate personalized learning path
 * POST /api/recommendations/generate
 * Auth: Required
 */
router.post('/generate', protect, generateRecommendations);

/**
 * Log feedback on recommendations
 * POST /api/recommendations/feedback
 * Auth: Required
 * Body: { courseId, action: 'clicked|enrolled|rated', rating?, feedback? }
 */
router.post('/feedback', protect, logRecommendationFeedback);

/**
 * Update user segment classification
 * POST /api/recommendations/segment/update
 * Auth: Required
 */
router.post('/segment/update', protect, updateUserSegment);

/**
 * Get cached recommendations
 * GET /api/recommendations/:userId
 * Auth: Optional (can be public or protected)
 * NOTE: This must be last since it matches any string for userId
 */
router.get('/:userId', getRecommendations);

export default router;

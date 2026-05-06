import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/index';
import { recommendationService } from '../services/AdvancedRecommendationService';
import db from '../config/db';
import { HybridRecommendationEngine } from '../services/recommendation/hybridScoring.service';
import { FeatureExtractionService } from '../services/recommendation/featureExtraction.service';

// Hàm hỗ trợ parse điểm số an toàn từ mọi định dạng JSON hoặc mảng của Backend
const parseScoreBreakdown = (rawBreakdown: any) => {
  let safeBreakdown: any = {};
  
  // Parse nếu dữ liệu là String (dễ gặp khi lấy từ CSDL MySQL)
  if (typeof rawBreakdown === 'string') {
    try { rawBreakdown = JSON.parse(rawBreakdown); } catch(e) {}
    // Đề phòng trường hợp stringify 2 lần
    if (typeof rawBreakdown === 'string') {
      try { rawBreakdown = JSON.parse(rawBreakdown); } catch(e) {}
    }
  }

  // Quét điểm số nếu nó là Mảng thay vì Object
  if (Array.isArray(rawBreakdown)) {
    rawBreakdown.forEach((item: any) => {
      const k = item.name || item.key || item.factor || item.metric;
      const v = item.value !== undefined ? item.value : item.score;
      if (k) safeBreakdown[k.toLowerCase()] = v;
    });
  } else if (rawBreakdown && typeof rawBreakdown === 'object') {
    safeBreakdown = rawBreakdown;
  }

  // Tìm key bất chấp viết hoa/thường
  const getValue = (keys: string[]) => {
    for (const k of keys) {
      if (safeBreakdown[k] !== undefined) return safeBreakdown[k];
      const lower = k.toLowerCase();
      if (safeBreakdown[lower] !== undefined) return safeBreakdown[lower];
      const title = lower.charAt(0).toUpperCase() + lower.slice(1);
      if (safeBreakdown[title] !== undefined) return safeBreakdown[title];
    }
    return 0;
  };

  return {
    relevance: getValue(['relevance']),
    difficulty: getValue(['difficultyMatch', 'difficulty']),
    performance: getValue(['performancePotential', 'performance']),
    engagement: getValue(['engagementFactor', 'engagement']),
    popularity: getValue(['popularityProof', 'popularity']),
    progression: getValue(['progression']),
    freshness: getValue(['freshness'])
  };
};

export const generateRecommendations = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log(`Generating recommendations for user ${userId}`);
    
    // Sử dụng Hybrid Engine mới
    const hybridEngine = new HybridRecommendationEngine();
    const recommendations = await hybridEngine.generateRecommendations(userId, 10);

    // Bổ sung thêm thông tin chi tiết khóa học từ DB để trả về cho Frontend
    const connection = await db();
    const courseIds = recommendations.map(r => r.courseId);
    let courseDetails: any[] = [];
    
    if (courseIds.length > 0) {
      const placeholders = courseIds.map(() => '?').join(',');
      const [rows]: any = await connection.execute(`SELECT * FROM courses WHERE id IN (${placeholders})`, courseIds);
      courseDetails = rows;
    }

    res.status(200).json({
      success: true,
      data: {
        userId,
        recommendations: recommendations.map(rec => {
          const detail = courseDetails.find(c => c.id === rec.courseId) || {};
          
          // Đảm bảo difficulty trả về Frontend luôn là chuỗi (string)
          let mappedDifficulty = 'beginner';
          const rawDiff = detail.difficulty || 2;
          if (typeof rawDiff === 'number' || !isNaN(Number(rawDiff))) {
            const numDiff = Number(rawDiff);
            if (numDiff >= 4) mappedDifficulty = 'advanced';
            else if (numDiff >= 3) mappedDifficulty = 'intermediate';
          } else if (typeof rawDiff === 'string') {
            mappedDifficulty = rawDiff;
          }

          return {
            courseId: rec.courseId,
            courseTitle: detail.title || rec.courseName,
            courseDescription: detail.description || '',
            difficulty: mappedDifficulty,
            duration: detail.duration_hours || detail.duration || 0,
            enrollmentCount: detail.enrollment_count || detail.enrollmentCount || 0,
            price: detail.price != null ? Number(detail.price) : 0,
            rating: detail.rating || 5,
            recommendationScore: rec.finalScore,
            scoreBreakdown: parseScoreBreakdown(rec.scoreBreakdown || (rec as any).component_scores || {}),
            reasons: rec.reasons
          };
        }),
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// NEW: API để chạy trích xuất đặc trưng ML thủ công
export const runFeatureExtraction = async (req: Request, res: Response) => {
  try {
    const service = new FeatureExtractionService();
    await service.runExtraction();
    res.status(200).json({
      success: true,
      message: 'Trích xuất đặc trưng ML thành công! CSDL đã được cập nhật.'
    });
  } catch (error) {
    console.error('Error extracting features:', error);
    res.status(500).json({ success: false, error: 'Failed to extract features' });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const connection = await db();
    let recommendations: any[] = [];
    
    try {
      const [rows]: any = await connection.execute(
        `SELECT rh.*, c.title, c.description, c.price, c.duration
         FROM recommendation_history rh
         JOIN courses c ON rh.course_id = c.id
         WHERE rh.user_id = ?
         ORDER BY rh.recommended_at DESC
         LIMIT 10`,
        [userId]
      );
      recommendations = rows;
    } catch (error) {
      console.warn("recommendation_history might not exist yet.");
    }

    if (recommendations.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No recommendations found for this user'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId,
        recommendations: recommendations.map((rec: any) => ({
          courseId: rec.course_id,
          courseTitle: rec.title,
          courseDescription: rec.description,
          difficulty: rec.difficulty || 'beginner',
          duration: rec.duration_hours || rec.duration || 0,
          enrollmentCount: rec.enrollment_count || rec.enrollmentCount || 0,
          price: rec.price != null ? Number(rec.price) : 0,
          rating: rec.rating || 5,
          recommendationScore: rec.recommendation_score,
          scoreBreakdown: parseScoreBreakdown(rec.component_scores || rec.scoreBreakdown || {}),
          recommendedAt: rec.recommended_at
        })),
        count: recommendations.length
      }
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations'
    });
  }
};

export const logRecommendationFeedback = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { courseId, action, rating, feedback } = req.body;

    if (!userId || !courseId || !action) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: courseId, action'
      });
    }

    const connection = await db();

    let updateField = '';
    let updateValue = true;
    let additionalFields = '';

    if (action === 'clicked') {
      updateField = 'clicked';
      additionalFields = ', clicked_at = NOW()';
    } else if (action === 'enrolled') {
      updateField = 'enrolled';
      additionalFields = ', enrolled_at = NOW()';
    } else if (action === 'rated') {
      updateField = 'rating';
      updateValue = rating;
      additionalFields = ', feedback = ?';
    }

    const query = `
      UPDATE recommendation_history
      SET ${updateField} = ?${additionalFields}
      WHERE user_id = ? AND course_id = ?
      ORDER BY recommended_at DESC
      LIMIT 1
    `;

    const params = additionalFields.includes('feedback')
      ? [updateValue, feedback, userId, courseId]
      : [updateValue, userId, courseId];

    await connection.execute(query, params);

    // Log to feedback analytics
    await connection.execute(
      `INSERT INTO recommendation_feedback_log 
       (user_id, course_id, action, rating, feedback, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [userId, courseId, action, rating || null, feedback || null]
    );

    res.status(200).json({
      success: true,
      message: `Feedback recorded for action: ${action}`
    });
  } catch (error) {
    console.error('Error logging feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log feedback'
    });
  }
};

export const getRecommendationAnalytics = async (req: Request, res: Response) => {
  try {
    const segment = req.query.segment as string | undefined;
    const timeframe = (req.query.timeframe as string) || '7'; // timeframe in days
    
    const connection = await db();
    
    // Calculate CTR (Click-Through Rate)
    const [ctrData]: any = await connection.execute(
      `SELECT 
        COUNT(*) as total_recommendations,
        SUM(CASE WHEN clicked = true THEN 1 ELSE 0 END) as clicks,
        SUM(CASE WHEN enrolled = true THEN 1 ELSE 0 END) as enrollments
       FROM recommendation_history
       WHERE recommended_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ${segment ? 'AND segment_type = ?' : ''}`,
      segment ? [Number(timeframe), segment] : [Number(timeframe)]
    );

    const data = Array.isArray(ctrData) ? ctrData[0] : { total_recommendations: 0, clicks: 0, enrollments: 0 };
    const ctr = data.total_recommendations > 0 
      ? ((data.clicks / data.total_recommendations) * 100).toFixed(2)
      : 0;
    const conversionRate = data.total_recommendations > 0
      ? ((data.enrollments / data.total_recommendations) * 100).toFixed(2)
      : 0;

    // Performance by segment
    const [segmentData]: any = await connection.execute(
      `SELECT segment_type,
              COUNT(*) as recommendations,
              SUM(CASE WHEN clicked = true THEN 1 ELSE 0 END) as clicks,
              SUM(CASE WHEN enrolled = true THEN 1 ELSE 0 END) as enrollments,
              AVG(recommendation_score) as avg_score
       FROM recommendation_history
       WHERE recommended_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY segment_type
       ORDER BY recommendations DESC`,
      [Number(timeframe)]
    );

    const [topCourses]: any = await connection.execute(
      `SELECT course_id, c.title,
              COUNT(*) as recommendation_count,
              SUM(CASE WHEN clicked = true THEN 1 ELSE 0 END) as clicks,
              AVG(recommendation_score) as avg_score
       FROM recommendation_history rh
       JOIN courses c ON rh.course_id = c.id
       WHERE recommended_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY course_id
       ORDER BY recommendation_count DESC
       LIMIT 10`,
      [Number(timeframe)]
    );

    const [execTimeData]: any = await connection.execute(
      `SELECT AVG(execution_time_ms) as avg_time,
              MIN(execution_time_ms) as min_time,
              MAX(execution_time_ms) as max_time
       FROM recommendation_logs
       WHERE generated_at >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [Number(timeframe)]
    );

    const execTime = Array.isArray(execTimeData) && execTimeData.length > 0 
      ? execTimeData[0] 
      : { avg_time: 0, min_time: 0, max_time: 0 };

    res.status(200).json({
      success: true,
      data: {
        timeframe: `${timeframe} days`,
        overview: {
          totalRecommendations: data.total_recommendations || 0,
          totalClicks: data.clicks || 0,
          totalEnrollments: data.enrollments,
          clickThroughRate: `${ctr}%`,
          conversionRate: `${conversionRate}%`
        },
        bySegment: segmentData.map((seg: any) => ({
          segment: seg.segment_type,
          recommendations: seg.recommendations,
          clicks: seg.clicks,
          enrollments: seg.enrollments,
          ctr: ((seg.clicks / seg.recommendations) * 100).toFixed(2) + '%',
          conversionRate: ((seg.enrollments / seg.recommendations) * 100).toFixed(2) + '%',
          avgScore: seg.avg_score
        })),
        topRecommendedCourses: topCourses.map((course: any) => ({
          courseId: course.course_id,
          title: course.title,
          recommendationCount: course.recommendation_count,
          clicks: course.clicks,
          avgScore: course.avg_score
        })),
        systemPerformance: {
          avgExecutionTime: execTime.avg_time || 0,
          minExecutionTime: execTime.min_time || 0,
          maxExecutionTime: execTime.max_time || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
};

export const updateUserSegment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const recommendations = await recommendationService.generateLearningPath(userId);

    const connection = await db();
    let segmentData: any[] = [];
    
    try {
      const [rows]: any = await connection.execute(
        'SELECT segment_type, weights FROM user_segments WHERE user_id = ?',
        [userId]
      );
      segmentData = rows;
    } catch (e) {
      console.warn("user_segments table might not exist yet.");
    }

    res.status(200).json({
      success: true,
      data: {
        userId,
        segment: segmentData[0]?.segment_type || 'career-changer',
        weights: segmentData[0]?.weights || {},
        recommendationsGenerated: recommendations.length
      }
    });
  } catch (error) {
    console.error('Error updating segment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update segment'
    });
  }
};

export const getRecommendationRules = async (req: Request, res: Response) => {
  try {
    const connection = await db();
    const [rules]: any = await connection.execute(
      'SELECT * FROM recommendation_rules ORDER BY created_at DESC'
    );

    res.status(200).json({
      success: true,
      data: { rules }
    });
  } catch (error) {
    console.error('Error fetching rules:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rules'
    });
  }
};

export const createRecommendationRule = async (req: Request, res: Response) => {
  try {
    const { ruleName, ruleType, ruleLogic, appliesToSegments } = req.body;

    const connection = await db();
    const [result]: any = await connection.execute(
      `INSERT INTO recommendation_rules 
       (rule_name, rule_type, rule_logic, applies_to_segments, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [ruleName, ruleType, JSON.stringify(ruleLogic), JSON.stringify(appliesToSegments)]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        ruleName,
        ruleType,
        message: 'Rule created successfully'
      }
    });
  } catch (error) {
    console.error('Error creating rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create rule'
    });
  }
};

export const updateRecommendationRule = async (req: Request, res: Response) => {
  try {
    const { ruleId } = req.params;
    const { ruleLogic, appliesToSegments, active } = req.body;

    const connection = await db();
    await connection.execute(
      `UPDATE recommendation_rules 
       SET rule_logic = ?, applies_to_segments = ?, active = ?, updated_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(ruleLogic), JSON.stringify(appliesToSegments), active, ruleId]
    );

    res.status(200).json({
      success: true,
      message: 'Rule updated successfully'
    });
  } catch (error) {
    console.error('Error updating rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update rule'
    });
  }
};

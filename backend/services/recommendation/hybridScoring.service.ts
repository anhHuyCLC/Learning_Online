/**
 * HYBRID RECOMMENDATION SYSTEM - ML SCORING & IMPLEMENTATION
 * 
 * TypeScript implementation of ML scoring layer + rule-based filtering
 * Last Updated: May 1, 2026
 */

import connectDB from '../../config/db';

// ============================================================================
// PART 1: FEATURE ENGINEERING & NORMALIZATION
// ============================================================================

/**
 * Feature Vector Interface - represents all ML features for a course
 */
interface CourseFeatureVector {
  courseId: number;
  difficulty: number; // 1-5 scale
  avgRating: number; // 0-5 scale
  completionRate: number; // 0-1 (%)
  popularityScore: number; // 0-1 (normalized enrollment)
  recencyDays: number; // days since created
  skillVector: Record<string, number>; // 20 skills, each 0-1
  categoryVector: Record<string, number>; // 5 categories, one-hot encoded
  avgCompletionTime: number; // hours
}

interface UserFeatureVector {
  userId: number;
  learningLevel: number; // 1-3 (beginner, intermediate, advanced)
  coursesCompleted: number;
  avgDifficulty: number; // 1-5
  avgProgress: number; // 0-100 %
  skillVector: Record<string, number>; // 20 skills, each 0-1
  categoryVector: Record<string, number>; // 5 categories, each 0-1
  engagementScore: number; // 0-100
}

/**
 * Feature Normalization Service
 * 
 * Normalize features to 0-1 range for ML model consistency
 */
class FeatureNormalizer {
  /**
   * Normalize numeric feature to 0-1 range
   * Uses min-max scaling with predefined bounds
   */
  static normalizeNumeric(
    value: number,
    min: number,
    max: number
  ): number {
    if (max === min) return 0.5; // Default to middle if range is empty
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  /**
   * Normalize difficulty (1-5 scale to 0-1)
   */
  static normalizeDifficulty(difficulty: number): number {
    return this.normalizeNumeric(difficulty, 1, 5);
  }

  /**
   * Normalize rating (0-5 scale to 0-1)
   */
  static normalizeRating(rating: number): number {
    return this.normalizeNumeric(rating, 0, 5);
  }

  /**
   * Normalize engagement (0-100 to 0-1)
   */
  static normalizeEngagement(engagement: number): number {
    return this.normalizeNumeric(engagement, 0, 100);
  }

  /**
   * Normalize completion time (0-200 hours to 0-1)
   */
  static normalizeTime(hours: number): number {
    return this.normalizeNumeric(hours, 0, 200);
  }

  /**
   * L2 normalize a vector (convert to unit vector)
   */
  static l2Normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (magnitude === 0) return vector;
    return vector.map(v => v / magnitude);
  }

  /**
   * Cosine similarity between two vectors
   * Returns 0-1 score
   */
  static cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) throw new Error('Vector length mismatch');
    
    const dotProduct = vec1.reduce((sum, v1, i) => sum + v1 * vec2[i], 0);
    const mag1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
    const mag2 = Math.sqrt(vec2.reduce((sum, v) => sum + v * v, 0));
    
    if (mag1 === 0 || mag2 === 0) return 0;
    return dotProduct / (mag1 * mag2);
  }

  /**
   * Euclidean distance between two vectors (normalized to 0-1)
   */
  static euclideanDistance(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) throw new Error('Vector length mismatch');
    
    const sumSquares = vec1.reduce((sum, v1, i) => {
      return sum + Math.pow(v1 - vec2[i], 2);
    }, 0);
    
    const distance = Math.sqrt(sumSquares);
    // Normalize to 0-1 (assuming max distance is sqrt(n) for unit vectors)
    return Math.min(1, distance / Math.sqrt(vec1.length));
  }
}

// ============================================================================
// PART 2: ML SCORING FORMULA (5 FACTORS)
// ============================================================================

/**
 * Hybrid Scoring Engine
 * 
 * Combines 5 factors:
 * 1. Relevance (skill match) - 30%
 * 2. Difficulty Match - 20%
 * 3. Performance Potential - 20%
 * 4. Engagement Factor - 15%
 * 5. Popularity/Social Proof - 15%
 */
class HybridScoringEngine {
  /**
   * Main scoring function
   * Returns score from 0-100
   */
  static calculateScore(
    userFeatures: UserFeatureVector,
    courseFeatures: CourseFeatureVector,
    similarUserRatings?: number // Average rating from similar users (if available)
  ): number {
    // Calculate individual factor scores
    const relevanceScore = this.calculateRelevanceScore(userFeatures, courseFeatures);
    const difficultyScore = this.calculateDifficultyScore(userFeatures, courseFeatures);
    const performanceScore = this.calculatePerformanceScore(userFeatures, courseFeatures);
    const engagementScore = this.calculateEngagementScore(userFeatures, courseFeatures);
    const popularityScore = this.calculatePopularityScore(courseFeatures, similarUserRatings);

    // Weighted combination
    const hybridScore =
      relevanceScore * 0.30 +
      difficultyScore * 0.20 +
      performanceScore * 0.20 +
      engagementScore * 0.15 +
      popularityScore * 0.15;

    return Math.round(hybridScore * 100) / 100; // Round to 2 decimals
  }

  /**
   * Factor 1: Relevance Score (Skill Match)
   * 
   * Measures how well the course aligns with user's skills and interests
   * Uses cosine similarity of skill vectors
   */
  private static calculateRelevanceScore(
    userFeatures: UserFeatureVector,
    courseFeatures: CourseFeatureVector
  ): number {
    // Convert skill vectors to arrays (maintain consistent order)
    const skillOrder = [
      'programming', 'data_analysis', 'web_development', 'machine_learning',
      'mobile_dev', 'database', 'cloud', 'devops', 'ai', 'nlp',
      'cv', 'cybersecurity', 'finance', 'marketing', 'leadership',
      'communication', 'project_mgmt', 'design', 'ux', 'seo'
    ];

    const userSkillVec = skillOrder.map(skill => userFeatures.skillVector[skill] || 0);
    const courseSkillVec = skillOrder.map(skill => courseFeatures.skillVector[skill] || 0);

    // Cosine similarity + category match bonus
    let relevance = FeatureNormalizer.cosineSimilarity(userSkillVec, courseSkillVec);

    // Add category preference bonus (10% boost if categories match)
    const categoryOrder = ['programming', 'data_science', 'design', 'business', 'other'];
    let categoryBonus = 0;
    for (const category of categoryOrder) {
      const userPref = userFeatures.categoryVector[category] || 0;
      const courseCat = courseFeatures.categoryVector[category] || 0;
      if (userPref > 0 && courseCat > 0) {
        categoryBonus = Math.max(categoryBonus, userPref * courseCat);
      }
    }

    // Combine: 80% skill similarity + 20% category bonus
    return (relevance * 0.8 + categoryBonus * 0.2);
  }

  /**
   * Factor 2: Difficulty Match Score
   * 
   * Measures how well course difficulty matches user's learning level
   * Optimal when: user_difficulty ≈ course_difficulty
   */
  private static calculateDifficultyScore(
    userFeatures: UserFeatureVector,
    courseFeatures: CourseFeatureVector
  ): number {
    const userDifficulty = FeatureNormalizer.normalizeNumeric(
      userFeatures.avgDifficulty,
      1,
      5
    );
    const courseDifficulty = FeatureNormalizer.normalizeDifficulty(
      courseFeatures.difficulty
    );

    // Bell curve: optimal match at user's level
    // Score = 1 - |user_diff - course_diff|^2
    const diff = Math.abs(userDifficulty - courseDifficulty);
    return Math.max(0, 1 - diff * diff); // Quadratic penalty for mismatch
  }

  /**
   * Factor 3: Performance Potential Score
   * 
   * Based on:
   * - User's historical performance (avg progress)
   * - Course's completion rate (proxy for achievability)
   * - Learning level progression path
   */
  private static calculatePerformanceScore(
    userFeatures: UserFeatureVector,
    courseFeatures: CourseFeatureVector
  ): number {
    const userProgress = FeatureNormalizer.normalizeNumeric(
      userFeatures.avgProgress,
      0,
      100
    );
    
    // Predict success likelihood: high completion rate + user has history of finishing
    const performanceScore =
      userProgress * 0.5 + // User's track record (50%)
      courseFeatures.completionRate * 0.5; // Course difficulty (50%)

    return performanceScore;
  }

  /**
   * Factor 4: Engagement Factor
   * 
   * Combines:
   * - User's engagement score (activity level)
   * - Course's expected time commitment vs user's capacity
   * - Learning level appropriateness
   */
  private static calculateEngagementScore(
    userFeatures: UserFeatureVector,
    courseFeatures: CourseFeatureVector
  ): number {
    const userEngagement = FeatureNormalizer.normalizeEngagement(
      userFeatures.engagementScore
    );

    // Higher engagement users can take longer courses
    const maxTimeCapacity = 10 + (userEngagement * 100); // 10-110 hours capacity
    const courseTime = courseFeatures.avgCompletionTime;

    // Score = 1 if course fits user's time capacity, penalize if too long
    const timeMatch = Math.max(0, 1 - (courseTime / maxTimeCapacity) * 0.5);

    // Combine engagement + time fit
    return (userEngagement * 0.6 + timeMatch * 0.4);
  }

  /**
   * Factor 5: Popularity/Social Proof Score
   * 
   * Combines:
   * - Course popularity (enrollment count)
   * - Average rating
   * - Ratings from similar users (collaborative filtering)
   */
  private static calculatePopularityScore(
    courseFeatures: CourseFeatureVector,
    similarUserRatings?: number
  ): number {
    const popularity = courseFeatures.popularityScore;
    const rating = FeatureNormalizer.normalizeRating(courseFeatures.avgRating);

    let score = popularity * 0.4 + rating * 0.6;

    // If we have ratings from similar users, boost the score (0-1)
    if (similarUserRatings !== undefined) {
      const similarUserScore = FeatureNormalizer.normalizeRating(similarUserRatings);
      score = score * 0.6 + similarUserScore * 0.4;
    }

    return score;
  }

  /**
   * Bonus/Penalty Modifiers
   */
  static applyModifiers(
    baseScore: number,
    userFeatures: UserFeatureVector,
    courseFeatures: CourseFeatureVector,
    previousCoursesFromSamePath?: number,
    daysNotRecommended?: number
  ): number {
    let score = baseScore;

    // Bonus: Already completed prerequisites
    if (previousCoursesFromSamePath && previousCoursesFromSamePath > 0) {
      score *= (1 + previousCoursesFromSamePath * 0.1); // 10% boost per prerequisite
    }

    // Penalty: Recently dismissed
    if (daysNotRecommended && daysNotRecommended < 90) {
      score *= (0.5 + (daysNotRecommended / 90) * 0.5); // Ramp up from 50% to 100% over 90 days
    }

    // Bonus: New course (recency)
    if (courseFeatures.recencyDays < 30) {
      score *= 1.1; // 10% boost for new courses
    }

    // Hard ceiling for very high scores
    return Math.min(score, 98);
  }
}

// ============================================================================
// PART 3: HYBRID RECOMMENDATION ENGINE
// ============================================================================

/**
 * RulesEngine - Placeholder for rule-based filtering logic
 */
class RulesEngine {
  async filterCoursesBySegment(
    userId: number,
    segment: string,
    features: UserFeatureVector
  ): Promise<any[]> {
    const db = await connectDB();
    
    let courses: any[] = [];
    try {
      // Bỏ c.title, c.difficulty, c.is_active vì có thể DB hiện tại chưa có các cột này
      const [rows]: any = await db.execute(
        `SELECT c.*, cat.name as category 
         FROM courses c
         LEFT JOIN categories cat ON c.category_id = cat.id`
      );
      courses = rows;
    } catch (err) {
      console.error('Lỗi khi query courses trong filterCoursesBySegment:', err);
      // Fallback nếu câu query trên vẫn lỗi (ví dụ thiếu bảng categories)
      const [fallbackRows]: any = await db.execute(`SELECT * FROM courses`);
      courses = fallbackRows;
    }

    // Lấy danh sách khóa học user đã đăng ký để loại trừ
    const [enrolled]: any = await db.execute(
      'SELECT course_id FROM enrollments WHERE user_id = ?',
      [userId]
    );
    const enrolledIds = enrolled.map((e: any) => e.course_id);

    // Lọc bỏ những khóa user đã học
    return courses
      .filter((c: any) => !enrolledIds.includes(c.id))
      .map((c: any) => ({ 
        ...c, 
        name: c.title || c.name || 'Khóa học', 
        difficulty: c.difficulty || 2, 
        prerequisitesMet: 0, 
        daysSinceDismissed: undefined, 
        skills: [] 
      }));
  }
}

/**
 * Main recommendation engine combining rule-based filtering + ML scoring
 */
class HybridRecommendationEngine {
  /**
   * Generate recommendations using hybrid approach
   * 
   * Pipeline:
   * 1. Rule-based filtering (fast, eliminates unsuitable courses)
   * 2. ML scoring (accurate, ranks by relevance)
   * 3. Ranking + diversity (top-N, avoid similar courses)
   * 4. A/B testing (if applicable)
   */
  async generateRecommendations(
    userId: number,
    limit: number = 10
  ): Promise<RecommendationResult[]> {
    // Step 1: Get user and course features
    const userFeatures = await this.getUserFeatures(userId);
    const userSegment = await this.classifyUserSegment(userId, userFeatures);
    
    // Step 2: Rule-based filtering
    const rulesEngine = new RulesEngine();
    const rulePassingCourses = await rulesEngine.filterCoursesBySegment(
      userId,
      userSegment,
      userFeatures
    );

    console.log(`[Hybrid] Rule filtering: ${rulePassingCourses.length} courses passed`);

    // Step 3: ML scoring
    const scoredCourses = await Promise.all(
      rulePassingCourses.map(async (course) => {
        const courseFeatures = await this.getCourseFeatures(course.id);
        const similarUserRatings = await this.getSimilarUserRating(userId, course.id);

        const mlScore = HybridScoringEngine.calculateScore(
          userFeatures,
          courseFeatures,
          similarUserRatings
        );

        const finalScore = HybridScoringEngine.applyModifiers(
          mlScore,
          userFeatures,
          courseFeatures,
          course.prerequisitesMet || 0,
          course.daysSinceDismissed || undefined
        );

        return {
          courseId: course.id,
          courseName: course.name,
          category: course.category || 'other',
          skills: course.skills || [],
          mlScore: mlScore,
          finalScore: finalScore,
          scoreBreakdown: await this.getScoreBreakdown(
            userFeatures,
            courseFeatures,
            mlScore
          ),
          reasons: this.generateReasons(userFeatures, courseFeatures),
        };
      })
    );

    // Step 4: Ranking + diversity
    const diverseRecommendations = this.rankAndDiversify(scoredCourses, limit);

    // Step 5: Log for analytics
    await this.logRecommendationEvent(userId, diverseRecommendations);

    return diverseRecommendations.slice(0, limit);
  }

  /**
   * Rank recommendations and apply diversity
   * 
   * Diversity strategy:
   * - Top course by score
   * - One course from each category (if available)
   * - Bonus for skill diversification
   */
  private rankAndDiversify(
    scoredCourses: any[],
    limit: number
  ): RecommendationResult[] {
    // Sort by final score (descending)
    const sorted = scoredCourses.sort((a, b) => b.finalScore - a.finalScore);

    const recommended: RecommendationResult[] = [];
    const categories = new Set<string>();
    const skills = new Set<string>();

    for (const course of sorted) {
      // Diversity check
      if (recommended.length > 0) {
        // Must have different category than first recommendation
        if (categories.has(course.category)) {
          // Skip similar categories after first
          continue;
        }

        // Check skill diversity (don't recommend courses teaching exact same skills)
        if (this.hasSimilarSkills(course.skills, skills)) {
          continue;
        }
      }

      recommended.push(course);
      categories.add(course.category);
      course.skills.forEach((s: string) => skills.add(s));

      if (recommended.length >= limit) break;
    }

    // If not enough diverse results, add more by score
    if (recommended.length < limit) {
      for (const course of sorted) {
        if (!recommended.includes(course)) {
          recommended.push(course);
          if (recommended.length >= limit) break;
        }
      }
    }

    return recommended;
  }

  /**
   * Check if two skill sets have >50% overlap
   */
  private hasSimilarSkills(courseSkills: string[], userSkills: Set<string>): boolean {
    const overlap = courseSkills.filter(s => userSkills.has(s)).length;
    return overlap > (courseSkills.length * 0.5);
  }

  /**
   * Generate human-readable reasons for recommendation
   */
  private generateReasons(
    userFeatures: UserFeatureVector,
    courseFeatures: CourseFeatureVector
  ): string[] {
    const reasons: string[] = [];

    // Reason 1: Skill match
    const topSkill = Object.entries(courseFeatures.skillVector)
      .sort(([, a], [, b]) => b - a)[0];
    if (topSkill && topSkill[1] > 0.7) {
      reasons.push(`Teaches ${topSkill[0]}, aligning with your interests`);
    }

    // Reason 2: Difficulty
    if (Math.abs(userFeatures.avgDifficulty - courseFeatures.difficulty) < 1) {
      reasons.push(`Difficulty level matches your learning pace`);
    }

    // Reason 3: Popularity
    if (courseFeatures.popularityScore > 0.7) {
      reasons.push(`Popular choice (${Math.round(courseFeatures.popularityScore * 100)}% completion rate)`);
    }

    // Reason 4: Rating
    if (courseFeatures.avgRating > 4.5) {
      reasons.push(`Highly rated (${courseFeatures.avgRating.toFixed(1)}/5 stars)`);
    }

    // Reason 5: Progress
    if (userFeatures.avgProgress > 75) {
      reasons.push(`Next step in your learning journey`);
    }

    return reasons;
  }

  /**
   * Get detailed score breakdown for transparency
   */
  private async getScoreBreakdown(
    userFeatures: UserFeatureVector,
    courseFeatures: CourseFeatureVector,
    totalScore: number
  ): Promise<ScoreBreakdown> {
    return {
      relevance: HybridScoringEngine['calculateRelevanceScore'](userFeatures, courseFeatures),
      difficultyMatch: HybridScoringEngine['calculateDifficultyScore'](userFeatures, courseFeatures),
      performancePotential: HybridScoringEngine['calculatePerformanceScore'](userFeatures, courseFeatures),
      engagementFactor: HybridScoringEngine['calculateEngagementScore'](userFeatures, courseFeatures),
      popularityProof: HybridScoringEngine['calculatePopularityScore'](courseFeatures),
      total: totalScore,
    };
  }

  // Placeholder methods (implement with actual DB queries)
  private async getUserFeatures(userId: number): Promise<UserFeatureVector> {
    try {
      const db = await connectDB();
      const [rows]: any = await db.execute('SELECT * FROM user_features WHERE user_id = ?', [userId]);
      
      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          userId: row.user_id,
          learningLevel: row.learning_level || 1,
          coursesCompleted: row.courses_completed || 0,
          avgDifficulty: row.avg_difficulty || 1,
          avgProgress: row.avg_progress || 0,
          skillVector: typeof row.skill_vector === 'string' ? JSON.parse(row.skill_vector) : (row.skill_vector || {}),
          categoryVector: typeof row.category_vector === 'string' ? JSON.parse(row.category_vector) : (row.category_vector || {}),
          engagementScore: row.engagement_score || 0
        };
      }
    } catch (error) {
      console.warn("Lỗi hoặc bảng user_features chưa tồn tại, dùng dữ liệu mặc định.");
    }
    
    // Dữ liệu mặc định nếu user mới tinh hoặc chưa chạy SQL tạo bảng
    return {
      userId,
      learningLevel: 1, coursesCompleted: 0, avgDifficulty: 2, avgProgress: 0,
      skillVector: {}, categoryVector: {}, engagementScore: 50
    };
  }

  private async getCourseFeatures(courseId: number): Promise<CourseFeatureVector> {
    try {
      const db = await connectDB();
      const [rows]: any = await db.execute('SELECT * FROM course_features WHERE course_id = ?', [courseId]);
      
      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          courseId: row.course_id,
          difficulty: row.difficulty_level || 2,
          avgRating: row.avg_rating || 4.5,
          completionRate: row.completion_rate || 0.5,
          popularityScore: row.popularity_score || 0.5,
          recencyDays: row.recency_days || 30,
          avgCompletionTime: row.avg_completion_time || 10,
          skillVector: typeof row.skill_vector === 'string' ? JSON.parse(row.skill_vector) : (row.skill_vector || {}),
          categoryVector: typeof row.category_vector === 'string' ? JSON.parse(row.category_vector) : (row.category_vector || {})
        };
      }
    } catch (error) {
      // Bỏ qua lỗi, dùng fallback bên dưới
    }

    // Fallback: Lấy thông tin cơ bản trực tiếp từ bảng courses nếu course_features chưa có
    const db = await connectDB();
    let courseDifficulty = 2;
    try {
      const [basicCourseFallback]: any = await db.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
      if (basicCourseFallback[0] && basicCourseFallback[0].difficulty) {
        const dbDiff = basicCourseFallback[0].difficulty;
        if (typeof dbDiff === 'number') {
          courseDifficulty = dbDiff;
        } else if (typeof dbDiff === 'string') {
          const lowerDiff = dbDiff.toLowerCase();
          if (lowerDiff.includes('advanced') || lowerDiff.includes('hard')) courseDifficulty = 5;
          else if (lowerDiff.includes('intermediate') || lowerDiff.includes('medium')) courseDifficulty = 3;
          else courseDifficulty = 2; // beginner
        }
      }
    } catch (e) {
      // Bỏ qua nếu lỗi
    }
    
    return {
      courseId,
      difficulty: courseDifficulty,
      avgRating: 4.0, completionRate: 0.5, popularityScore: 0.5, recencyDays: 60, avgCompletionTime: 20,
      skillVector: {}, categoryVector: {}
    };
  }

  private async classifyUserSegment(
    userId: number,
    features: UserFeatureVector
  ): Promise<string> {
    if (features.coursesCompleted === 0) return 'Newbie';
    if (features.engagementScore > 80) return 'Quick-Learner';
    if (features.learningLevel === 3) return 'Skill-Enhancer';
    return 'Career-Changer';
  }

  private async getSimilarUserRating(
    userId: number,
    courseId: number
  ): Promise<number | undefined> {
    try {
      const db = await connectDB();
      const [rows]: any = await db.execute(`
        SELECT AVG(r.rating) as avg_rating 
        FROM user_similarity us
        JOIN ratings r ON us.user_id_2 = r.user_id
        WHERE us.user_id_1 = ? AND r.course_id = ?
      `, [userId, courseId]);
      
      if (rows && rows[0] && rows[0].avg_rating) {
        return parseFloat(rows[0].avg_rating);
      }
    } catch (error) {
      // Ignore if table doesn't exist
    }
    return undefined;
  }

  private async logRecommendationEvent(
    userId: number,
    recommendations: RecommendationResult[]
  ): Promise<void> {
    try {
      const db = await connectDB();
      const values = recommendations.map(r => [
        userId,
        r.courseId,
        r.finalScore,
        JSON.stringify(r.scoreBreakdown),
        JSON.stringify(r.reasons),
        'hybrid-v1'
      ]);

      for (const val of values) {
        await db.execute(
          `INSERT INTO recommendation_history (user_id, course_id, recommendation_score, component_scores, reasons, segment_type) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          val
        );
      }
    } catch (error) {
      console.error("Lỗi ghi log recommendation:", error);
    }
  }
}

// ============================================================================
// PART 4: INTERFACES & TYPES
// ============================================================================

interface RecommendationResult {
  courseId: number;
  courseName: string;
  category?: string;
  skills?: string[];
  mlScore: number;
  finalScore: number;
  scoreBreakdown: ScoreBreakdown;
  reasons: string[];
}

interface ScoreBreakdown {
  relevance: number; // 0-1
  difficultyMatch: number; // 0-1
  performancePotential: number; // 0-1
  engagementFactor: number; // 0-1
  popularityProof: number; // 0-1
  total: number; // 0-100
}

export {
  HybridScoringEngine,
  HybridRecommendationEngine,
  FeatureNormalizer,
  CourseFeatureVector,
  UserFeatureVector,
  RecommendationResult,
  ScoreBreakdown,
};

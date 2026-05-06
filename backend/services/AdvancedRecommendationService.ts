import db from "../config/db";

interface UserProfile {
  id: number;
  name: string;
  age: number;
  role: string;
  goals: string[];
  budget: number;
  preferredLanguage: string;
}

interface UserLearningHistory {
  totalCoursesCompleted: number;
  averageQuizScore: number;
  totalLearningHours: number;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  enrolledCourses: number;
  completionRate: number;
  averageDailyLearningTime: number;
  consistencyScore: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // hours
  price: number;
  rating: number;
  enrollmentCount: number;
  category: string;
  skills: string[];
  prerequisites: number[]; // course IDs
  instructorId: number;
  format: 'video' | 'text' | 'interactive' | 'mixed';
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RecommendationScore {
  relevance: number;
  difficulty: number;
  performance: number;
  engagement: number;
  progression: number;
  popularity: number;
  freshness: number;
  final: number;
}

interface RecommendedCourse {
  course: Course;
  score: RecommendationScore;
  reason: string;
}

interface UserSegment {
  type: 'newbie' | 'career-changer' | 'quick-learner' | 'hobby-learner' | 'skill-enhancer';
  weights: {
    relevance: number;
    difficulty: number;
    performance: number;
    engagement: number;
    progression: number;
    popularity: number;
    freshness: number;
  };
  maxCoursesPerMonth: number;
  requiredPrerequisites: boolean;
}

const USER_SEGMENTS: Record<string, UserSegment> = {
  'newbie': {
    type: 'newbie',
    weights: {
      relevance: 0.20, difficulty: 0.25, performance: 0.20,
      engagement: 0.15, progression: 0.15, popularity: 0.05, freshness: 0.00
    },
    maxCoursesPerMonth: 1,
    requiredPrerequisites: true
  },
  'career-changer': {
    type: 'career-changer',
    weights: {
      relevance: 0.40, difficulty: 0.15, performance: 0.10,
      engagement: 0.10, progression: 0.15, popularity: 0.05, freshness: 0.05
    },
    maxCoursesPerMonth: 2,
    requiredPrerequisites: true
  },
  'quick-learner': {
    type: 'quick-learner',
    weights: {
      relevance: 0.30, difficulty: 0.25, performance: 0.20,
      engagement: 0.10, progression: 0.10, popularity: 0.05, freshness: 0.00
    },
    maxCoursesPerMonth: 3,
    requiredPrerequisites: false
  },
  'hobby-learner': {
    type: 'hobby-learner',
    weights: {
      relevance: 0.15, difficulty: 0.10, performance: 0.10,
      engagement: 0.35, progression: 0.10, popularity: 0.15, freshness: 0.05
    },
    maxCoursesPerMonth: 1,
    requiredPrerequisites: false
  },
  'skill-enhancer': {
    type: 'skill-enhancer',
    weights: {
      relevance: 0.35, difficulty: 0.20, performance: 0.25,
      engagement: 0.10, progression: 0.05, popularity: 0.05, freshness: 0.00
    },
    maxCoursesPerMonth: 2,
    requiredPrerequisites: true
  }
};

const LEVEL_ORDER = {
  'beginner': 1,
  'intermediate': 2,
  'advanced': 3,
  'expert': 4
};

export class AdvancedRecommendationService {
 
  async generateLearningPath(userId: number): Promise<RecommendedCourse[]> {
    const startTime = Date.now();
    
    try {
      // 1. Fetch user data
      const userProfile = await this.fetchUserProfile(userId) || { id: userId, goals: [], preferredLanguage: 'English' } as any;
      const learningHistory = await this.fetchLearningHistory(userId);
      const userPreferences = await this.fetchUserPreferences(userId);

      // 2. Classify user segment
      const segment = this.classifyUserSegment(userProfile, learningHistory);
      await this.saveUserSegment(userId, segment);

      // 3. Fetch all courses
      const allCourses = await this.fetchAllCourses();

      // 4. Apply rules (filtering)
      let candidates = allCourses;
      candidates = this.applyLevelBasedRules(candidates, learningHistory);
      candidates = this.applyGoalBasedRules(candidates, userProfile);
      candidates = this.applyBehaviorBasedRules(candidates, learningHistory, userPreferences);
      candidates = this.applyPerformanceBasedRules(candidates, userId, learningHistory);
      candidates = this.applyPreferenceBasedRules(candidates, userPreferences);

      // 5. Calculate scores
      const scoredCourses = await this.scoreAllCandidates(
        candidates,
        userId,
        userProfile,
        learningHistory,
        segment
      );

      // 6. Rank and select top recommendations
      const recommendations = this.rankAndSelectTopCourses(scoredCourses, segment, 5);

      // 7. Cache and log
      await this.cacheRecommendations(userId, recommendations);
      await this.logRecommendationEvent(userId, recommendations, segment, Date.now() - startTime);

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  private applyLevelBasedRules(
    courses: Course[],
    history: UserLearningHistory
  ): Course[] {
    const userLevelNumeric = LEVEL_ORDER[history.currentLevel || 'beginner'] || 1;
    
    return courses.filter(course => {
      const courseLevelNumeric = LEVEL_ORDER[course.difficulty || 'beginner'] || 1;
      
      const levelDifference = courseLevelNumeric - userLevelNumeric;
      
      if (levelDifference > 1) return false; // Too advanced
      if (levelDifference < -1) return false; // Too basic (except for review)
      
      return true;
    });
  }

  /**
   * Rule GO: Goal-Based Rules
   * Filter courses by goal alignment
   */
  private applyGoalBasedRules(
    courses: Course[],
    profile: UserProfile
  ): Course[] {
    const goalsArray = Array.isArray(profile.goals) ? profile.goals : (typeof profile.goals === 'string' ? JSON.parse(profile.goals || '[]') : []);
    if (!goalsArray || goalsArray.length === 0) {
      return courses; // No goals = no filtering
    }

    return courses.filter(course => {
      const courseRelevance = this.calculateGoalRelevance(course, goalsArray);
      return courseRelevance >= 0.40; // At least 40% relevant
    });
  }

  /**
   * Rule BH: Behavior-Based Rules
   * Filter courses based on learning behavior patterns
   */
  private applyBehaviorBasedRules(
    courses: Course[],
    history: UserLearningHistory,
    preferences: any
  ): Course[] {
    return courses.filter(course => {
      // Rule BH-01: Course length based on learning time
      const avgDailyTime = history.averageDailyLearningTime || 60;
      if (avgDailyTime < 30 && course.duration > 40) {
        return false; // Too long for this user's pace
      }

      // Rule BH-02: Trust level based on completion rate
      const completionRate = history.completionRate || 0;
      if (completionRate < 0.30 && course.duration > 50) {
        return false; // Don't recommend long courses to low completers
      }

      // Rule BH-03: Budget consideration
      if (preferences.maxBudgetPerCourse && course.price > preferences.maxBudgetPerCourse) {
        return false;
      }

      return true;
    });
  }

  /**
   * Rule PF: Performance-Based Rules
   * Filter based on prerequisite mastery and quiz performance
   */
  private applyPerformanceBasedRules(
    courses: Course[],
    userId: number,
    history: UserLearningHistory
  ): Course[] {
    return courses.filter(async (course) => {
      // Check prerequisites
      const prerequisites = Array.isArray(course.prerequisites) ? course.prerequisites : (typeof course.prerequisites === 'string' ? JSON.parse(course.prerequisites || '[]') : []);
      if (prerequisites.length > 0) {
        const userMastery = await this.getUserSkillMastery(userId);
        for (const prereqId of prerequisites as number[]) {
          if (!userMastery.has(prereqId)) {
            return false; // Missing prerequisite
          }
        }
      }

      // Rule PF-03: Performance trend - don't escalate if declining
      if (history.averageQuizScore < 50) {
        // Struggling - offer review courses, not new advanced content
        return course.difficulty !== 'advanced' && course.difficulty !== 'expert';
      }

      return true;
    });
  }

  /**
   * Rule PR: Preference-Based Rules
   * Filter by user preferences (language, format, instructor)
   */
  private applyPreferenceBasedRules(
    courses: Course[],
    preferences: any
  ): Course[] {
    return courses.filter(course => {
      // Language preference
      if (preferences.preferredLanguage && 
          course.language !== preferences.preferredLanguage && 
          course.language !== 'English') {
        // Boost English if preferred language not available
        if (course.language !== 'English') return false;
      }

      // Format preference (soft requirement - prefer but don't exclude)
      if (preferences.preferredFormat && 
          !preferences.preferredFormat.includes(course.format)) {
        // Still include, but will score lower
      }

      return true;
    });
  }

  // ==================== SCORING ENGINE ====================

  /**
   * Calculate scores for all candidate courses
   */
  private async scoreAllCandidates(
    courses: Course[],
    userId: number,
    profile: UserProfile,
    history: UserLearningHistory,
    segment: UserSegment
  ): Promise<RecommendedCourse[]> {
    const userMastery = await this.getUserSkillMastery(userId);
    const preferences = await this.fetchUserPreferences(userId);
    const instructorPrefs = preferences.preferredInstructors || [];

    return Promise.all(courses.map(async course => {
      const componentScores = {
        relevance: this.calculateRelevanceScore(course, profile),
        difficulty: this.calculateDifficultyScore(course, history),
        performance: this.calculatePerformanceScore(course, userMastery, history),
        engagement: this.calculateEngagementScore(course),
        progression: await this.calculateProgressionScore(course, userId, history),
        popularity: this.calculatePopularityScore(course),
        freshness: this.calculateFreshnessScore(course)
      };

      // Apply weights
      const finalScore = (
        segment.weights.relevance * componentScores.relevance +
        segment.weights.difficulty * (componentScores.difficulty / 5) * 100 +
        segment.weights.performance * componentScores.performance +
        segment.weights.engagement * componentScores.engagement +
        segment.weights.progression * componentScores.progression +
        segment.weights.popularity * componentScores.popularity +
        segment.weights.freshness * componentScores.freshness
      );

      const reason = this.generateRecommendationReason(course, componentScores, history);

      return {
        course,
        score: { ...componentScores, final: Math.min(finalScore, 100) },
        reason
      };
    }));
  }

  /**
   * Score Component 1: Relevance (0-100)
   */
  private calculateRelevanceScore(course: Course, profile: UserProfile): number {
    let score = 50; // Base score

    const goalsArray = Array.isArray(profile.goals) ? profile.goals : (typeof profile.goals === 'string' ? JSON.parse(profile.goals || '[]') : []);
    // Goal alignment
    if (goalsArray.length > 0) {
      const alignment = this.calculateGoalRelevance(course, goalsArray);
      score += alignment * 30;
    }

    // Skill alignment
    const courseSkills = Array.isArray(course.skills) ? course.skills : (typeof course.skills === 'string' ? JSON.parse(course.skills || '[]') : []);
    const skillCount = courseSkills.length || 0;
    if (skillCount > 0) {
      score += Math.min(skillCount * 5, 20);
    }

    // Language match
    if (course.language === profile.preferredLanguage) {
      score += 15;
    } else if (course.language === 'English') {
      score += 8;
    }

    return Math.min(score, 100);
  }

  /**
   * Score Component 2: Difficulty (1-5)
   */
  private calculateDifficultyScore(
    course: Course,
    history: UserLearningHistory
  ): number {
    const userLevelNum = LEVEL_ORDER[history.currentLevel || 'beginner'] || 1;
    const courseLevelNum = LEVEL_ORDER[course.difficulty || 'beginner'] || 1;
    const difference = Math.abs(userLevelNum - courseLevelNum);

    // Perfect match = 5, ±1 = 4, ±2 = 3
    return Math.max(5 - difference, 1);
  }

  /**
   * Score Component 3: Performance (0-100)
   */
  private calculatePerformanceScore(
    course: Course,
    userMastery: Map<number, string>,
    history: UserLearningHistory
  ): number {
    let score = 50;

    // Prerequisite mastery (40%)
    const prerequisites = Array.isArray(course.prerequisites) ? course.prerequisites : (typeof course.prerequisites === 'string' ? JSON.parse(course.prerequisites || '[]') : []);
    if (prerequisites.length > 0) {
      const masteredPrereqs = (prerequisites as number[]).filter((id: number) => {
        const mastery = userMastery.get(id);
        return mastery === 'mastered' || mastery === 'proficient';
      }).length;
      score += (masteredPrereqs / prerequisites.length) * 40;
    } else {
      score += 40; // No prerequisites = full points
    }

    // Recent performance (40%)
    if (history.averageQuizScore) {
      score += (history.averageQuizScore / 100) * 40;
    }

    // Consistency bonus (20%)
    if (history.consistencyScore > 0.7) {
      score += 20;
    } else {
      score += (history.consistencyScore || 0) * 20;
    }

    return Math.min(score, 100);
  }

  /**
   * Score Component 4: Engagement (0-100)
   */
  private calculateEngagementScore(course: Course): number {
    let score = 50;

    const enrollmentCount = course.enrollmentCount || 0;
    const rating = course.rating || 0;

    // Popularity (high enrollment = trusted by others)
    if (enrollmentCount > 10000) {
      score += 25;
    } else if (enrollmentCount > 1000) {
      score += 15;
    } else if (enrollmentCount > 100) {
      score += 8;
    }

    // Rating
    if (rating >= 4.7) {
      score += 15;
    } else if (rating >= 4.5) {
      score += 10;
    } else if (rating >= 4.0) {
      score += 5;
    }

    // Trending (recently updated)
    const createdAt = course.createdAt || (course as any).created_at || new Date();
    const updatedAt = course.updatedAt || (course as any).updated_at || createdAt;
    const daysSinceUpdate = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) {
      score += 10;
    }

    return Math.min(score, 100);
  }

  /**
   * Score Component 5: Progression (0-100)
   */
  private async calculateProgressionScore(
    course: Course,
    userId: number,
    history: UserLearningHistory
  ): Promise<number> {
    let score = 50;

    // Check if course is next logical step
    const userPath = await this.getUserCurrentPath(userId);
    const nextInPath = userPath?.[0]; // First course in path

    if (nextInPath?.id === course.id) {
      score += 30; // Next in path = high score
    }

    // Skill building alignment
    const userSkills = await this.getUserSkills(userId);
    const courseSkills = new Set(Array.isArray(course.skills) ? course.skills : (typeof course.skills === 'string' ? JSON.parse(course.skills || '[]') : []));
    const matchingSkills = userSkills.filter(skill => courseSkills.has(skill)).length;

    if (matchingSkills > 0) {
      score += Math.min(matchingSkills * 10, 20);
    }

    return Math.min(score, 100);
  }

  /**
   * Score Component 6: Popularity (0-100)
   */
  private calculatePopularityScore(course: Course): number {
    const maxEnrollment = 50000; // Reference max
    const enrollmentCount = course.enrollmentCount || 0;
    return Math.min((enrollmentCount / maxEnrollment) * 100, 100);
  }

  /**
   * Score Component 7: Freshness (0-100)
   */
  private calculateFreshnessScore(course: Course): number {
    const createdAt = course.createdAt || (course as any).created_at || new Date();
    const updatedAt = course.updatedAt || (course as any).updated_at || createdAt;

    const daysSinceCreation = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceUpdate = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);

    let score = 0;

    // New course
    if (daysSinceCreation < 90) {
      score += 30;
    }

    // Recently updated
    if (daysSinceUpdate < 30) {
      score += 40;
    } else if (daysSinceUpdate < 90) {
      score += 20;
    } else if (daysSinceUpdate < 180) {
      score += 10;
    }

    // Recency bonus (decreasing over time)
    const maxDays = 365;
    const recencyBonus = Math.max((1 - daysSinceUpdate / maxDays) * 100, 0);
    score += recencyBonus * 0.3;

    return Math.min(score, 100);
  }

  // ==================== HELPER METHODS ====================

  /**
   * Classify user into segment based on profile and history
   */
  private classifyUserSegment(
    profile: UserProfile,
    history: UserLearningHistory
  ): UserSegment {
    // Check for newbie
    if (history.totalCoursesCompleted === 0) {
      return USER_SEGMENTS['newbie'];
    }

    // Check for career changer
    if (profile.goals?.includes('career-change')) {
      return USER_SEGMENTS['career-changer'];
    }

    // Check for quick learner
    if (history.averageDailyLearningTime > 120 && history.currentLevel !== 'beginner') {
      return USER_SEGMENTS['quick-learner'];
    }

    // Check for skill enhancer
    if (history.averageQuizScore > 80 && history.totalCoursesCompleted > 5) {
      return USER_SEGMENTS['skill-enhancer'];
    }

    // Check for hobby learner
    if (history.completionRate < 0.40 && history.enrolledCourses > 3) {
      return USER_SEGMENTS['hobby-learner'];
    }

    // Default to career-changer style
    return USER_SEGMENTS['career-changer'];
  }

  /**
   * Calculate goal relevance (0-100)
   */
  private calculateGoalRelevance(course: Course, userGoals: string[]): number {
    const courseSkills = Array.isArray(course.skills) ? course.skills : (typeof course.skills === 'string' ? JSON.parse(course.skills || '[]') : []);
    const courseKeywords = [
      ...courseSkills,
      course.category || '',
      (course.title || (course as any).name || '').toLowerCase()
    ].filter(Boolean);

    let matchCount = 0;
    const goalsArray = Array.isArray(userGoals) ? userGoals : (typeof userGoals === 'string' ? JSON.parse(userGoals || '[]') : []);

    for (const goal of goalsArray) {
      const goalLower = goal.toLowerCase();
      for (const keyword of courseKeywords) {
        if (keyword && typeof keyword === 'string' && (keyword.toLowerCase().includes(goalLower) ||
            goalLower.includes(keyword.toLowerCase()))) {
          matchCount++;
        }
      }
    }

    return Math.min((matchCount / (goalsArray.length || 1)) * 100, 100);
  }

  /**
   * Generate human-readable reason for recommendation
   */
  private generateRecommendationReason(
    course: Course,
    scores: any,
    history: UserLearningHistory
  ): string {
    if (scores.relevance > 80) {
      return `Highly relevant to your goals: ${course.title}`;
    } else if (scores.progression > 80) {
      return `Next step in your learning journey: ${course.title}`;
    } else if (scores.engagement > 80) {
      return `Trending and well-reviewed: ${course.title}`;
    } else if (scores.difficulty > 4) {
      return `Perfect difficulty for your level: ${course.title}`;
    } else if (scores.performance > 80) {
      return `You have strong prerequisites for: ${course.title}`;
    }
    return `Recommended based on your profile: ${course.title}`;
  }

  /**
   * Rank courses and select top N
   */
  private rankAndSelectTopCourses(
    courses: RecommendedCourse[],
    segment: UserSegment,
    topN: number = 5
  ): RecommendedCourse[] {
    // Sort by final score
    const ranked = courses.sort((a, b) => b.score.final - a.score.final);

    // Diversify recommendations (avoid all same category)
    const selected: RecommendedCourse[] = [];
    const categories = new Set<string>();

    for (const course of ranked) {
      if (selected.length >= topN) break;

      const category = course.course.category || 'general';
      // Add first 2 courses without category check
      if (selected.length < 2) {
        selected.push(course);
        categories.add(category);
        continue;
      }

      // Then avoid duplicate categories if possible
      if (!categories.has(category) || selected.length < topN - 1) {
        selected.push(course);
        categories.add(category);
      }
    }

    return selected;
  }

  // ==================== DATABASE OPERATIONS ====================

  private async fetchUserProfile(userId: number): Promise<UserProfile> {
    const connection = await db();
    const [rows]: any = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );
    return rows[0];
  }

  private async fetchLearningHistory(userId: number): Promise<UserLearningHistory> {
    const connection = await db();
    
    let completedCount = 0;
    try {
      const [completed]: any = await connection.execute(
        'SELECT COUNT(*) as count FROM enrollments WHERE user_id = ? AND status = "completed"',
        [userId]
      );
      completedCount = completed[0]?.count || 0;
    } catch (e) { console.warn("Error fetching completed count (enrollments table)"); }

    let avgQuizScore = 0;
    try {
      const [quizzes]: any = await connection.execute(
        'SELECT AVG(score / total_score * 100) as avg_score FROM quiz_results WHERE user_id = ?',
        [userId]
      );
      avgQuizScore = quizzes[0]?.avg_score || 0;
    } catch (e) { console.warn("Error fetching quiz scores (quiz_results table)"); }

    let totalHours = 0;
    try {
      // Try to fetch hours if the duration column exists (fallback to 0 if fails)
      const [hours]: any = await connection.execute(
        'SELECT SUM(c.duration) as total FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.user_id = ?',
        [userId]
      );
      totalHours = hours[0]?.total || 0;
    } catch (e) { console.warn("Error fetching duration (courses table)"); }

    return {
      totalCoursesCompleted: completedCount,
      averageQuizScore: avgQuizScore,
      totalLearningHours: totalHours,
      currentLevel: 'beginner', // TODO: Calculate from mastery
      enrolledCourses: 0, // TODO: Count from DB
      completionRate: 0, // TODO: Calculate
      averageDailyLearningTime: 60, // TODO: Calculate from logs
      consistencyScore: 0 // TODO: Calculate from history
    };
  }

  private async fetchUserPreferences(userId: number): Promise<any> {
    try {
      const connection = await db();
      const [rows]: any = await connection.execute(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [userId]
      );
      return rows[0] || {};
    } catch (error) {
      console.warn("user_preferences table might not exist");
      return {};
    }
  }

  private async fetchAllCourses(): Promise<Course[]> {
    const connection = await db();
    try {
      const [rows]: any = await connection.execute(
        'SELECT * FROM courses WHERE published = true ORDER BY rating DESC'
      );
      return rows;
    } catch (error) {
      console.warn("Courses table might not have 'published' or 'rating' columns, falling back...");
      const [rows]: any = await connection.execute('SELECT * FROM courses');
      return rows;
    }
  }

  private async getUserSkillMastery(userId: number): Promise<Map<number, string>> {
    const mastery = new Map();
    try {
      const connection = await db();
      const [rows]: any = await connection.execute(
        'SELECT skill_id, proficiency_level FROM user_skills WHERE user_id = ?',
        [userId]
      );
      for (const row of rows as { skill_id: number; proficiency_level: string }[]) {
        mastery.set(row.skill_id, row.proficiency_level);
      }
    } catch (error) {
      console.warn("user_skills table might not exist");
    }
    return mastery;
  }

  private async getUserSkills(userId: number): Promise<string[]> {
    try {
      const connection = await db();
      const [rows]: any = await connection.execute(
        'SELECT skill_name FROM user_skills WHERE user_id = ? AND proficiency_level IN ("proficient", "mastered")',
        [userId]
      );
      return rows.map((r: any) => r.skill_name);
    } catch (error) {
      console.warn("user_skills table might not exist");
      return [];
    }
  }

  private async getUserCurrentPath(userId: number): Promise<any[]> {
    try {
      const connection = await db();
      const [rows]: any = await connection.execute(
        'SELECT * FROM learning_paths WHERE user_id = ? LIMIT 5',
        [userId]
      );
      return rows || [];
    } catch (error) {
      console.warn("learning_paths table might not exist");
      return [];
    }
  }

  private async saveUserSegment(userId: number, segment: UserSegment): Promise<void> {
    try {
      const connection = await db();
      await connection.execute(
        `INSERT INTO user_segments (user_id, segment_type, weights, confidence_score, last_updated)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE segment_type = ?, weights = ?, last_updated = NOW()`,
        [
          userId,
          segment.type,
          JSON.stringify(segment.weights),
          100,
          segment.type,
          JSON.stringify(segment.weights)
        ]
      );
    } catch (error) {
      console.warn("user_segments table might not exist");
    }
  }

  private async cacheRecommendations(
    userId: number,
    recommendations: RecommendedCourse[]
  ): Promise<void> {
    try {
      const connection = await db();
      for (const rec of recommendations) {
        await connection.execute(
          `INSERT INTO recommendation_history 
           (user_id, course_id, recommendation_score, component_scores, recommended_at)
           VALUES (?, ?, ?, ?, NOW())`,
          [
            userId,
            rec.course.id,
            rec.score.final,
            JSON.stringify(rec.score)
          ]
        );
      }
    } catch (error) {
      console.warn("recommendation_history table might not exist");
    }
  }

  private async logRecommendationEvent(
    userId: number,
    recommendations: RecommendedCourse[],
    segment: UserSegment,
    executionTime: number
  ): Promise<void> {
    try {
      const connection = await db();
      await connection.execute(
        `INSERT INTO recommendation_logs 
         (user_id, segment_type, output_recommendations, execution_time_ms, generated_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [
          userId,
          segment.type,
          JSON.stringify(recommendations.map(r => ({
            courseId: r.course.id,
            score: r.score.final,
            reason: r.reason
          }))),
          executionTime
        ]
      );
    } catch (error) {
      console.warn("recommendation_logs table might not exist");
    }
  }
}

// ==================== EXPORTS ====================

export const recommendationService = new AdvancedRecommendationService();

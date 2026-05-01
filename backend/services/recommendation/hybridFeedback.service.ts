/**
 * HYBRID RECOMMENDATION SYSTEM - FEEDBACK & A/B TESTING STRATEGY
 * 
 * Strategies for continuous model improvement and A/B testing
 * Last Updated: May 1, 2026
 */

// ============================================================================
// PART 1: FEEDBACK LOGGING SYSTEM
// ============================================================================

/**
 * Comprehensive feedback logging for model training and evaluation
 */

interface FeedbackEvent {
  id: string; // UUID
  userId: number;
  courseId: number;
  recommendationId: number; // Links back to recommendation_history
  timestamp: Date;
  eventType: 'view' | 'engage' | 'enroll' | 'start' | 'complete' | 'dismiss' | 'rate';
  metadata: {
    timeSpentMs?: number; // How long user viewed
    rating?: number; // 1-5 if user rated
    feedback?: string; // Qualitative feedback
    contextInfo?: {
      currentPage?: string;
      recommendationRank?: number;
      recommendationScore?: number;
    };
  };
  modelVersion: string; // Which model version made this recommendation
  abTestGroup?: string; // A/B test group if applicable
}

interface ConversionEvent {
  userId: number;
  courseId: number;
  eventType: 'enroll' | 'start' | 'complete' | 'rate_high';
  timestamp: Date;
  daysSinceRecommendation: number;
  monthsAfterEnrollment?: number; // If completion/high rating
  recommendationScore: number;
  mlScoreFactors: {
    relevance: number;
    difficultyMatch: number;
    performancePotential: number;
    engagementFactor: number;
    popularityProof: number;
  };
}

/**
 * Feedback Logger Service
 * 
 * Captures all user interactions with recommendations
 * Used for model training, evaluation, and analytics
 */
class FeedbackLoggerService {
  private db: any; // Database connection

  /**
   * Log a feedback event
   * 
   * Triggered by:
   * - User views recommendation card
   * - User hovers over course
   * - User clicks "See Details"
   * - User clicks "Enroll"
   * - User dismisses recommendation
   */
  async logFeedbackEvent(event: FeedbackEvent): Promise<void> {
    // Insert into recommendation_feedback_log table
    const query = `
      INSERT INTO recommendation_feedback_log (
        id, user_id, course_id, recommendation_id, timestamp,
        event_type, metadata, model_version, ab_test_group
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.execute(query, [
      event.id,
      event.userId,
      event.courseId,
      event.recommendationId,
      event.timestamp,
      event.eventType,
      JSON.stringify(event.metadata),
      event.modelVersion,
      event.abTestGroup || null,
    ]);
  }

  /**
   * Log conversion events (important actions)
   * 
   * Tracked conversions:
   * - Enrollment within 7 days of recommendation
   * - Course start within 14 days
   * - Course completion
   * - High rating (4-5 stars)
   */
  async logConversionEvent(event: ConversionEvent): Promise<void> {
    const query = `
      INSERT INTO recommendation_conversion_log (
        user_id, course_id, event_type, timestamp,
        days_since_recommendation, months_after_enrollment,
        recommendation_score, ml_score_factors
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.execute(query, [
      event.userId,
      event.courseId,
      event.eventType,
      event.timestamp,
      event.daysSinceRecommendation,
      event.monthsAfterEnrollment || null,
      event.recommendationScore,
      JSON.stringify(event.mlScoreFactors),
    ]);
  }

  /**
   * Calculate success metrics for recommendations
   * 
   * Metrics:
   * - CTR: Click-through rate (% who clicked / shown)
   * - Enrollment rate: % who enrolled within 7 days
   * - Completion rate: % who completed course
   * - High satisfaction: % who rated 4+ stars
   */
  async getRecommendationMetrics(
    startDate: Date,
    endDate: Date,
    modelVersion?: string
  ): Promise<RecommendationMetrics> {
    // Views (recommendations shown)
    const viewsQuery = `
      SELECT COUNT(DISTINCT recommendation_id) as total_views
      FROM recommendation_feedback_log
      WHERE timestamp BETWEEN ? AND ?
        AND event_type = 'view'
        ${modelVersion ? 'AND model_version = ?' : ''}
    `;

    // Clicks (engagement)
    const clicksQuery = `
      SELECT COUNT(DISTINCT recommendation_id) as total_clicks
      FROM recommendation_feedback_log
      WHERE timestamp BETWEEN ? AND ?
        AND event_type IN ('engage', 'view') -- View implies at least saw it
        AND metadata->'$.timeSpentMs' > 1000 -- Viewed for >1 second
        ${modelVersion ? 'AND model_version = ?' : ''}
    `;

    // Enrollments
    const enrollmentsQuery = `
      SELECT COUNT(*) as total_enrollments
      FROM recommendation_conversion_log
      WHERE timestamp BETWEEN ? AND ?
        AND event_type = 'enroll'
        AND days_since_recommendation <= 7
    `;

    // Completions
    const completionsQuery = `
      SELECT COUNT(*) as total_completions
      FROM recommendation_conversion_log
      WHERE timestamp BETWEEN ? AND ?
        AND event_type = 'complete'
    `;

    // High satisfaction (4-5 stars)
    const satisfactionQuery = `
      SELECT 
        COUNT(*) as total_ratings,
        SUM(CASE WHEN metadata->'$.rating' >= 4 THEN 1 ELSE 0 END) as high_satisfaction
      FROM recommendation_feedback_log
      WHERE timestamp BETWEEN ? AND ?
        AND event_type = 'rate'
    `;

    const views = await this.db.query(viewsQuery, [startDate, endDate, ...(modelVersion ? [modelVersion] : [])]);
    const clicks = await this.db.query(clicksQuery, [startDate, endDate, ...(modelVersion ? [modelVersion] : [])]);
    const enrollments = await this.db.query(enrollmentsQuery, [startDate, endDate]);
    const completions = await this.db.query(completionsQuery, [startDate, endDate]);
    const satisfaction = await this.db.query(satisfactionQuery, [startDate, endDate]);

    const viewCount = views[0].total_views || 0;
    const clickCount = clicks[0].total_clicks || 0;
    const enrollmentCount = enrollments[0].total_enrollments || 0;
    const completionCount = completions[0].total_completions || 0;
    const satisfactionCount = satisfaction[0].high_satisfaction || 0;
    const ratingCount = satisfaction[0].total_ratings || 0;

    return {
      periodStart: startDate,
      periodEnd: endDate,
      modelVersion: modelVersion || 'all',
      metrics: {
        impressions: viewCount,
        clicks: clickCount,
        ctr: viewCount > 0 ? (clickCount / viewCount) : 0,
        enrollments: enrollmentCount,
        enrollmentRate: viewCount > 0 ? (enrollmentCount / viewCount) : 0,
        completions: completionCount,
        completionRate: enrollmentCount > 0 ? (completionCount / enrollmentCount) : 0,
        highSatisfactionRate: ratingCount > 0 ? (satisfactionCount / ratingCount) : 0,
      },
    };
  }

  /**
   * Get feature importance scores
   * 
   * Analyze which ML factors correlate most with conversions
   * Used to weight factors in next model iteration
   */
  async getFeatureImportance(): Promise<FeatureImportance> {
    const query = `
      SELECT
        AVG(
          CASE WHEN event_type = 'complete' THEN
            JSON_EXTRACT(ml_score_factors, '$.relevance')
          END
        ) as relevance_in_completions,
        AVG(
          CASE WHEN event_type = 'complete' THEN
            JSON_EXTRACT(ml_score_factors, '$.difficultyMatch')
          END
        ) as difficultyMatch_in_completions,
        AVG(
          CASE WHEN event_type = 'complete' THEN
            JSON_EXTRACT(ml_score_factors, '$.performancePotential')
          END
        ) as performancePotential_in_completions,
        AVG(
          CASE WHEN event_type = 'complete' THEN
            JSON_EXTRACT(ml_score_factors, '$.engagementFactor')
          END
        ) as engagementFactor_in_completions,
        AVG(
          CASE WHEN event_type = 'complete' THEN
            JSON_EXTRACT(ml_score_factors, '$.popularityProof')
          END
        ) as popularityProof_in_completions,
        CORR(recommendation_score, 
          CASE WHEN event_type = 'complete' THEN 1 ELSE 0 END
        ) as score_completion_correlation
      FROM recommendation_conversion_log
      WHERE timestamp > DATE_SUB(NOW(), INTERVAL 3 MONTH)
    `;

    const result = await this.db.query(query);
    return result[0];
  }
}

// ============================================================================
// PART 2: A/B TESTING FRAMEWORK
// ============================================================================

/**
 * A/B Test Configuration
 * 
 * Setup A/B tests to compare model versions
 */
interface ABTestConfig {
  testId: string;
  name: string;
  description: string;
  
  // Control group: existing rule-based system
  control: {
    version: 'rule-based';
    trafficAllocation: number; // 0-100%
  };

  // Treatment groups: new ML variants
  treatments: Array<{
    version: string; // 'ml-v1', 'ml-v2', 'hybrid-v1', etc
    trafficAllocation: number;
    scoringWeights?: {
      relevance: number;
      difficultyMatch: number;
      performancePotential: number;
      engagementFactor: number;
      popularityProof: number;
    };
  }>;

  // Test configuration
  startDate: Date;
  endDate: Date;
  targetSampleSize: number; // Min users per group
  primaryMetric: 'ctr' | 'enrollmentRate' | 'completionRate' | 'satisfaction';
  significanceLevel: number; // 0.05 for 95% confidence
}

/**
 * A/B Testing Service
 */
class ABTestingService {
  private db: any;

  /**
   * Assign user to test group
   * 
   * Uses consistent hashing to ensure same user always gets same group
   */
  assignUserToGroup(
    userId: number,
    testId: string,
    config: ABTestConfig
  ): string {
    // Consistent hash: userId + testId
    const hash = this.consistentHash(`${userId}-${testId}`);
    let cumulativeAllocation = 0;

    // Control group
    cumulativeAllocation += config.control.trafficAllocation;
    if (hash % 100 < cumulativeAllocation) {
      return 'control';
    }

    // Treatment groups
    for (const treatment of config.treatments) {
      cumulativeAllocation += treatment.trafficAllocation;
      if (hash % 100 < cumulativeAllocation) {
        return treatment.version;
      }
    }

    return 'control'; // Fallback
  }

  /**
   * Simple consistent hashing
   */
  private consistentHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Calculate statistical significance using Chi-Square test
   * 
   * Tests if difference between groups is statistically significant
   */
  calculateSignificance(
    testId: string,
    config: ABTestConfig,
    currentResults?: Record<string, number> // Optional: provided results instead of querying
  ): StatisticalResult {
    // Query results for each group
    const query = `
      SELECT
        ab_test_group,
        COUNT(*) as total_shown,
        SUM(CASE WHEN event_type IN ('engage', 'enroll') THEN 1 ELSE 0 END) as conversions
      FROM recommendation_feedback_log rfl
      JOIN ab_test_assignments ata ON rfl.user_id = ata.user_id AND rfl.user_id = ata.user_id
      WHERE rfl.timestamp BETWEEN ? AND ?
        AND ata.test_id = ?
      GROUP BY ab_test_group
    `;

    // Chi-square calculation (implementation simplified here)
    // In production, use proper statistical library

    return {
      testId,
      primaryMetric: config.primaryMetric,
      winner: null, // To be determined
      pValue: 0,
      isSignificant: false,
    };
  }

  /**
   * Generate A/B test report
   */
  async generateReport(testId: string): Promise<ABTestReport> {
    const query = `
      SELECT
        ab_test_group as group_name,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) as total_events,
        SUM(CASE WHEN event_type IN ('engage', 'enroll') THEN 1 ELSE 0 END) as conversions,
        ROUND(
          SUM(CASE WHEN event_type IN ('engage', 'enroll') THEN 1 ELSE 0 END) / 
          COUNT(*) * 100, 2
        ) as conversion_rate_pct,
        AVG(recommendation_score) as avg_score,
        AVG(CASE WHEN metadata->'$.timeSpentMs' THEN 
          JSON_EXTRACT(metadata, '$.timeSpentMs') 
        END) as avg_engagement_ms
      FROM recommendation_feedback_log rfl
      JOIN ab_test_assignments ata ON rfl.user_id = ata.user_id
      WHERE ata.test_id = ?
      GROUP BY ab_test_group
      ORDER BY conversion_rate_pct DESC
    `;

    const results = await this.db.query(query, [testId]);

    return {
      testId,
      timestamp: new Date(),
      groupResults: results,
      recommendation: this.getRecommendation(results),
    };
  }

  /**
   * Determine test winner based on metrics
   */
  private getRecommendation(results: any[]): string {
    if (!results || results.length === 0) {
      return 'Insufficient data for recommendation';
    }

    const best = results[0];
    const worst = results[results.length - 1];

    const improvement = (
      (best.conversion_rate_pct - worst.conversion_rate_pct) /
      worst.conversion_rate_pct * 100
    );

    if (improvement > 5) {
      return `${best.group_name} significantly outperforms (${improvement.toFixed(1)}% improvement)`;
    } else if (improvement > 0) {
      return `${best.group_name} slightly outperforms (${improvement.toFixed(1)}% improvement)`;
    } else {
      return 'No significant difference between groups';
    }
  }
}

// ============================================================================
// PART 3: CONTINUOUS IMPROVEMENT PIPELINE
// ============================================================================

/**
 * Model Update Pipeline
 * 
 * Automated process to:
 * 1. Collect feedback
 * 2. Train new model
 * 3. A/B test against current
 * 4. Deploy if winner
 */
class ModelUpdatePipeline {
  private db: any;
  private feedbackLogger: FeedbackLoggerService;
  private abTester: ABTestingService;

  constructor(db: any) {
    this.db = db;
    this.feedbackLogger = new FeedbackLoggerService();
    this.abTester = new ABTestingService();
  }

  /**
   * Weekly model retraining job
   * 
   * Runs every Sunday 2 AM
   */
  async weeklyRetraining(): Promise<void> {
    console.log('[Pipeline] Starting weekly retraining...');

    // Step 1: Collect feedback from last 30 days
    const feedbackData = await this.collectFeedbackData(30);
    console.log(`[Pipeline] Collected ${feedbackData.length} feedback events`);

    // Step 2: Analyze feature importance
    const featureImportance = await this.feedbackLogger.getFeatureImportance();
    console.log('[Pipeline] Feature importance:', featureImportance);

    // Step 3: Propose new weights
    const newWeights = this.optimizeWeights(featureImportance);
    console.log('[Pipeline] Proposed new weights:', newWeights);

    // Step 4: Create A/B test for new model
    const testConfig = this.createTestConfig(newWeights);
    await this.setupABTest(testConfig);
    console.log('[Pipeline] A/B test created:', testConfig.testId);

    // Step 5: Monitor test progress
    // Run for 2 weeks before evaluating
  }

  /**
   * Bi-weekly A/B test evaluation
   * 
   * Runs every other Friday
   */
  async evaluateActiveTests(): Promise<void> {
    console.log('[Pipeline] Evaluating active tests...');

    // Get all active tests
    const activeTests = await this.db.query(
      `SELECT * FROM ab_tests WHERE status = 'active' AND end_date <= NOW()`
    );

    for (const test of activeTests) {
      // Get test results
      const report = await this.abTester.generateReport(test.id);
      console.log('[Pipeline] Test report:', report);

      // Check statistical significance
      const significance = this.calculateSignificance(report);

      if (significance.isSignificant && report.groupResults[0].group_name !== 'control') {
        // Winner found - deploy new model version
        console.log('[Pipeline] Winner found! Deploying new version...');
        await this.deployNewVersion(test, report);
      } else {
        console.log('[Pipeline] No significant winner. Continuing test...');
      }
    }
  }

  /**
   * Optimize weights based on feature importance
   */
  private optimizeWeights(importance: FeatureImportance): ScoringWeights {
    // Normalize importance scores
    const values = [
      importance.relevance_in_completions,
      importance.difficultyMatch_in_completions,
      importance.performancePotential_in_completions,
      importance.engagementFactor_in_completions,
      importance.popularityProof_in_completions,
    ];

    const sum = values.reduce((a, b) => a + b, 0);

    return {
      relevance: values[0] / sum,
      difficultyMatch: values[1] / sum,
      performancePotential: values[2] / sum,
      engagementFactor: values[3] / sum,
      popularityProof: values[4] / sum,
    };
  }

  /**
   * Deploy new model version to production
   */
  private async deployNewVersion(test: any, report: ABTestReport): Promise<void> {
    const winnerVersion = report.groupResults[0].group_name;

    // Update active model version
    const query = `
      UPDATE ml_model_versions
      SET is_active = 1, deployed_at = NOW()
      WHERE version = ?
    `;

    await this.db.execute(query, [winnerVersion]);

    // Log deployment
    await this.db.execute(
      `INSERT INTO model_deployments (version, test_id, performance_improvement, deployed_at)
       VALUES (?, ?, ?, NOW())`,
      [
        winnerVersion,
        test.id,
        report.groupResults[0].conversion_rate_pct - report.groupResults[1].conversion_rate_pct,
      ]
    );

    console.log(`[Pipeline] ✅ Deployed ${winnerVersion}`);
  }

  private async collectFeedbackData(days: number): Promise<any[]> {
    // TODO: Query feedback logs from last N days
    return [];
  }

  private createTestConfig(weights: ScoringWeights): ABTestConfig {
    // TODO: Create A/B test configuration
    throw new Error('Not implemented');
  }

  private async setupABTest(config: ABTestConfig): Promise<void> {
    // TODO: Create A/B test in database
  }

  private calculateSignificance(report: ABTestReport): any {
    // TODO: Calculate statistical significance
    return {};
  }
}

// ============================================================================
// PART 4: INTERFACES
// ============================================================================

interface RecommendationMetrics {
  periodStart: Date;
  periodEnd: Date;
  modelVersion: string;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number; // Click-through rate
    enrollments: number;
    enrollmentRate: number;
    completions: number;
    completionRate: number;
    highSatisfactionRate: number;
  };
}

interface FeatureImportance {
  relevance_in_completions: number;
  difficultyMatch_in_completions: number;
  performancePotential_in_completions: number;
  engagementFactor_in_completions: number;
  popularityProof_in_completions: number;
}

interface ScoringWeights {
  relevance: number;
  difficultyMatch: number;
  performancePotential: number;
  engagementFactor: number;
  popularityProof: number;
}

interface StatisticalResult {
  testId: string;
  primaryMetric: string;
  winner: string | null;
  pValue: number;
  isSignificant: boolean;
}

interface ABTestReport {
  testId: string;
  timestamp: Date;
  groupResults: Array<{
    group_name: string;
    unique_users: number;
    total_events: number;
    conversions: number;
    conversion_rate_pct: number;
    avg_score: number;
    avg_engagement_ms: number;
  }>;
  recommendation: string;
}

export {
  FeedbackLoggerService,
  ABTestingService,
  ModelUpdatePipeline,
  FeedbackEvent,
  ConversionEvent,
  ABTestConfig,
  RecommendationMetrics,
  FeatureImportance,
  ScoringWeights,
  StatisticalResult,
  ABTestReport,
};

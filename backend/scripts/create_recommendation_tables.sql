-- ============================================
-- Recommendation System Database Schema
-- File: backend/scripts/create_recommendation_tables.sql
-- ============================================

-- 1. User Segments Table
CREATE TABLE IF NOT EXISTS user_segments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  segment_type VARCHAR(50) NOT NULL,
  weights JSON,
  confidence_score DECIMAL(5, 2) DEFAULT 100,
  assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_segment_type (segment_type),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  learning_format VARCHAR(50),
  preferred_categories JSON,
  preferred_instructors JSON,
  daily_learning_hours INT DEFAULT 1,
  active_hours VARCHAR(100),
  max_budget_per_course DECIMAL(10, 2),
  goals JSON,
  preferred_language VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Recommendation History Table (Main analytics table)
CREATE TABLE IF NOT EXISTS recommendation_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  recommendation_score DECIMAL(6, 2) NOT NULL,
  component_scores JSON,  -- { relevance, difficulty, performance, engagement, progression, popularity, freshness }
  segment_type VARCHAR(50),
  reason TEXT,
  recommended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP NULL,
  enrolled BOOLEAN DEFAULT FALSE,
  enrolled_at TIMESTAMP NULL,
  rating INT NULL,  -- User rating (1-5)
  feedback TEXT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, recommended_at),
  INDEX idx_course_date (course_id, recommended_at),
  INDEX idx_recommendation_score (recommendation_score DESC),
  INDEX idx_clicked (clicked),
  INDEX idx_enrolled (enrolled),
  INDEX idx_segment_type (segment_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Learning Paths Table (Personalized learning sequences)
CREATE TABLE IF NOT EXISTS learning_paths (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  path_name VARCHAR(255),
  courses_sequence JSON,  -- Array of course IDs in order
  current_position INT DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  estimated_completion_date DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_active (user_id, completion_rate),
  INDEX idx_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. User Skills Table (Track mastery levels)
CREATE TABLE IF NOT EXISTS user_skills (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  skill_id INT,
  skill_name VARCHAR(100) NOT NULL,
  proficiency_level VARCHAR(50) NOT NULL,  -- beginner, learning, proficient, mastered
  mastery_percentage INT DEFAULT 0,  -- 0-100
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_skill (user_id, skill_id),
  INDEX idx_user_skill (user_id, skill_name),
  INDEX idx_proficiency (proficiency_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Course Tags Table (For filtering)
CREATE TABLE IF NOT EXISTS course_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  tag_name VARCHAR(100) NOT NULL,
  tag_category VARCHAR(50),  -- difficulty, format, goal, skill, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_tag (tag_name),
  INDEX idx_course_tags (course_id, tag_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Recommendation Rules Configuration Table
CREATE TABLE IF NOT EXISTS recommendation_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rule_name VARCHAR(100) NOT NULL UNIQUE,
  rule_type VARCHAR(50) NOT NULL,  -- level-based, goal-based, behavior-based, performance-based, preference-based
  rule_logic JSON NOT NULL,  -- JSON representation of rule conditions
  applies_to_segments JSON,  -- Array of segment types this rule applies to
  active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 0,  -- Higher priority rules evaluated first
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  updated_by INT,
  UNIQUE KEY unique_rule_name (rule_name),
  INDEX idx_rule_type (rule_type),
  INDEX idx_active (active),
  INDEX idx_priority (priority DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Recommendation Logs Table (For debugging and analytics)
CREATE TABLE IF NOT EXISTS recommendation_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  segment_type VARCHAR(50),
  input_data JSON,  -- User profile, history, preferences
  output_recommendations JSON,  -- Generated recommendations
  rules_applied JSON,  -- Which rules were applied
  scores_breakdown JSON,  -- Detailed scores for analysis
  execution_time_ms INT,  -- Performance metric
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, generated_at),
  INDEX idx_execution_time (execution_time_ms),
  INDEX idx_segment_type (segment_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Recommendation Feedback Log (Track user interactions)
CREATE TABLE IF NOT EXISTS recommendation_feedback_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  action VARCHAR(50),  -- clicked, enrolled, rated, dismissed, etc.
  rating INT NULL,  -- 1-5 stars
  feedback TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_user_action (user_id, action),
  INDEX idx_course_feedback (course_id),
  INDEX idx_created_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. A/B Testing Recommendations Table
CREATE TABLE IF NOT EXISTS ab_test_recommendations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  test_id VARCHAR(100) NOT NULL,
  variant VARCHAR(50),  -- A, B, control, etc.
  recommended_courses JSON,
  metrics JSON,  -- click_rate, conversion_rate, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_test_variant (test_id, variant),
  INDEX idx_user_test (user_id, test_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ALTER EXISTING TABLES
-- ============================================

-- Extend courses table with recommendation-related fields
ALTER TABLE courses ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(50) DEFAULT 'beginner';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS skill_tags JSON;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS career_relevance JSON;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites JSON;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_count INT DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3, 2) DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS format VARCHAR(50) DEFAULT 'mixed';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS duration_hours INT DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'English';

-- Add indexes for better query performance
ALTER TABLE courses ADD INDEX IF NOT EXISTS idx_difficulty (difficulty_level);
ALTER TABLE courses ADD INDEX IF NOT EXISTS idx_language (language);
ALTER TABLE courses ADD INDEX IF NOT EXISTS idx_trending (is_trending);
ALTER TABLE courses ADD INDEX IF NOT EXISTS idx_rating (average_rating DESC);

-- ============================================
-- INSERT DEFAULT RECOMMENDATION RULES
-- ============================================

-- Level-Based Rules
INSERT INTO recommendation_rules (rule_name, rule_type, rule_logic, applies_to_segments, active, priority) VALUES
('Allow Current Level', 'level-based', 
 '{"condition": "difficulty == user_level"}',
 '["newbie", "career-changer", "quick-learner", "hobby-learner", "skill-enhancer"]',
 TRUE, 100),

('Allow Level +1 for Progression', 'level-based',
 '{"condition": "difficulty == user_level + 1 AND completion_rate > 0.7"}',
 '["skill-enhancer", "quick-learner"]',
 TRUE, 90),

('Prevent Advanced Jump', 'level-based',
 '{"condition": "difficulty > user_level + 2", "action": "reject"}',
 '["newbie", "hobby-learner"]',
 TRUE, 95);

-- Goal-Based Rules
INSERT INTO recommendation_rules (rule_name, rule_type, rule_logic, applies_to_segments, active, priority) VALUES
('Career Change Relevance', 'goal-based',
 '{"min_goal_alignment": 0.6}',
 '["career-changer"]',
 TRUE, 85),

('Skill Enhancement Focus', 'goal-based',
 '{"prioritize": "advanced_topics", "min_relevance": 0.7}',
 '["skill-enhancer"]',
 TRUE, 85);

-- Performance-Based Rules
INSERT INTO recommendation_rules (rule_name, rule_type, rule_logic, applies_to_segments, active, priority) VALUES
('Check Prerequisites', 'performance-based',
 '{"enforce_prerequisites": true}',
 '["newbie", "career-changer", "skill-enhancer"]',
 TRUE, 100),

('Low Score Review', 'performance-based',
 '{"condition": "avg_quiz_score < 50", "recommend": "review_courses"}',
 '["newbie", "hobby-learner"]',
 TRUE, 80);

-- Behavior-Based Rules
INSERT INTO recommendation_rules (rule_name, rule_type, rule_logic, applies_to_segments, active, priority) VALUES
('Quick Learner Shortcut', 'behavior-based',
 '{"max_course_duration": 30, "skip_prerequisites_allowed": true}',
 '["quick-learner"]',
 TRUE, 80),

('Low Completion Support', 'behavior-based',
 '{"condition": "completion_rate < 0.3", "recommend": "shorter_courses_with_support"}',
 '["hobby-learner", "newbie"]',
 TRUE, 75);

-- ============================================
-- VIEW: Recommendation Effectiveness Summary
-- ============================================

CREATE OR REPLACE VIEW recommendation_effectiveness AS
SELECT 
  us.segment_type,
  COUNT(rh.id) as total_recommendations,
  SUM(CASE WHEN rh.clicked = TRUE THEN 1 ELSE 0 END) as clicks,
  SUM(CASE WHEN rh.enrolled = TRUE THEN 1 ELSE 0 END) as enrollments,
  ROUND(SUM(CASE WHEN rh.clicked = TRUE THEN 1 ELSE 0 END) / COUNT(rh.id) * 100, 2) as ctr_percentage,
  ROUND(SUM(CASE WHEN rh.enrolled = TRUE THEN 1 ELSE 0 END) / COUNT(rh.id) * 100, 2) as conversion_rate,
  AVG(rh.recommendation_score) as avg_recommendation_score,
  AVG(rh.rating) as avg_user_rating,
  COUNT(DISTINCT rh.user_id) as unique_users,
  DATE(rh.recommended_at) as date
FROM recommendation_history rh
LEFT JOIN user_segments us ON rh.user_id = us.user_id
WHERE rh.recommended_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY us.segment_type, DATE(rh.recommended_at)
ORDER BY date DESC, us.segment_type;

-- ============================================
-- SUMMARY
-- ============================================
-- Tables created:
-- 1. user_segments - Track user classification
-- 2. user_preferences - Store user learning preferences
-- 3. recommendation_history - Core analytics table
-- 4. learning_paths - Personalized course sequences
-- 5. user_skills - Skill mastery tracking
-- 6. course_tags - Course tagging system
-- 7. recommendation_rules - Rule engine configuration
-- 8. recommendation_logs - System debugging
-- 9. recommendation_feedback_log - User interaction tracking
-- 10. ab_test_recommendations - A/B testing framework
--
-- Extended courses table with recommendation fields
-- Created default rules for MVP phase
-- Created effectiveness view for dashboards

/**
 * RecommendationCard Component
 * File: frontend/src/components/RecommendationCard.tsx
 * 
 * Display a single recommended course with detailed scoring information.
 */

import React, { useState } from 'react';
import { useAppDispatch } from '../app/store';
import { logFeedback } from '../features/recommendationSlice';
import type { RecommendedCourse } from '../services/recommendationService';
import '../styles/recommendationCard.css';

interface RecommendationCardProps {
  course: RecommendedCourse;
  rank?: number;
  onCourseClick?: (courseId: number) => void;
}

export default function RecommendationCard({ course, rank, onCourseClick }: RecommendationCardProps) {
  const dispatch = useAppDispatch();
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [hoverScoreType, setHoverScoreType] = useState<string | null>(null);

  const handleCourseClick = async () => {
    // Log click feedback
    await dispatch(logFeedback({
      courseId: course.courseId,
      action: 'clicked'
    }));

    if (onCourseClick) {
      onCourseClick(course.courseId);
    }
  };

  const handleEnrollClick = async () => {
    await dispatch(logFeedback({
      courseId: course.courseId,
      action: 'enrolled'
    }));
    // Navigate to course learning page
    window.location.href = `/course/${course.courseId}`;
  };

  const handleDismiss = async () => {
    await dispatch(logFeedback({
      courseId: course.courseId,
      action: 'dismissed'
    }));
    setFeedbackSent(true);
  };

  const scoreFactors = [
    { name: 'Relevance', value: course.scoreBreakdown?.relevance || 0, icon: '🎯' },
    { name: 'Difficulty', value: course.scoreBreakdown?.difficulty || 0, icon: '📈' },
    { name: 'Performance', value: course.scoreBreakdown?.performance || 0, icon: '⚡' },
    { name: 'Engagement', value: course.scoreBreakdown?.engagement || 0, icon: '👥' },
    { name: 'Progression', value: course.scoreBreakdown?.progression || 0, icon: '📊' },
    { name: 'Popularity', value: course.scoreBreakdown?.popularity || 0, icon: '⭐' },
    { name: 'Freshness', value: course.scoreBreakdown?.freshness || 0, icon: '✨' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return '#4CAF50';
    if (score >= 7.5) return '#8BC34A';
    if (score >= 6.5) return '#FFC107';
    if (score >= 5) return '#FF9800';
    return '#F44336';
  };

  if (feedbackSent) {
    return (
      <div className="recommendation-card dismissed">
        <div className="dismissed-message">
          ✓ Đã xóa khỏi danh sách đề xuất
        </div>
      </div>
    );
  }

  return (
    <div className="recommendation-card">
      {rank && (
        <div className="rank-badge">
          #{rank}
        </div>
      )}

      {/* Main Content */}
      <div className="card-content">
        {/* Header */}
        <div className="card-header">
          <div className="course-info">
            <h3 className="course-title" onClick={handleCourseClick} style={{ cursor: 'pointer' }}>
              {course.courseTitle}
            </h3>
            <p className="course-description">{course.courseDescription}</p>
          </div>
          <div className="main-score">
            <div 
              className="score-circle"
              style={{ borderColor: getScoreColor((course.recommendationScore || 0) / 10) }}
            >
              <span className="score-value">{Math.round(course.recommendationScore || 0)}</span>
              <span className="score-label">/ 100</span>
            </div>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="metadata-row">
          <div className="meta-item">
            <span className="meta-label">Độ Khó:</span>
            <span 
              className="meta-value difficulty"
              style={{ color: getDifficultyColor(course.difficulty) }}
            >
              {course.difficulty}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Thời Lượng:</span>
            <span className="meta-value">{course.duration} giờ</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Giá:</span>
            <span className="meta-value">{course.price.toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Đánh Giá:</span>
            <span className="meta-value">⭐ {course.rating}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Học Viên:</span>
            <span className="meta-value">{course.enrollmentCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Recommendation Reason */}
        <div className="reason-section">
          <p className="reason-label">💡 Lý Do Đề Xuất:</p>
          <p className="reason-text">
            {course.reason || (course.reasons && course.reasons.length > 0 ? course.reasons.join(', ') : "Khóa học này phù hợp với mục tiêu và cấp độ hiện tại của bạn.")}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="score-breakdown">
          <div className="breakdown-header">
            <p className="breakdown-title">Chi Tiết Điểm Số</p>
            <p className="breakdown-hint">Hover để xem chi tiết</p>
          </div>
          <div className="score-bars">
            {scoreFactors.map((factor) => (
              <div 
                key={factor.name}
                className="score-bar-item"
                onMouseEnter={() => setHoverScoreType(factor.name)}
                onMouseLeave={() => setHoverScoreType(null)}
              >
                <div className="bar-label">
                  <span className="bar-icon">{factor.icon}</span>
                  <span className="bar-name">{factor.name}</span>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{
                      width: `${Math.min(factor.value, 100)}%`,
                      backgroundColor: getScoreColor(factor.value / 10),
                      opacity: hoverScoreType === factor.name ? 1 : 0.7
                    }}
                  />
                </div>
                <span className="bar-value">{factor.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-actions">
          <button 
            className="btn btn-primary"
            onClick={handleEnrollClick}
          >
            🎓 Xem Khóa Học
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleCourseClick}
          >
            📖 Xem Chi Tiết
          </button>
          <button 
            className="btn btn-dismiss"
            onClick={handleDismiss}
          >
            ✕ Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

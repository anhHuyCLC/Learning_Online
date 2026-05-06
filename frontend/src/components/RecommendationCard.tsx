
import { useState } from 'react';
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
    window.location.href = `/course/${course.courseId}`;
  };

  const handleDismiss = async () => {
    await dispatch(logFeedback({
      courseId: course.courseId,
      action: 'dismissed'
    }));
    setFeedbackSent(true);
  };

  let safeBreakdown: any = {};
  const rawScores = course.scoreBreakdown || (course as any).mlScoreFactors || (course as any).ml_score_factors || (course as any).component_scores || (course as any).componentScores || {};

  try {
    let parsedScores = typeof rawScores === 'string' ? JSON.parse(rawScores) : rawScores;
    if (typeof parsedScores === 'string') {
      parsedScores = JSON.parse(parsedScores);
    }
    
    if (Array.isArray(parsedScores)) {
      parsedScores.forEach((item: any) => {
        const key = item.name || item.key || item.factor || item.metric;
        const val = item.value !== undefined ? item.value : item.score;
        if (key) safeBreakdown[key.toLowerCase()] = val;
      });
    } else {
      safeBreakdown = parsedScores || {};
    }
  } catch (error) {
    console.error("Failed to parse score breakdown:", error);
  }
  const parseScore = (val: any) => {
    if (val === undefined || val === null) return 0;
    const num = Number(val);
    if (isNaN(num)) return 0;
    if (num > 0 && num <= 1) return Math.round(num * 100);
    return Math.round(num);
  };

  const getValue = (keys: string[]) => {
    const sources = [safeBreakdown, course as any];
    for (const source of sources) {
      if (!source) continue;
      for (const key of keys) {
        if (source[key] !== undefined) return source[key];
        const lowerKey = key.toLowerCase();
        if (source[lowerKey] !== undefined) return source[lowerKey];
        const titleKey = lowerKey.charAt(0).toUpperCase() + lowerKey.slice(1);
        if (source[titleKey] !== undefined) return source[titleKey];
      }
    }
    return undefined;
  };

  const scoreFactors = [
    { name: 'Relevance', value: parseScore(getValue(['relevance'])), icon: '🎯' },
    { name: 'Difficulty', value: parseScore(getValue(['difficulty', 'difficultyMatch'])), icon: '📈' },
    { name: 'Performance', value: parseScore(getValue(['performance', 'performancePotential'])), icon: '⚡' },
    { name: 'Engagement', value: parseScore(getValue(['engagement', 'engagementFactor'])), icon: '👥' },
    { name: 'Progression', value: parseScore(getValue(['progression'])), icon: '📊' },
    { name: 'Popularity', value: parseScore(getValue(['popularity', 'popularityProof'])), icon: '⭐' },
    { name: 'Freshness', value: parseScore(getValue(['freshness'])), icon: '✨' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return '#2196F3';
    switch (difficulty.toLowerCase()) {
      case 'beginner':
      case 'cơ bản':
        return '#4CAF50';
      case 'intermediate':
      case 'trung bình':
        return '#FF9800';
      case 'advanced':
      case 'nâng cao':
        return '#F44336';
      default:
        return '#2196F3';
    }
  };

  const getScoreColor = (score: number) => {
    const normalizedScore = score <= 10 ? score * 10 : score;

    if (normalizedScore >= 85) return '#4CAF50';
    if (normalizedScore >= 70) return '#8BC34A';
    if (normalizedScore >= 50) return '#FFC107';
    if (normalizedScore >= 35) return '#FF9800';
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
    <div className="recommendation-card" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '20px', position: 'relative', background: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      {rank && (
        <div className="rank-badge" style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#6366f1', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
          #{rank}
        </div>
      )}

      {/* Main Content */}
      <div className="card-content">
        {/* Header */}
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div className="course-info" style={{ flex: 1 }}>
            <h3 className="course-title" onClick={handleCourseClick} style={{ cursor: 'pointer', color: '#1e40af', fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase' }}>
              {course.courseTitle || "Khóa Học Không Tên"}
            </h3>
            <p className="course-description" style={{ color: '#64748b', fontSize: '0.875rem', margin: 0, textTransform: 'uppercase' }}>
              {(course as any).category || course.courseDescription || "Danh Mục"}
            </p>
          </div>
          <div className="main-score" style={{ marginLeft: '16px' }}>
            <div
              className="score-circle"
              style={{
                border: `3px solid ${getScoreColor(course.recommendationScore || 0)}`,
                width: '60px', height: '60px', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <span className="score-value" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1f2937', lineHeight: '1' }}>
                {Math.round(course.recommendationScore || 0)}
              </span>
              <span className="score-label" style={{ fontSize: '0.65rem', color: '#6b7280' }}>/ 100</span>
            </div>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="metadata-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
          <div className="meta-item" style={{ fontSize: '0.875rem' }}>
            <span className="meta-label" style={{ color: '#64748b', marginRight: '4px' }}>Độ Khó:</span>
            <span
              className="meta-value difficulty"
              style={{ color: getDifficultyColor(course.difficulty || 'beginner'), background: '#eef2ff', padding: '2px 8px', borderRadius: '4px', fontWeight: '500' }}
            >
              {course.difficulty || 'beginner'}
            </span>
          </div>
          <div className="meta-item" style={{ fontSize: '0.875rem' }}>
            <span className="meta-label" style={{ color: '#64748b', marginRight: '4px' }}>Thời Lượng:</span>
            <span className="meta-value font-medium">{course.duration || 0} Phút</span>
          </div>
          <div className="meta-item" style={{ fontSize: '0.875rem' }}>
            <span className="meta-label" style={{ color: '#64748b', marginRight: '4px' }}>Giá:</span>
            <span className="meta-value font-medium">{(course.price || 0).toLocaleString('vi-VN')} VNĐ</span>
          </div>
          <div className="meta-item" style={{ fontSize: '0.875rem' }}>
            <span className="meta-label" style={{ color: '#64748b', marginRight: '4px' }}>Đánh Giá:</span>
            <span className="meta-value font-medium text-yellow-500">⭐ {course.rating || "Chưa có đánh giá nào"}</span>
          </div>
          <div className="meta-item" style={{ fontSize: '0.875rem' }}>
            <span className="meta-label" style={{ color: '#64748b', marginRight: '4px' }}>Học Viên:</span>
            <span className="meta-value font-medium">{(course.enrollmentCount || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Recommendation Reason */}
        <div className="reason-section" style={{ borderLeft: '4px solid #10b981', paddingLeft: '12px', marginBottom: '24px' }}>
          <p className="reason-label" style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '4px' }}>💡 Lý Do Đề Xuất:</p>
          <p className="reason-text" style={{ color: '#4b5563', fontSize: '0.9rem', margin: 0 }}>
            {course.reason || (course.reasons && course.reasons.length > 0 ? course.reasons.join(', ') : "Khóa học này phù hợp với mục tiêu và cấp độ hiện tại của bạn.")}
          </p>
        </div>

        {/* Score Breakdown */}
        <div className="score-breakdown" style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <div className="breakdown-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <p className="breakdown-title" style={{ fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>Chi Tiết Điểm Số</p>
            <p className="breakdown-hint" style={{ color: '#94a3b8', fontSize: '0.75rem', margin: 0 }}>Thang 100 điểm</p>
          </div>

          <div className="score-bars" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {scoreFactors.map((factor) => {
              const safeValue = Math.min(Math.max(factor.value || 0, 0), 100);
              return (
                <div
                  key={factor.name}
                  className="score-bar-item"
                  onMouseEnter={() => setHoverScoreType(factor.name)}
                  onMouseLeave={() => setHoverScoreType(null)}
                >
                  <div className="bar-label" style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', fontSize: '0.8rem' }}>
                    <span className="bar-icon" style={{ marginRight: '4px' }}>{factor.icon}</span>
                    <span className="bar-name">{factor.name}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: getScoreColor(safeValue) }}>{safeValue}</span>
                  </div>
                  <div className="bar-container" style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', height: '6px' }}>
                    <div
                      className="bar-fill"
                      style={{
                        width: `${safeValue}%`,
                        backgroundColor: getScoreColor(safeValue),
                        height: '100%',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease-in-out',
                        opacity: hoverScoreType && hoverScoreType !== factor.name ? 0.3 : 1
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="card-actions" style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-primary"
            onClick={handleEnrollClick}
            style={{ flex: 2, background: '#3b82f6', color: 'white', padding: '10px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
          >
            🎓 Xem Khóa Học
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleCourseClick}
            style={{ flex: 2, background: 'white', color: '#3b82f6', border: '1px solid #3b82f6', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            📖 Xem Chi Tiết
          </button>
          <button
            className="btn btn-dismiss"
            onClick={handleDismiss}
            style={{ flex: 1, background: '#fef2f2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
          >
            ✕ Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
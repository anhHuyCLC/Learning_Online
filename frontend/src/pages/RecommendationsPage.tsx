import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/store';
import type { RootState } from '../app/store';
import {
  generateRecommendations,
  updateUserSegment,
  getAnalytics,
  clearRecommendations,
} from '../features/recommendationSlice';
import RecommendationCard from '../components/RecommendationCard';
import { Header } from '../components/Header';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import '../styles/recommendationsPage.css';

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [sortBy, setSortBy] = useState<'score' | 'relevance' | 'difficulty'>('score');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const user = useAppSelector((state: RootState) => state.auth.user);
  const {
    recommendations = [],
    userSegment = null,
    segmentWeights = null,
    analytics = null,
    isLoading = false,
    error = null,
    lastGeneratedAt = null,
  } = useAppSelector((state: RootState) => state.recommendations) || {};

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // 1. Load segment trước
  useEffect(() => {
    if (user) {
      dispatch(updateUserSegment());
    }
  }, [dispatch, user]);

  // 2. Khi có segment thì mới generate
  useEffect(() => {
    if (userSegment) {
      dispatch(generateRecommendations());
    }
  }, [dispatch, userSegment]);

  const sortedRecommendations = [...recommendations].sort((a, b) => {
    // Determine exact score field mapping depending on backend
    const scoreA = a.recommendationScore || (a as any).finalScore || 0;
    const scoreB = b.recommendationScore || (b as any).finalScore || 0;

    let breakdownA: any = {};
    let breakdownB: any = {};
    
    // Quét đúng tên cột từ Database
    const rawScoresA = a.scoreBreakdown || (a as any).mlScoreFactors || (a as any).ml_score_factors || (a as any).component_scores || (a as any).componentScores || {};
    const rawScoresB = b.scoreBreakdown || (b as any).mlScoreFactors || (b as any).ml_score_factors || (b as any).component_scores || (b as any).componentScores || {};

    try {
      let parsedA = typeof rawScoresA === 'string' ? JSON.parse(rawScoresA) : rawScoresA;
      if (typeof parsedA === 'string') parsedA = JSON.parse(parsedA);
      breakdownA = parsedA || {};

      let parsedB = typeof rawScoresB === 'string' ? JSON.parse(rawScoresB) : rawScoresB;
      if (typeof parsedB === 'string') parsedB = JSON.parse(parsedB);
      breakdownB = parsedB || {};
    } catch(e) {}

    switch (sortBy) {
      case 'score':
        return scoreB - scoreA;
      case 'relevance':
        // Hỗ trợ cả 2 chuẩn tên biến cũ và mới để sắp xếp
        const relA = breakdownA.relevance || breakdownA.Relevance || 0;
        const relB = breakdownB.relevance || breakdownB.Relevance || 0;
        return relB - relA;
      case 'difficulty':
        return (a.difficulty || '').localeCompare(b.difficulty || '');
      default:
        return 0;
    }
  });

  // Filter by difficulty safely
  const filteredRecommendations = filterDifficulty === 'all'
    ? sortedRecommendations
    : sortedRecommendations.filter(
      (course) => (course.difficulty || '').toLowerCase() === filterDifficulty.toLowerCase()
    );

  const handleRefresh = () => {
    dispatch(clearRecommendations());
    dispatch(generateRecommendations());
  };

  const handleViewAnalytics = () => {
    setShowAnalytics(!showAnalytics);
    if (!analytics) {
      dispatch(getAnalytics({ timeframe: 7 }));
    }
  };

  const handleCourseClick = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  // Safely parse segmentWeights if it's a string
  let parsedWeights = {};
  if (segmentWeights) {
    try {
      parsedWeights = typeof segmentWeights === 'string' ? JSON.parse(segmentWeights) : segmentWeights;
    } catch (e) {
      parsedWeights = {};
    }
  }

  if (!user) {
    return <div className="page-container"><Loading /></div>;
  }

  return (
    <div className="recommendations-page">
      <Header title="Đề Xuất" />

      <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Page Header */}
        <div className="page-header" style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div className="header-content">
            <h1 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: '#1e293b' }}>🎓 Khóa Học Được Đề Xuất Cho Bạn</h1>
            <p className="header-subtitle" style={{ margin: 0, color: '#64748b' }}>
              Các khóa học được cá nhân hóa dựa trên hành vi, mục tiêu và tiến độ học tập của bạn
            </p>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-primary"
              onClick={handleRefresh}
              disabled={isLoading}
              style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
            >
              {isLoading ? '⏳ Đang tải...' : '🔄 Làm Mới'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleViewAnalytics}
              style={{ background: 'white', color: '#4f46e5', border: '1px solid #4f46e5', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
            >
              {showAnalytics ? '📊 Ẩn Thống Kê' : '📊 Xem Thống Kê'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Error
            message={error}
            onDismiss={() => dispatch(clearRecommendations())}
          />
        )}

        {/* User Segment Card - FIXED SPACING BUG */}
        <div className="segment-section">
          <div className="analytics-card" style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#334155' }}>🎯 Trọng Số Yếu Tố ({userSegment || 'Chưa phân loại'})</h3>
            {isLoading ? (
              <Loading />
            ) : Object.keys(parsedWeights).length > 0 ? (
              <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {Object.entries(parsedWeights).map(([key, value]) => {
                  const percentage = Math.round((value as number) * 100);
                  return (
                    <div key={key} className="analytics-item" style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '8px' }}>
                        <span className="analytics-label" style={{ textTransform: 'capitalize', fontWeight: '500', color: '#475569', fontSize: '0.875rem' }}>{key}:</span>
                        <span className="analytics-value" style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#3b82f6' }}>{percentage}%</span>
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#e2e8f0', borderRadius: '4px', height: '6px' }}>
                        <div 
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: '#3b82f6', 
                            height: '100%', 
                            borderRadius: '4px',
                            transition: 'width 0.5s ease-in-out'
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#64748b' }}>Không có dữ liệu trọng số.</p>
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-section" style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'white', padding: '16px 24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <div className="sort-control" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="sort-select" style={{ color: '#64748b', fontSize: '0.875rem' }}>Sắp Xếp Theo:</label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="score">Điểm Đề Xuất (Cao Nhất)</option>
              <option value="relevance">Độ Liên Quan (Cao Nhất)</option>
              <option value="difficulty">Độ Khó (Thấp Nhất)</option>
            </select>
          </div>

          <div className="filter-control" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="difficulty-select" style={{ color: '#64748b', fontSize: '0.875rem' }}>Độ Khó:</label>
            <select
              id="difficulty-select"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="difficulty-select"
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="all">Tất Cả</option>
              <option value="beginner">Cơ Bản</option>
              <option value="intermediate">Trung Bình</option>
              <option value="advanced">Nâng Cao</option>
            </select>
          </div>

          <div className="result-info" style={{ marginLeft: 'auto', color: '#94a3b8', fontSize: '0.875rem' }}>
            Hiển thị {filteredRecommendations.length} khóa học được đề xuất
          </div>
        </div>

        {/* Loading State */}
        {isLoading && recommendations.length === 0 && (
          <Loading />
        )}

        {/* Recommendations Grid */}
        {filteredRecommendations.length > 0 && (
          <div className="recommendations-grid">
            {filteredRecommendations.map((course, index) => (
              <RecommendationCard
                key={course.courseId || index}
                course={course}
                rank={index + 1}
                onCourseClick={handleCourseClick}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRecommendations.length === 0 && (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px' }}>
            <p className="empty-icon" style={{ fontSize: '3rem', margin: '0 0 16px 0' }}>🎯</p>
            <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Không Có Khóa Học Được Đề Xuất</h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              {recommendations.length === 0
                ? 'Hãy hoàn thành một số khóa học để nhận được những đề xuất tốt hơn.'
                : 'Không tìm thấy khóa học phù hợp với bộ lọc của bạn.'}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/course')}
              style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: '500', cursor: 'pointer' }}
            >
              🔍 Khám Phá Khóa Học
            </button>
          </div>
        )}

        {/* Last Updated Info */}
        {lastGeneratedAt && (
          <div className="footer-info" style={{ textAlign: 'center', marginTop: '24px', color: '#94a3b8' }}>
            <small>
              Lần cập nhật cuối cùng: {new Date(lastGeneratedAt).toLocaleString('vi-VN')}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
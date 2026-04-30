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
import UserSegmentCard from '../components/UserSegmentCard';
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

  // Load recommendations on mount
  useEffect(() => {
    if (user) {
      dispatch(generateRecommendations());
      dispatch(updateUserSegment());
    }
  }, [dispatch, user]);

  // Sort recommendations
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return b.recommendationScore - a.recommendationScore;
      case 'relevance':
        return b.scoreBreakdown.relevance - a.scoreBreakdown.relevance;
      case 'difficulty':
        const diffOrder = { 'Beginner': 0, 'Intermediate': 1, 'Advanced': 2 };
        return (diffOrder[a.difficulty as keyof typeof diffOrder] || 0) -
               (diffOrder[b.difficulty as keyof typeof diffOrder] || 0);
      default:
        return 0;
    }
  });

  // Filter by difficulty
  const filteredRecommendations = filterDifficulty === 'all'
    ? sortedRecommendations
    : sortedRecommendations.filter(
        (course) => course.difficulty.toLowerCase() === filterDifficulty.toLowerCase()
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

  if (!user) {
    return <div className="page-container"><Loading /></div>;
  }

  return (
    <div className="recommendations-page">
      <Header title="Đề Xuất" />
      
      <div className="page-container">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>🎓 Khóa Học Được Đề Xuất Cho Bạn</h1>
            <p className="header-subtitle">
              Các khóa học được cá nhân hóa dựa trên hành vi, mục tiêu và tiến độ học tập của bạn
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Đang tải...' : '🔄 Làm Mới'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleViewAnalytics}
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

        {/* User Segment Card */}
        <div className="segment-section">
          <UserSegmentCard 
            segment={userSegment} 
            weights={segmentWeights}
            isLoading={isLoading}
          />
        </div>

        {/* Analytics Section */}
        {showAnalytics && analytics && (
          <div className="analytics-section">
            <div className="analytics-card">
              <h3>📈 Thống Kê Hiệu Suất</h3>
              
              <div className="analytics-grid">
                <div className="analytics-item">
                  <span className="analytics-label">Tổng Đề Xuất:</span>
                  <span className="analytics-value">
                    {analytics.overview?.totalRecommendations || 0}
                  </span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Tỷ Lệ Click:</span>
                  <span className="analytics-value">
                    {analytics.overview?.clickThroughRate || '0%'}
                  </span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Tỷ Lệ Chuyển Đổi:</span>
                  <span className="analytics-value">
                    {analytics.overview?.conversionRate || '0%'}
                  </span>
                </div>
                <div className="analytics-item">
                  <span className="analytics-label">Thời Gian Thực Thi:</span>
                  <span className="analytics-value">
                    {analytics.systemPerformance?.avgExecutionTime?.toFixed(0) || 0}ms
                  </span>
                </div>
              </div>

              {analytics.topRecommendedCourses && analytics.topRecommendedCourses.length > 0 && (
                <div className="top-courses">
                  <h4>🏆 Khóa Học Được Đề Xuất Hàng Đầu</h4>
                  <div className="top-courses-list">
                    {analytics.topRecommendedCourses.slice(0, 5).map((course: any, index: number) => (
                      <div key={course.courseId} className="top-course-item">
                        <span className="rank">#{index + 1}</span>
                        <span className="title">{course.title}</span>
                        <span className="stats">
                          {course.recommendmentCount} đề xuất, {course.clicks} clicks
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="controls-section">
          <div className="sort-control">
            <label htmlFor="sort-select">Sắp Xếp Theo:</label>
            <select 
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="score">Điểm Đề Xuất (Cao Nhất)</option>
              <option value="relevance">Độ Liên Quan (Cao Nhất)</option>
              <option value="difficulty">Độ Khó (Thấp Nhất)</option>
            </select>
          </div>

          <div className="filter-control">
            <label htmlFor="difficulty-select">Độ Khó:</label>
            <select 
              id="difficulty-select"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="difficulty-select"
            >
              <option value="all">Tất Cả</option>
              <option value="beginner">Cơ Bản</option>
              <option value="intermediate">Trung Bình</option>
              <option value="advanced">Nâng Cao</option>
            </select>
          </div>

          <div className="result-info">
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
                key={course.courseId}
                course={course}
                rank={index + 1}
                onCourseClick={handleCourseClick}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRecommendations.length === 0 && (
          <div className="empty-state">
            <p className="empty-icon">🎯</p>
            <h3>Không Có Khóa Học Được Đề Xuất</h3>
            <p>
              {recommendations.length === 0
                ? 'Hãy hoàn thành một số khóa học để nhận được những đề xuất tốt hơn.'
                : 'Không tìm thấy khóa học phù hợp với bộ lọc của bạn.'}
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/course')}
            >
              🔍 Khám Phá Khóa Học
            </button>
          </div>
        )}

        {/* Last Updated Info */}
        {lastGeneratedAt && (
          <div className="footer-info">
            <small>
              Lần cập nhật cuối cùng: {new Date(lastGeneratedAt).toLocaleString('vi-VN')}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

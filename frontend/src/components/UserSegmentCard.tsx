/**
 * UserSegmentCard Component
 * File: frontend/src/components/UserSegmentCard.tsx
 * 
 * Display user's learning segment classification and weights.
 */

import React from 'react';
import '../styles/userSegmentCard.css';

interface UserSegmentCardProps {
  segment: string | null;
  weights: Record<string, number> | null;
  isLoading?: boolean;
}

export default function UserSegmentCard({ segment, weights, isLoading }: UserSegmentCardProps) {
  const segmentDescriptions: Record<string, string> = {
    'Newbie': 'Bắt đầu hành trình học tập của bạn với các khóa cơ bản',
    'Career-Changer': 'Đang chuyển đổi sự nghiệp với các kỹ năng mới',
    'Quick-Learner': 'Muốn học nhanh chóng và hiệu quả',
    'Hobby-Learner': 'Học cho sở thích cá nhân và phát triển bản thân',
    'Skill-Enhancer': 'Nâng cao kỹ năng chuyên môn hiện tại'
  };

  const segmentIcons: Record<string, string> = {
    'Newbie': '🌱',
    'Career-Changer': '🚀',
    'Quick-Learner': '⚡',
    'Hobby-Learner': '🎨',
    'Skill-Enhancer': '📈'
  };

  const segmentColors: Record<string, string> = {
    'Newbie': '#4CAF50',
    'Career-Changer': '#2196F3',
    'Quick-Learner': '#FF9800',
    'Hobby-Learner': '#9C27B0',
    'Skill-Enhancer': '#F44336'
  };

  if (isLoading) {
    return (
      <div className="user-segment-card loading">
        <div className="skeleton-line" style={{ width: '60%', marginBottom: '10px' }} />
        <div className="skeleton-line" style={{ width: '80%' }} />
      </div>
    );
  }

  if (!segment) {
    return (
      <div className="user-segment-card empty">
        <p>Đang tải thông tin phân loại học viên...</p>
      </div>
    );
  }

  return (
    <div className="user-segment-card">
      <div className="segment-header">
        <span className="segment-icon">{segmentIcons[segment]}</span>
        <div className="segment-info">
          <h3 className="segment-title">{segment}</h3>
          <p className="segment-description">{segmentDescriptions[segment]}</p>
        </div>
      </div>

      {weights && Object.keys(weights).length > 0 && (
        <div className="segment-weights">
          <p className="weights-title">📊 Trọng Số Yếu Tố:</p>
          <div className="weights-container">
            {Object.entries(weights).map(([key, value]) => (
              <div key={key} className="weight-item">
                <div className="weight-label">{key}</div>
                <div className="weight-bar-container">
                  <div 
                    className="weight-bar-fill"
                    style={{
                      width: `${Math.min(value * 10, 100)}%`,
                      backgroundColor: segmentColors[segment]
                    }}
                  />
                </div>
                <div className="weight-value">{(value * 10).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="segment-info-box">
        <p className="info-text">
          Phân loại này giúp chúng tôi cá nhân hóa các khóa học được đề xuất cho bạn. 
          Nó sẽ được cập nhật tự động khi bạn hoàn thành các khóa học.
        </p>
      </div>
    </div>
  );
}

/**
 * Admin Recommendation Rules Page
 * File: frontend/src/pages/AdminRecommendationsRules.tsx
 * 
 * Admin page for managing recommendation rules.
 */

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store';
import type { RootState } from '../app/store';
import AdminLayout from '../components/AdminLayout.tsx';
import recommendationService from '../services/recommendationService';
import type { RecommendationRule } from '../services/recommendationService';
import '../styles/adminRecommendationsRules.css';

interface FormData {
  ruleName: string;
  ruleType: 'level' | 'goal' | 'behavior' | 'performance' | 'preference';
  ruleLogic: Record<string, any>;
  appliesToSegments: string[];
  active: boolean;
}

export default function AdminRecommendationsRules() {
  const dispatch = useAppDispatch();
  const [rules, setRules] = useState<RecommendationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<RecommendationRule | null>(null);
  const [formData, setFormData] = useState<FormData>({
    ruleName: '',
    ruleType: 'level',
    ruleLogic: {},
    appliesToSegments: [],
    active: true,
  });

  const segments = ['Newbie', 'Career-Changer', 'Quick-Learner', 'Hobby-Learner', 'Skill-Enhancer'];

  // Load rules on mount
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const response = await recommendationService.getRecommendationRules();
      if (response.success) {
        setRules(response.data.rules);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setLoading(true);
      await recommendationService.createRecommendationRule(
        formData.ruleName,
        formData.ruleType,
        formData.ruleLogic,
        formData.appliesToSegments
      );
      setShowForm(false);
      resetForm();
      await fetchRules();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (ruleId: number) => {
    try {
      setLoading(true);
      await recommendationService.updateRecommendationRule(
        ruleId,
        formData.ruleLogic,
        formData.appliesToSegments,
        formData.active
      );
      setEditingRule(null);
      resetForm();
      await fetchRules();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rule: RecommendationRule) => {
    setEditingRule(rule);
    setFormData({
      ruleName: rule.rule_name,
      ruleType: rule.rule_type as any,
      ruleLogic: rule.rule_logic,
      appliesToSegments: rule.applies_to_segments,
      active: rule.active,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      ruleName: '',
      ruleType: 'level',
      ruleLogic: {},
      appliesToSegments: [],
      active: true,
    });
    setEditingRule(null);
  };

  const handleSegmentToggle = (segment: string) => {
    setFormData((prev) => ({
      ...prev,
      appliesToSegments: prev.appliesToSegments.includes(segment)
        ? prev.appliesToSegments.filter((s) => s !== segment)
        : [...prev.appliesToSegments, segment],
    }));
  };

  const getRuleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'level': '📚 Mức Độ',
      'goal': '🎯 Mục Tiêu',
      'behavior': '🔄 Hành Vi',
      'performance': '⚡ Hiệu Suất',
      'preference': '❤️ Sở Thích',
    };
    return labels[type] || type;
  };

  return (
    <AdminLayout>
      <div className="admin-rules-container">
        <div className="rules-header">
          <div>
            <h1>⚙️ Quản Lý Quy Tắc Đề Xuất</h1>
            <p className="subtitle">Cấu hình quy tắc để cá nhân hóa khóa học được đề xuất</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            disabled={loading}
          >
            + Thêm Quy Tắc Mới
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="rule-form-card">
            <div className="form-header">
              <h3>{editingRule ? '✏️ Chỉnh Sửa Quy Tắc' : '➕ Thêm Quy Tắc Mới'}</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>

            <div className="form-group">
              <label>Tên Quy Tắc:</label>
              <input
                type="text"
                value={formData.ruleName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ruleName: e.target.value,
                  }))
                }
                disabled={!!editingRule}
                placeholder="Nhập tên quy tắc"
              />
            </div>

            <div className="form-group">
              <label>Loại Quy Tắc:</label>
              <select
                value={formData.ruleType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ruleType: e.target.value as any,
                  }))
                }
                disabled={!!editingRule}
              >
                <option value="level">📚 Mức Độ</option>
                <option value="goal">🎯 Mục Tiêu</option>
                <option value="behavior">🔄 Hành Vi</option>
                <option value="performance">⚡ Hiệu Suất</option>
                <option value="preference">❤️ Sở Thích</option>
              </select>
            </div>

            <div className="form-group">
              <label>Áp Dụng Cho Các Phân Loại:</label>
              <div className="segments-checkbox">
                {segments.map((segment) => (
                  <label key={segment} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.appliesToSegments.includes(segment)}
                      onChange={() => handleSegmentToggle(segment)}
                    />
                    {segment}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      active: e.target.checked,
                    }))
                  }
                />
                Kích Hoạt
              </label>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (editingRule) {
                    handleUpdate(editingRule.id);
                  } else {
                    handleCreate();
                  }
                }}
                disabled={loading || !formData.ruleName}
              >
                {loading ? '⏳ Đang xử lý...' : editingRule ? '💾 Cập Nhật' : '➕ Thêm'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={loading}
              >
                ✕ Hủy
              </button>
            </div>
          </div>
        )}

        {/* Rules List */}
        <div className="rules-list">
          {loading && rules.length === 0 ? (
            <div className="loading">Đang tải quy tắc...</div>
          ) : rules.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có quy tắc nào</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowForm(true)}
              >
                ➕ Thêm Quy Tắc Đầu Tiên
              </button>
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className={`rule-card ${rule.active ? 'active' : 'inactive'}`}
              >
                <div className="rule-header">
                  <div>
                    <h3>{rule.rule_name}</h3>
                    <p className="rule-type">{getRuleTypeLabel(rule.rule_type)}</p>
                  </div>
                  <div className="rule-status">
                    {rule.active ? (
                      <span className="badge active">✓ Hoạt Động</span>
                    ) : (
                      <span className="badge inactive">✕ Tắt</span>
                    )}
                  </div>
                </div>

                <div className="rule-body">
                  <div className="segments-list">
                    <strong>Áp Dụng Cho:</strong>
                    <div className="segment-tags">
                      {rule.applies_to_segments.map((segment) => (
                        <span key={segment} className="segment-tag">
                          {segment}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rule-logic">
                    <strong>Logic:</strong>
                    <pre>{JSON.stringify(rule.rule_logic, null, 2)}</pre>
                  </div>

                  <div className="timestamps">
                    <small>
                      Tạo: {new Date(rule.created_at).toLocaleString('vi-VN')}
                    </small>
                    <small>
                      Cập Nhật: {new Date(rule.updated_at).toLocaleString('vi-VN')}
                    </small>
                  </div>
                </div>

                <div className="rule-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleEdit(rule)}
                    disabled={loading}
                  >
                    ✏️ Chỉnh Sửa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

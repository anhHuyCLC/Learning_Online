import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  fallbackPath?: string;
  showBackBtn?: boolean; // Thêm prop để tùy chọn ẩn/hiện nút Back
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  action, 
  fallbackPath = "..",
  showBackBtn = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  return (
    <header className="component-header">
      {/* CỘT TRÁI: Nút Back */}
      <div className="header-left">
        {showBackBtn && (
          <button 
            className="btn-back" 
            onClick={handleBack}
            aria-label="Quay lại trang trước"
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Quay lại</span>
          </button>
        )}
      </div>

      {/* CỘT GIỮA: Tiêu đề */}
      <div className="header-center">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle text-muted">{subtitle}</p>}
      </div>

      {/* CỘT PHẢI: Nút Hành động */}
      <div className="header-right">
        {action && <div className="header-action">{action}</div>}
      </div>
    </header>
  );
};
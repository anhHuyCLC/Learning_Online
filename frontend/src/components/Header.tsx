import React from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, action }) => {
  const navigate = useNavigate();
  return (
    <div className="component-header">
      <div className="header-content">
        <div className="header-back">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← <span>Back</span>
          </button>
        </div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="header-action">{action}</div>}
    </div>
  );
};

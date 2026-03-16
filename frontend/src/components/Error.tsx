import React from "react";

interface ErrorProps {
  message: string;
  onDismiss?: () => void;
}

export const Error: React.FC<ErrorProps> = ({ message, onDismiss }) => {
  return (
    <div className="component-error">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <p>{message}</p>
        {onDismiss && (
          <button className="error-dismiss" onClick={onDismiss}>
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

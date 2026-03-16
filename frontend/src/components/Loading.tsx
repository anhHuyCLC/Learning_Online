import React from "react";

export const Loading: React.FC<{ message?: string }> = ({
  message = "Đang tải...",
}) => {
  return (
    <div className="component-loading">
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
};

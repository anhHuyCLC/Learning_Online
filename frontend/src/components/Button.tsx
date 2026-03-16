import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "text";
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`component-button btn-${variant} btn-${size}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <span className="button-spinner">⏳</span>}
      {children}
    </button>
  );
};

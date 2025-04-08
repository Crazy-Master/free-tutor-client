import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ children, onClick, type = "button", className = "", disabled }) => {
  return (
    <button
  type={type}
  onClick={onClick}
  disabled={disabled}
  className={`bg-primary hover:opacity-90 text-background px-4 py-2 rounded transition ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
>
      {children}
    </button>
  );
};

export default Button;

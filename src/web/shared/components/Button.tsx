import React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  size?: "small" | "medium" | "large";
  outline?: boolean;
  iconOnly?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  outline = false,
  iconOnly = false,
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}) => {
  const classNames = [
    styles.base,
    styles[variant],
    size !== "medium" && styles[size],
    outline && styles.outline,
    iconOnly && styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} disabled={disabled || loading} {...props}>
      {loading ? "..." : children}
    </button>
  );
};

import React from "react";
import styles from "./styles.module.css";

interface BadgeProps {
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  size?: "small" | "medium" | "large";
  outline?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "primary",
  size = "medium",
  outline = false,
  className = "",
  children,
}) => {
  const classNames = [
    styles.base,
    styles[variant],
    size !== "medium" && styles[size],
    outline && styles.outline,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classNames}>{children}</span>;
};

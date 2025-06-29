import React from "react";
import styles from "./styles.module.css";

interface CardProps {
  title?: string;
  footer?: React.ReactNode;
  variant?: "default" | "bordered" | "elevated" | "flat";
  size?: "compact" | "default" | "spacious";
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  footer,
  variant = "default",
  size = "default",
  className = "",
  children,
}) => {
  const cardClassNames = [
    styles.card,
    variant !== "default" && styles[variant],
    size !== "default" && styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClassNames}>
      {title && (
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
      )}

      <div className={styles.content}>{children}</div>

      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};

import React from "react";
import styles from "./ErrorAlert.module.css";

interface ErrorAlertProps {
  message: string;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  className = "",
}) => (
  <div className={`${styles.alert} ${className}`}>
    <span className={styles.icon}>⚠️</span>
    <span className={styles.message}>{message}</span>
  </div>
);

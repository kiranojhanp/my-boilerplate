import React, { useState, useEffect } from "react";
import styles from "./LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  text?: string;
  isLoading?: boolean;
  minDisplayTime?: number; // Minimum time to show spinner in ms (default: 500ms)
}

// Custom hook to handle minimum loading time
const useMinimumLoadingTime = (isLoading: boolean, minTime: number = 500) => {
  const [showLoading, setShowLoading] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading && !startTime) {
      // Start loading
      setStartTime(Date.now());
      setShowLoading(true);
    } else if (!isLoading && startTime) {
      // Loading finished, check if minimum time has passed
      const elapsed = Date.now() - startTime;
      if (elapsed >= minTime) {
        // Minimum time has passed, hide immediately
        setShowLoading(false);
        setStartTime(null);
      } else {
        // Wait for remaining time before hiding
        const remainingTime = minTime - elapsed;
        setTimeout(() => {
          setShowLoading(false);
          setStartTime(null);
        }, remainingTime);
      }
    }
  }, [isLoading, startTime, minTime]);

  return showLoading;
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  text = "Loading...",
  isLoading = true,
  minDisplayTime = 500, // 500ms minimum display time
}) => {
  const shouldShow = useMinimumLoadingTime(isLoading, minDisplayTime);

  if (!shouldShow) {
    return null;
  }

  const spinnerClasses = [styles.spinner, styles[size], styles.fadeIn]
    .filter(Boolean)
    .join(" ");

  const textClasses = [styles.text, size === "small" && styles.textSmall]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.container}>
      <div className={spinnerClasses} />
      {text && <span className={textClasses}>{text}</span>}
    </div>
  );
};

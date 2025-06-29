import React, { useState, useEffect } from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  text?: string;
  isLoading?: boolean;
  minDisplayTime?: number; // Minimum time to show spinner in ms
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
  minDisplayTime = 500,
}) => {
  const shouldShow = useMinimumLoadingTime(isLoading, minDisplayTime);

  const sizeStyles = {
    small: { width: "16px", height: "16px", borderWidth: "2px" },
    medium: { width: "24px", height: "24px", borderWidth: "3px" },
    large: { width: "32px", height: "32px", borderWidth: "4px" },
  };

  const spinnerStyle = {
    display: "inline-block",
    borderRadius: "50%",
    border: `${sizeStyles[size].borderWidth} solid #e2e8f0`,
    borderTop: `${sizeStyles[size].borderWidth} solid #4299e1`,
    animation: "spin 1s linear infinite",
    ...sizeStyles[size],
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: size === "small" ? "4px" : "8px",
      }}
    >
      <div style={spinnerStyle} />
      {text && (
        <span
          style={{
            fontSize: size === "small" ? "0.875rem" : "1rem",
            color: "#718096",
          }}
        >
          {text}
        </span>
      )}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

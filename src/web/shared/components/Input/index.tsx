import React from "react";
import styles from "./styles.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
  variant?: "default" | "error" | "success";
  required?: boolean;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helpText?: string;
  variant?: "default" | "error" | "success";
  required?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helpText?: string;
  variant?: "default" | "error" | "success";
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helpText,
  variant = "default",
  required = false,
  className = "",
  ...props
}) => {
  const inputClassNames = [
    styles.base,
    variant !== "default" && styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.inputGroup}>
      {label && (
        <label className={`${styles.label} ${required ? styles.required : ""}`}>
          {label}
        </label>
      )}
      <input className={inputClassNames} {...props} />
      {error && <div className={styles.errorText}>{error}</div>}
      {helpText && !error && <div className={styles.helpText}>{helpText}</div>}
    </div>
  );
};

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helpText,
  variant = "default",
  required = false,
  className = "",
  ...props
}) => {
  const textareaClassNames = [
    styles.base,
    styles.textarea,
    variant !== "default" && styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.inputGroup}>
      {label && (
        <label className={`${styles.label} ${required ? styles.required : ""}`}>
          {label}
        </label>
      )}
      <textarea className={textareaClassNames} {...props} />
      {error && <div className={styles.errorText}>{error}</div>}
      {helpText && !error && <div className={styles.helpText}>{helpText}</div>}
    </div>
  );
};

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helpText,
  variant = "default",
  required = false,
  className = "",
  children,
  ...props
}) => {
  const selectClassNames = [
    styles.base,
    styles.select,
    variant !== "default" && styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.inputGroup}>
      {label && (
        <label className={`${styles.label} ${required ? styles.required : ""}`}>
          {label}
        </label>
      )}
      <select className={selectClassNames} {...props}>
        {children}
      </select>
      {error && <div className={styles.errorText}>{error}</div>}
      {helpText && !error && <div className={styles.helpText}>{helpText}</div>}
    </div>
  );
};

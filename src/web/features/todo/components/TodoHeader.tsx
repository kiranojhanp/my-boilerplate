import React from "react";
import styles from "./TodoHeader.module.css";
import { useTodoStats } from "../hooks/useTodos";

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color }) => (
  <div className={styles.statCard} style={{ background: color }}>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

export const TodoHeader: React.FC = () => {
  const { data: stats, isLoading } = useTodoStats();

  return (
    <div className={styles.header}>
      <h1 className={styles.title}>📝 Todo Manager</h1>
      <p className={styles.subtitle}>Organize your tasks efficiently</p>

      {!isLoading && stats && (
        <div className={styles.stats}>
          <StatCard label="Total" value={stats.total} color="#4a90e2" />
          <StatCard label="Pending" value={stats.pending} color="#f39c12" />
          <StatCard
            label="In Progress"
            value={stats.inProgress}
            color="#3498db"
          />
          <StatCard label="Completed" value={stats.completed} color="#27ae60" />
          <StatCard label="Overdue" value={stats.overdue} color="#e74c3c" />
        </div>
      )}
    </div>
  );
};

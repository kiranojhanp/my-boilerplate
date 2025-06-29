import React, { useState } from "react";
import styles from "./TodoCard.module.css";
import { Button, Badge } from "../../../shared/components";
import { useUpdateTodo, useDeleteTodo } from "../hooks/useTodos";
import type { Todo, TodoStatus } from "../../../shared/types/todo";

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({ todo, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const handleStatusChange = (newStatus: TodoStatus) => {
    updateTodo.mutate({
      id: todo.id,
      status: newStatus,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this todo?")) {
      deleteTodo.mutate({ id: todo.id });
    }
  };

  const priorityColors = {
    low: "success",
    medium: "warning",
    high: "danger",
    urgent: "danger",
  } as const;

  const statusColors = {
    pending: "warning",
    in_progress: "info",
    completed: "success",
    cancelled: "secondary",
  } as const;

  const isOverdue =
    todo.dueDate &&
    new Date(todo.dueDate) < new Date() &&
    todo.status !== "completed";

  const statusConfig = {
    pending: { label: "Pending", variant: "warning" as const },
    in_progress: { label: "In Progress", variant: "info" as const },
    completed: { label: "Complete", variant: "success" as const },
    cancelled: { label: "Cancel", variant: "secondary" as const },
  };

  return (
    <div className={`${styles.card} ${isOverdue ? styles.overdue : ""}`}>
      {isOverdue && <div className={styles.overdueBadge}>OVERDUE</div>}

      <div className={styles.header}>
        <div className={styles.content}>
          <h3
            className={`${styles.title} ${todo.status === "completed" ? styles.completed : ""}`}
          >
            {todo.title}
          </h3>

          <div className={styles.badges}>
            <Badge variant={priorityColors[todo.priority]}>
              {todo.priority.toUpperCase()} Priority
            </Badge>
            <Badge variant={statusColors[todo.status]}>
              {todo.status.replace("_", " ").toUpperCase()}
            </Badge>
            <Badge variant="secondary">{todo.category.toUpperCase()}</Badge>
          </div>

          {todo.description && (
            <p className={styles.description}>{todo.description}</p>
          )}

          {todo.tags && todo.tags.length > 0 && (
            <div className={styles.tags}>
              {todo.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className={styles.metadata}>
            {todo.dueDate && (
              <span>
                📅 Due: {new Date(todo.dueDate).toLocaleDateString()}{" "}
                {new Date(todo.dueDate).toLocaleTimeString()}
              </span>
            )}
            {todo.estimatedMinutes && (
              <span>⏱️ Est: {todo.estimatedMinutes}min</span>
            )}
            {todo.actualMinutes && (
              <span>⏰ Actual: {todo.actualMinutes}min</span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="small"
            iconOnly
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "▼" : "▶"}
          </Button>

          <Button variant="info" size="small" onClick={() => onEdit(todo)}>
            Edit
          </Button>

          <Button
            variant="danger"
            size="small"
            loading={deleteTodo.isPending}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className={styles.statusButtons}>
        {Object.entries(statusConfig).map(([status, config]) => (
          <button
            key={status}
            className={`${styles.statusButton} ${todo.status === status ? styles.statusButtonActive : ""}`}
            style={{
              background:
                todo.status === status
                  ? getStatusColor(status as TodoStatus)
                  : "white",
              color:
                todo.status === status
                  ? "white"
                  : getStatusColor(status as TodoStatus),
              border: `1px solid ${getStatusColor(status as TodoStatus)}`,
            }}
            onClick={() => handleStatusChange(status as TodoStatus)}
            disabled={updateTodo.isPending || todo.status === status}
          >
            {config.label}
          </button>
        ))}
      </div>

      {isExpanded && todo.subtasks.length > 0 && (
        <div className={styles.subtasks}>
          <h4 className={styles.subtasksTitle}>
            Subtasks ({todo.subtasks.filter((s) => s.completed).length}/
            {todo.subtasks.length})
          </h4>
          <div className={styles.subtasksList}>
            {todo.subtasks.map((subtask) => (
              <div key={subtask.id} className={styles.subtask}>
                <span className={styles.subtaskIcon}>
                  {subtask.completed ? "✅" : "⚪"}
                </span>
                <span
                  className={`${styles.subtaskTitle} ${subtask.completed ? styles.subtaskCompleted : ""}`}
                >
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <div className={styles.expandedInfo}>
          <div>Created: {new Date(todo.createdAt).toLocaleString()}</div>
          <div>Updated: {new Date(todo.updatedAt).toLocaleString()}</div>
          {todo.completedAt && (
            <div>Completed: {new Date(todo.completedAt).toLocaleString()}</div>
          )}
        </div>
      )}
    </div>
  );
};

function getStatusColor(status: TodoStatus): string {
  const colors = {
    pending: "#ed8936",
    in_progress: "#4299e1",
    completed: "#48bb78",
    cancelled: "#a0aec0",
  };
  return colors[status];
}

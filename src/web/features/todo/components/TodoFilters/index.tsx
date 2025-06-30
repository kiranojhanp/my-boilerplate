import React from "react";
import styles from "./styles.module.css";
import type {
  TodoFilters,
  TodoStatus,
  TodoPriority,
  TodoCategory,
} from "@/web/shared/types";

interface TodoFiltersProps {
  filters: TodoFilters;
  onFiltersChange: (filters: TodoFilters) => void;
}

export const TodoFiltersComponent: React.FC<TodoFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const clearFilters = () => {
    onFiltersChange({
      status: undefined,
      priority: undefined,
      category: undefined,
      search: "",
    });
  };

  const hasActiveFilters =
    filters.status || filters.priority || filters.category || filters.search;

  return (
    <div className={styles.filters}>
      <input
        type="text"
        placeholder="Search todos..."
        value={filters.search || ""}
        onChange={(e) =>
          onFiltersChange({ ...filters, search: e.target.value })
        }
        className={styles.searchInput}
      />

      <div className={styles.filtersRow}>
        <select
          value={filters.status || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: (e.target.value as TodoStatus) || undefined,
            })
          }
          className={styles.select}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filters.priority || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              priority: (e.target.value as TodoPriority) || undefined,
            })
          }
          className={styles.select}
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <select
          value={filters.category || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              category: (e.target.value as TodoCategory) || undefined,
            })
          }
          className={styles.select}
        >
          <option value="">All Categories</option>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
          <option value="shopping">Shopping</option>
          <option value="health">Health</option>
          <option value="learning">Learning</option>
          <option value="other">Other</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className={styles.clearButton}
            title="Clear all filters"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

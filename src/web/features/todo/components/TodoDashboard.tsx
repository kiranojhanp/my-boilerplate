import React, { useState } from "react";
import styles from "./TodoDashboard.module.css";
import { TodoHeader } from "./TodoHeader";
import { TodoFiltersComponent } from "./TodoFilters";
import { TodoForm } from "./TodoForm";
import { TodoCard } from "./TodoCard";
import { Modal } from "../../../shared/components";
import { useTodos } from "../hooks/useTodos";
import type { TodoFilters, Todo } from "../../../shared/types/todo";

export const TodoDashboard: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filters, setFilters] = useState<TodoFilters>({});

  const { data: todosData, isLoading, refetch } = useTodos(filters);

  const handleTodoCreated = () => {
    setShowCreateForm(false);
    refetch();
  };

  const handleTodoUpdated = () => {
    setEditingTodo(null);
    refetch();
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const hasActiveFilters =
    filters.status || filters.priority || filters.category || filters.search;

  return (
    <div className={styles.dashboard}>
      <TodoHeader />

      <div className={styles.controls}>
        <div className={styles.filtersSection}>
          <TodoFiltersComponent
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`${styles.addButton} ${showCreateForm ? styles.cancel : ""}`}
        >
          {showCreateForm ? "✕ Cancel" : "+ Add Todo"}
        </button>
      </div>

      {showCreateForm && (
        <TodoForm
          onSuccess={handleTodoCreated}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className={styles.todosList}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            Loading todos...
          </div>
        ) : !todosData?.todos.length ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📝</div>
            <h3 className={styles.emptyStateTitle}>
              {hasActiveFilters
                ? "No todos match your filters"
                : "No todos yet"}
            </h3>
            <p className={styles.emptyStateText}>
              {hasActiveFilters
                ? "Try adjusting your filters to see more todos."
                : "Create your first todo to get started organizing your tasks!"}
            </p>
          </div>
        ) : (
          todosData.todos.map((todo) => (
            <TodoCard key={todo.id} todo={todo} onEdit={handleEditTodo} />
          ))
        )}
      </div>

      <Modal
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        title="Edit Todo"
        size="large"
      >
        {editingTodo && (
          <TodoForm
            todo={editingTodo}
            onSuccess={handleTodoUpdated}
            onCancel={() => setEditingTodo(null)}
          />
        )}
      </Modal>
    </div>
  );
};

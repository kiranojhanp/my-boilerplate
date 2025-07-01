/**
 * 🌐 TODO FRONTEND
 * All client-side code for todo feature
 * - React components (TodoDashboard, TodoForm, TodoCard, etc.)
 * - Custom hooks (useTodos, useCreateTodo, etc.)
 * - State management
 */

import React, { useState, useMemo, memo } from "react";
import { trpc } from "@/frontend/utils";
import type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
  ListTodosInput,
  TodoStats,
  Subtask,
  UpdateSubtaskInput,
  TodoPriority,
  TodoCategory,
} from "./types";

// Import shared components (these will need to be available from frontend/components)
// Note: These imports reference the global component system
const Button = ({ children, ...props }: any) => (
  <button {...props}>{children}</button>
);
const Input = ({ label, error, ...props }: any) => (
  <div>
    {label && <label>{label}</label>}
    <input {...props} />
    {error && <span style={{ color: "red" }}>{error}</span>}
  </div>
);
const Textarea = ({ label, ...props }: any) => (
  <div>
    {label && <label>{label}</label>}
    <textarea {...props} />
  </div>
);
const Select = ({ label, children, ...props }: any) => (
  <div>
    {label && <label>{label}</label>}
    <select {...props}>{children}</select>
  </div>
);
const Modal = ({ isOpen, onClose, title, children }: any) =>
  isOpen ? (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          maxWidth: "90vw",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h2>{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  ) : null;
const LoadingSpinner = ({ text }: any) => <div>⏳ {text || "Loading..."}</div>;
const ErrorAlert = ({ message }: any) => (
  <div
    style={{
      color: "red",
      padding: "8px",
      border: "1px solid red",
      borderRadius: "4px",
    }}
  >
    {message}
  </div>
);

// ===== HOOKS =====
export function useTodos(filters: Partial<ListTodosInput> = {}) {
  return trpc.todo.list.useQuery(filters);
}

export function useTodoById(id: string) {
  return trpc.todo.getById.useQuery({ id });
}

export function useTodoStats(
  period: "day" | "week" | "month" | "year" = "week"
) {
  return trpc.todo.getStats.useQuery({ period });
}

export function useCreateTodo() {
  const utils = trpc.useUtils();

  return trpc.todo.create.useMutation({
    onSuccess: () => {
      utils.todo.list.invalidate();
      utils.todo.getStats.invalidate();
    },
  });
}

export function useUpdateTodo() {
  const utils = trpc.useUtils();

  return trpc.todo.update.useMutation({
    onSuccess: () => {
      utils.todo.list.invalidate();
      utils.todo.getStats.invalidate();
    },
  });
}

export function useDeleteTodo() {
  const utils = trpc.useUtils();

  return trpc.todo.delete.useMutation({
    onSuccess: () => {
      utils.todo.list.invalidate();
      utils.todo.getStats.invalidate();
    },
  });
}

export function useUpdateSubtask() {
  const utils = trpc.useUtils();

  return trpc.todo.updateSubtask.useMutation({
    onSuccess: () => {
      utils.todo.list.invalidate();
      utils.todo.getStats.invalidate();
    },
  });
}

// ===== COMPONENTS =====

// TodoForm Component - Complete implementation
interface TodoFormProps {
  todo?: Todo & { subtasks: Subtask[] };
  onSuccess: () => void;
  onCancel: () => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({
  todo,
  onSuccess,
  onCancel,
}) => {
  const isEditing = !!todo;
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();

  const [formData, setFormData] = useState({
    title: todo?.title || "",
    description: todo?.description || "",
    priority: todo?.priority || ("medium" as TodoPriority),
    category: todo?.category || ("personal" as TodoCategory),
    dueDate: todo?.dueDate
      ? new Date(todo.dueDate).toISOString().slice(0, 16)
      : "",
    tags: todo?.tags?.join(", ") || "",
    estimatedMinutes: todo?.estimatedMinutes?.toString() || "",
    actualMinutes: todo?.actualMinutes?.toString() || "",
    subtasks: isEditing ? [] : [""],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = "Due date must be in the future";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    if (isEditing) {
      const updateData: UpdateTodoInput = {
        id: todo.id,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        category: formData.category,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        tags: tagsArray,
        estimatedMinutes: formData.estimatedMinutes
          ? parseInt(formData.estimatedMinutes)
          : undefined,
        actualMinutes: formData.actualMinutes
          ? parseInt(formData.actualMinutes)
          : undefined,
      };

      updateTodo.mutate(updateData, {
        onSuccess: () => onSuccess(),
        onError: (error) => setErrors({ general: error.message }),
      });
    } else {
      const subtasksArray = formData.subtasks
        .filter((subtask) => subtask.trim().length > 0)
        .map((title) => ({ title: title.trim() }));

      const createData: CreateTodoInput = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        category: formData.category,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        tags: tagsArray,
        estimatedMinutes: formData.estimatedMinutes
          ? parseInt(formData.estimatedMinutes)
          : undefined,
        subtasks: subtasksArray,
      };

      createTodo.mutate(createData, {
        onSuccess: () => onSuccess(),
        onError: (error) => setErrors({ general: error.message }),
      });
    }
  };

  const addSubtask = () => {
    setFormData((prev) => ({ ...prev, subtasks: [...prev.subtasks, ""] }));
  };

  const updateSubtask = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask, i) =>
        i === index ? value : subtask
      ),
    }));
  };

  const removeSubtask = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }));
  };

  const isLoading = createTodo.isPending || updateTodo.isPending;

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h3>{isEditing ? "Edit Todo" : "Create New Todo"}</h3>

      {errors.general && <ErrorAlert message={errors.general} />}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <Input
            label="Title"
            value={formData.title}
            onChange={(e: any) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter todo title"
            required
            error={errors.title}
          />
          <Input
            type="datetime-local"
            label="Due Date"
            value={formData.dueDate}
            onChange={(e: any) =>
              setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
            }
            error={errors.dueDate}
          />
        </div>

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e: any) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Enter todo description"
          rows={3}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
          }}
        >
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e: any) =>
              setFormData((prev) => ({
                ...prev,
                priority: e.target.value as TodoPriority,
              }))
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>

          <Select
            label="Category"
            value={formData.category}
            onChange={(e: any) =>
              setFormData((prev) => ({
                ...prev,
                category: e.target.value as TodoCategory,
              }))
            }
          >
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="shopping">Shopping</option>
            <option value="health">Health</option>
            <option value="learning">Learning</option>
            <option value="other">Other</option>
          </Select>

          <Input
            type="number"
            label="Estimated Minutes"
            value={formData.estimatedMinutes}
            onChange={(e: any) =>
              setFormData((prev) => ({
                ...prev,
                estimatedMinutes: e.target.value,
              }))
            }
            placeholder="Minutes"
            min="1"
          />
        </div>

        <Input
          label="Tags (comma separated)"
          value={formData.tags}
          onChange={(e: any) =>
            setFormData((prev) => ({ ...prev, tags: e.target.value }))
          }
          placeholder="work, urgent, meeting"
        />

        {!isEditing && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span>Subtasks</span>
              <button
                type="button"
                onClick={addSubtask}
                style={{ padding: "4px 8px" }}
              >
                + Add Subtask
              </button>
            </div>
            {formData.subtasks.map((subtask, index) => (
              <div
                key={index}
                style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
              >
                <input
                  type="text"
                  value={subtask}
                  onChange={(e) => updateSubtask(index, e.target.value)}
                  placeholder="Subtask title"
                  style={{ flex: 1, padding: "8px" }}
                />
                {formData.subtasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    style={{ padding: "4px 8px" }}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <Button
            type="button"
            onClick={onCancel}
            style={{ padding: "8px 16px" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
            }}
          >
            {isLoading
              ? "Saving..."
              : isEditing
                ? "Update Todo"
                : "Create Todo"}
          </Button>
        </div>
      </form>
    </div>
  );
};

// TodoCard Component
interface TodoCardProps {
  todo: Todo & { subtasks: Subtask[] };
  onEdit: (todo: Todo & { subtasks: Subtask[] }) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({ todo, onEdit }) => {
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();
  const updateSubtask = useUpdateSubtask();

  const handleStatusChange = (newStatus: string) => {
    updateTodo.mutate({
      id: todo.id,
      status: newStatus as any,
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this todo?")) {
      deleteTodo.mutate({ id: todo.id });
    }
  };

  const handleSubtaskToggle = (subtask: Subtask) => {
    updateSubtask.mutate({
      todoId: todo.id,
      subtaskId: subtask.id,
      completed: !subtask.completed,
    });
  };

  const priorityColors = {
    low: "#28a745",
    medium: "#ffc107",
    high: "#fd7e14",
    urgent: "#dc3545",
  };

  const statusColors = {
    pending: "#6c757d",
    in_progress: "#007bff",
    completed: "#28a745",
    cancelled: "#dc3545",
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        margin: "8px 0",
        backgroundColor: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>
            {todo.title}
          </h3>
          {todo.description && (
            <p style={{ margin: "0 0 8px 0", color: "#666" }}>
              {todo.description}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => onEdit(todo)}
            style={{ padding: "4px 8px", fontSize: "12px" }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: "4px 8px",
              fontSize: "12px",
              backgroundColor: "#dc3545",
              color: "white",
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            backgroundColor: priorityColors[todo.priority],
            color: "white",
          }}
        >
          {todo.priority}
        </span>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            backgroundColor: statusColors[todo.status],
            color: "white",
          }}
        >
          {todo.status.replace("_", " ")}
        </span>
        <span
          style={{
            padding: "2px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            backgroundColor: "#e9ecef",
            color: "#495057",
          }}
        >
          {todo.category}
        </span>
      </div>

      {todo.tags && todo.tags.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          {todo.tags.map((tag, index) => (
            <span
              key={index}
              style={{
                display: "inline-block",
                padding: "2px 6px",
                margin: "2px 4px 2px 0",
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                fontSize: "11px",
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {todo.subtasks && todo.subtasks.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Subtasks:</h4>
          {todo.subtasks.map((subtask) => (
            <div
              key={subtask.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "4px",
              }}
            >
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => handleSubtaskToggle(subtask)}
              />
              <span
                style={{
                  fontSize: "13px",
                  textDecoration: subtask.completed ? "line-through" : "none",
                  color: subtask.completed ? "#6c757d" : "inherit",
                }}
              >
                {subtask.title}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <select
          value={todo.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          style={{ padding: "4px 8px", fontSize: "12px" }}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {todo.dueDate && (
        <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
          Due: {new Date(todo.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

// TodoHeader Component
export const TodoHeader: React.FC = () => {
  const { data: stats } = useTodoStats();

  return (
    <div style={{ marginBottom: "24px", textAlign: "center" }}>
      <h1 style={{ margin: "0 0 16px 0", fontSize: "2rem", color: "#333" }}>
        Todo Manager
      </h1>
      {stats && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}
            >
              {stats.total}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>Total</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#28a745" }}
            >
              {stats.completed}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>Completed</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#ffc107" }}
            >
              {stats.pending}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>Pending</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff" }}
            >
              {stats.inProgress}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>In Progress</div>
          </div>
        </div>
      )}
    </div>
  );
};

// TodoFilters Component
interface TodoFiltersProps {
  filters: Partial<ListTodosInput>;
  onFiltersChange: (filters: Partial<ListTodosInput>) => void;
}

export const TodoFiltersComponent: React.FC<TodoFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "" ? undefined : value,
    });
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "12px",
        padding: "16px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        marginBottom: "16px",
      }}
    >
      <Input
        placeholder="Search todos..."
        value={filters.search || ""}
        onChange={(e: any) => handleFilterChange("search", e.target.value)}
      />

      <Select
        value={filters.status || ""}
        onChange={(e: any) => handleFilterChange("status", e.target.value)}
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </Select>

      <Select
        value={filters.priority || ""}
        onChange={(e: any) => handleFilterChange("priority", e.target.value)}
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </Select>

      <Select
        value={filters.category || ""}
        onChange={(e: any) => handleFilterChange("category", e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="personal">Personal</option>
        <option value="work">Work</option>
        <option value="shopping">Shopping</option>
        <option value="health">Health</option>
        <option value="learning">Learning</option>
        <option value="other">Other</option>
      </Select>
    </div>
  );
};

// TodoDashboard Component - Main component
export const TodoDashboard: React.FC = memo(() => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<
    (Todo & { subtasks: Subtask[] }) | null
  >(null);
  const [filters, setFilters] = useState<Partial<ListTodosInput>>({});

  const { data: todosData, isLoading, refetch } = useTodos(filters);

  const handleTodoCreated = () => {
    setShowCreateForm(false);
    refetch();
  };

  const handleTodoUpdated = () => {
    setEditingTodo(null);
    refetch();
  };

  const handleEditTodo = (todo: Todo & { subtasks: Subtask[] }) => {
    setEditingTodo(todo);
  };

  const hasActiveFilters =
    filters.status || filters.priority || filters.category || filters.search;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <TodoHeader />

      <div style={{ marginBottom: "24px" }}>
        <TodoFiltersComponent filters={filters} onFiltersChange={setFilters} />

        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: "12px 24px",
            backgroundColor: showCreateForm ? "#dc3545" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          {showCreateForm ? "✕ Cancel" : "+ Add Todo"}
        </button>
      </div>

      {showCreateForm && (
        <div
          style={{
            marginBottom: "24px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "white",
          }}
        >
          <TodoForm
            onSuccess={handleTodoCreated}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      <div>
        {isLoading ? (
          <LoadingSpinner text="Loading todos..." />
        ) : !todosData?.todos.length ? (
          <div style={{ textAlign: "center", padding: "48px", color: "#666" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
            <h3>
              {hasActiveFilters
                ? "No todos match your filters"
                : "No todos yet"}
            </h3>
            <p>
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

      {!!editingTodo && (
        <Modal
          isOpen={!!editingTodo}
          onClose={() => setEditingTodo(null)}
          title="Edit Todo"
        >
          <TodoForm
            todo={editingTodo}
            onSuccess={handleTodoUpdated}
            onCancel={() => setEditingTodo(null)}
          />
        </Modal>
      )}
    </div>
  );
});

TodoDashboard.displayName = "TodoDashboard";

// Default export for the main dashboard
export default TodoDashboard;

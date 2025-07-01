import React, { useState } from "react";
import styles from "./styles.module.css";
import {
  Button,
  Input,
  Textarea,
  Select,
  ErrorAlert,
} from "@/web/shared/components";
import { useCreateTodo, useUpdateTodo } from "../../hooks/useTodos";
import type {
  Todo,
  TodoPriority,
  TodoCategory,
  CreateTodoInput,
  UpdateTodoInput,
} from "@/web/shared/types";

interface TodoFormProps {
  todo?: Todo;
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
    subtasks: isEditing ? [] : [""], // Don't edit subtasks in edit mode for simplicity
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = "Due date must be in the future";
    }

    if (
      formData.estimatedMinutes &&
      isNaN(parseInt(formData.estimatedMinutes))
    ) {
      newErrors.estimatedMinutes = "Must be a valid number";
    }

    if (formData.actualMinutes && isNaN(parseInt(formData.actualMinutes))) {
      newErrors.actualMinutes = "Must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

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
        onSuccess: () => {
          onSuccess();
          resetForm();
        },
        onError: (error) => {
          setErrors({ general: error.message });
        },
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
        onSuccess: () => {
          onSuccess();
          resetForm();
        },
        onError: (error) => {
          setErrors({ general: error.message });
        },
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      category: "personal",
      dueDate: "",
      tags: "",
      estimatedMinutes: "",
      actualMinutes: "",
      subtasks: [""],
    });
    setErrors({});
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
    <div className={styles.form}>
      <h3 className={styles.title}>
        {isEditing ? "Edit Todo" : "Create New Todo"}
      </h3>

      {errors.general && <ErrorAlert message={errors.general} />}

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        <div className={styles.formRow}>
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) =>
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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
            }
            error={errors.dueDate}
          />
        </div>

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Enter todo description"
          rows={3}
        />

        <div className={styles.formRow3}>
          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) =>
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
            onChange={(e) =>
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
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                estimatedMinutes: e.target.value,
              }))
            }
            placeholder="Minutes"
            min="1"
            error={errors.estimatedMinutes}
          />
        </div>

        {isEditing && (
          <Input
            type="number"
            label="Actual Minutes"
            value={formData.actualMinutes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                actualMinutes: e.target.value,
              }))
            }
            placeholder="Actual minutes spent"
            min="0"
            error={errors.actualMinutes}
          />
        )}

        <Input
          label="Tags (comma separated)"
          value={formData.tags}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, tags: e.target.value }))
          }
          placeholder="work, urgent, meeting"
        />

        {!isEditing && (
          <div className={styles.subtasksSection}>
            <div className={styles.subtasksHeader}>
              <span className={styles.subtasksLabel}>Subtasks</span>
              <button
                type="button"
                onClick={addSubtask}
                className={styles.addSubtaskBtn}
              >
                + Add Subtask
              </button>
            </div>

            {formData.subtasks.map((subtask, index) => (
              <div key={index} className={styles.subtaskRow}>
                <input
                  type="text"
                  value={subtask}
                  onChange={(e) => updateSubtask(index, e.target.value)}
                  className={styles.subtaskInput}
                  placeholder="Subtask title"
                />
                {formData.subtasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSubtask(index)}
                    className={styles.removeSubtaskBtn}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={isLoading}>
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

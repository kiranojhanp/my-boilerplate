import React, { useState, useMemo } from "react";
import ReactDOM from "react-dom/client";
import superjson from "superjson";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCReact,
  createWSClient,
  httpLink,
  splitLink,
  wsLink,
} from "@trpc/react-query";
import type { AppRouter } from "../server/trpc/router";

const trpc = createTRPCReact<AppRouter>();

// Types based on your schemas
type TodoPriority = "low" | "medium" | "high" | "urgent";
type TodoStatus = "pending" | "in_progress" | "completed" | "cancelled";
type TodoCategory = "personal" | "work" | "shopping" | "health" | "learning" | "other";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  priority: TodoPriority;
  status: TodoStatus;
  category: TodoCategory;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  tags: string[] | null;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  subtasks: Subtask[];
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition: (op) => op.type === "subscription",
          true: wsLink({
            client: createWSClient({
              url: "ws://localhost:3000/trpc",
            }),
            transformer: superjson,
          }),
          false: httpLink({
            url: "http://localhost:3000/trpc",
            transformer: superjson,
          }),
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <TodoApp />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

function TodoApp() {
  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <Header />
      <TodoDashboard />
    </div>
  );
}

function Header() {
  const { data: stats } = trpc.todo.getStats.useQuery();

  return (
    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#2d3748' }}>📝 Todo Manager</h1>
      <p style={{ color: '#718096', fontSize: '1.1rem', marginBottom: '20px' }}>Organize your tasks efficiently</p>
      
      {stats && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <StatCard label="Total" value={stats.total} color="#4a90e2" />
          <StatCard label="Pending" value={stats.pending} color="#f39c12" />
          <StatCard label="In Progress" value={stats.inProgress} color="#3498db" />
          <StatCard label="Completed" value={stats.completed} color="#27ae60" />
          <StatCard label="Overdue" value={stats.overdue} color="#e74c3c" />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ 
      background: color, 
      color: 'white', 
      padding: '10px 20px', 
      borderRadius: '8px', 
      minWidth: '80px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</div>
      <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{label}</div>
    </div>
  );
}

function TodoDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    status: '' as TodoStatus | '',
    priority: '' as TodoPriority | '',
    category: '' as TodoCategory | '',
    search: '',
  });

  const { data: todosData, isLoading, refetch } = trpc.todo.list.useQuery({
    ...filters,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    category: filters.category || undefined,
    search: filters.search || undefined,
  });

  const utils = trpc.useUtils();

  const handleTodoCreated = () => {
    setShowCreateForm(false);
    refetch();
    utils.todo.getStats.invalidate();
  };

  const handleTodoUpdated = () => {
    refetch();
    utils.todo.getStats.invalidate();
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <FilterPanel filters={filters} onFiltersChange={setFilters} />
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            background: showCreateForm ? '#e74c3c' : '#27ae60',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          {showCreateForm ? '✕ Cancel' : '+ Add Todo'}
        </button>
      </div>

      {showCreateForm && (
        <CreateTodoForm onSuccess={handleTodoCreated} onCancel={() => setShowCreateForm(false)} />
      )}

      <div style={{ marginTop: '20px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>Loading todos...</div>
        ) : !todosData?.todos.length ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
            No todos found. {filters.search || filters.status || filters.priority || filters.category ? 'Try adjusting your filters.' : 'Create your first todo!'}
          </div>
        ) : (
          <TodoList todos={todosData.todos} onTodoUpdated={handleTodoUpdated} />
        )}
      </div>
    </div>
  );
}

function FilterPanel({ filters, onFiltersChange }: {
  filters: {
    status: TodoStatus | '';
    priority: TodoPriority | '';
    category: TodoCategory | '';
    search: string;
  };
  onFiltersChange: (filters: any) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
      <input
        type="text"
        placeholder="Search todos..."
        value={filters.search}
        onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        style={{
          padding: '8px 12px',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '0.9rem',
          minWidth: '200px'
        }}
      />
      
      <select
        value={filters.status}
        onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as TodoStatus | '' })}
        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' }}
      >
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <select
        value={filters.priority}
        onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value as TodoPriority | '' })}
        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' }}
      >
        <option value="">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="urgent">Urgent</option>
      </select>

      <select
        value={filters.category}
        onChange={(e) => onFiltersChange({ ...filters, category: e.target.value as TodoCategory | '' })}
        style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' }}
      >
        <option value="">All Categories</option>
        <option value="personal">Personal</option>
        <option value="work">Work</option>
        <option value="shopping">Shopping</option>
        <option value="health">Health</option>
        <option value="learning">Learning</option>
        <option value="other">Other</option>
      </select>
    </div>
  );
}

function CreateTodoForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TodoPriority,
    category: 'personal' as TodoCategory,
    dueDate: '',
    tags: '',
    estimatedMinutes: '',
    subtasks: ['']
  });

  const createTodo = trpc.todo.create.useMutation({
    onSuccess: () => {
      onSuccess();
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'personal',
        dueDate: '',
        tags: '',
        estimatedMinutes: '',
        subtasks: ['']
      });
    },
    onError: (error) => {
      alert('Error creating todo: ' + error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const subtasksArray = formData.subtasks
      .filter(subtask => subtask.trim().length > 0)
      .map(title => ({ title: title.trim() }));

    createTodo.mutate({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      category: formData.category,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      tags: tagsArray,
      estimatedMinutes: formData.estimatedMinutes ? parseInt(formData.estimatedMinutes) : undefined,
      subtasks: subtasksArray
    });
  };

  const addSubtask = () => {
    setFormData(prev => ({ ...prev, subtasks: [...prev.subtasks, ''] }));
  };

  const updateSubtask = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map((subtask, i) => i === index ? value : subtask)
    }));
  };

  const removeSubtask = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  return (
    <div style={{
      background: '#f8f9fa',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2d3748' }}>Create New Todo</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              placeholder="Enter todo title"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
              Due Date
            </label>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '1rem',
              minHeight: '80px',
              resize: 'vertical'
            }}
            placeholder="Enter todo description"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TodoPriority }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TodoCategory }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="shopping">Shopping</option>
              <option value="health">Health</option>
              <option value="learning">Learning</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
              Estimated Minutes
            </label>
            <input
              type="number"
              value={formData.estimatedMinutes}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedMinutes: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              placeholder="Minutes"
              min="1"
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
            placeholder="work, urgent, meeting"
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontWeight: '500', color: '#4a5568' }}>Subtasks</label>
            <button
              type="button"
              onClick={addSubtask}
              style={{
                background: '#4299e1',
                color: 'white',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.8rem'
              }}
            >
              + Add Subtask
            </button>
          </div>
          
          {formData.subtasks.map((subtask, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={subtask}
                onChange={(e) => updateSubtask(index, e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}
                placeholder="Subtask title"
              />
              {formData.subtasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSubtask(index)}
                  style={{
                    background: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: '#a0aec0',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createTodo.isPending}
            style={{
              background: createTodo.isPending ? '#a0aec0' : '#27ae60',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: createTodo.isPending ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            {createTodo.isPending ? 'Creating...' : 'Create Todo'}
          </button>
        </div>
      </form>
    </div>
  );
}

function TodoList({ todos, onTodoUpdated }: { todos: Todo[]; onTodoUpdated: () => void }) {
  return (
    <div style={{ display: 'grid', gap: '15px' }}>
      {todos.map((todo) => (
        <TodoCard key={todo.id} todo={todo} onTodoUpdated={onTodoUpdated} />
      ))}
    </div>
  );
}

function TodoCard({ todo, onTodoUpdated }: { todo: Todo; onTodoUpdated: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const updateTodo = trpc.todo.update.useMutation({
    onSuccess: () => {
      onTodoUpdated();
      setIsEditing(false);
    },
    onError: (error) => {
      alert('Error updating todo: ' + error.message);
    }
  });

  const deleteTodo = trpc.todo.delete.useMutation({
    onSuccess: () => {
      onTodoUpdated();
    },
    onError: (error) => {
      alert('Error deleting todo: ' + error.message);
    }
  });

  const handleStatusChange = (newStatus: TodoStatus) => {
    updateTodo.mutate({
      id: todo.id,
      status: newStatus
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this todo?')) {
      deleteTodo.mutate({ id: todo.id });
    }
  };

  const priorityColors = {
    low: '#48bb78',
    medium: '#ed8936',
    high: '#f56565',
    urgent: '#e53e3e'
  };

  const statusColors = {
    pending: '#ed8936',
    in_progress: '#4299e1',
    completed: '#48bb78',
    cancelled: '#a0aec0'
  };

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && todo.status !== 'completed';

  return (
    <div style={{
      background: 'white',
      border: `1px solid ${isOverdue ? '#f56565' : '#e2e8f0'}`,
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      {isOverdue && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#f56565',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.7rem',
          fontWeight: 'bold'
        }}>
          OVERDUE
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: '0 0 10px 0', 
            color: '#2d3748',
            textDecoration: todo.status === 'completed' ? 'line-through' : 'none',
            opacity: todo.status === 'completed' ? 0.7 : 1
          }}>
            {todo.title}
          </h3>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <Badge color={priorityColors[todo.priority]} label={`${todo.priority.toUpperCase()} Priority`} />
            <Badge color={statusColors[todo.status]} label={todo.status.replace('_', ' ').toUpperCase()} />
            <Badge color="#805ad5" label={todo.category.toUpperCase()} />
          </div>

          {todo.description && (
            <p style={{ color: '#718096', margin: '10px 0', lineHeight: '1.5' }}>
              {todo.description}
            </p>
          )}

          {todo.tags && todo.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
              {todo.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    background: '#edf2f7',
                    color: '#4a5568',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#718096' }}>
            {todo.dueDate && (
              <span>
                📅 Due: {new Date(todo.dueDate).toLocaleDateString()} {new Date(todo.dueDate).toLocaleTimeString()}
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

        <div style={{ display: 'flex', gap: '5px', marginLeft: '15px' }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: '#edf2f7',
              border: 'none',
              padding: '8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              color: '#4a5568'
            }}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: '#4299e1',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Edit
          </button>
          
          <button
            onClick={handleDelete}
            disabled={deleteTodo.isPending}
            style={{
              background: '#e53e3e',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: deleteTodo.isPending ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              opacity: deleteTodo.isPending ? 0.7 : 1
            }}
          >
            {deleteTodo.isPending ? '...' : 'Delete'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <StatusButton 
          status="pending" 
          currentStatus={todo.status} 
          onStatusChange={handleStatusChange}
          disabled={updateTodo.isPending}
        />
        <StatusButton 
          status="in_progress" 
          currentStatus={todo.status} 
          onStatusChange={handleStatusChange}
          disabled={updateTodo.isPending}
        />
        <StatusButton 
          status="completed" 
          currentStatus={todo.status} 
          onStatusChange={handleStatusChange}
          disabled={updateTodo.isPending}
        />
        <StatusButton 
          status="cancelled" 
          currentStatus={todo.status} 
          onStatusChange={handleStatusChange}
          disabled={updateTodo.isPending}
        />
      </div>

      {isExpanded && todo.subtasks.length > 0 && (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#4a5568', fontSize: '0.9rem' }}>
            Subtasks ({todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length})
          </h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {todo.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  background: '#f8f9fa',
                  borderRadius: '4px'
                }}
              >
                <span style={{ fontSize: '0.8rem' }}>
                  {subtask.completed ? '✅' : '⚪'}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: '0.9rem',
                    textDecoration: subtask.completed ? 'line-through' : 'none',
                    opacity: subtask.completed ? 0.7 : 1,
                    color: '#4a5568'
                  }}
                >
                  {subtask.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isExpanded && (
        <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#718096' }}>
          <div>Created: {new Date(todo.createdAt).toLocaleString()}</div>
          <div>Updated: {new Date(todo.updatedAt).toLocaleString()}</div>
          {todo.completedAt && (
            <div>Completed: {new Date(todo.completedAt).toLocaleString()}</div>
          )}
        </div>
      )}

      {isEditing && (
        <EditTodoModal
          todo={todo}
          onSave={(updatedData) => {
            updateTodo.mutate({ id: todo.id, ...updatedData });
          }}
          onCancel={() => setIsEditing(false)}
          isLoading={updateTodo.isPending}
        />
      )}
    </div>
  );
}

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span style={{
      background: color,
      color: 'white',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '0.7rem',
      fontWeight: 'bold'
    }}>
      {label}
    </span>
  );
}

function StatusButton({ 
  status, 
  currentStatus, 
  onStatusChange, 
  disabled 
}: { 
  status: TodoStatus; 
  currentStatus: TodoStatus; 
  onStatusChange: (status: TodoStatus) => void;
  disabled: boolean;
}) {
  const statusConfig = {
    pending: { label: 'Pending', color: '#ed8936' },
    in_progress: { label: 'In Progress', color: '#4299e1' },
    completed: { label: 'Complete', color: '#48bb78' },
    cancelled: { label: 'Cancel', color: '#a0aec0' }
  };

  const config = statusConfig[status];
  const isActive = currentStatus === status;

  return (
    <button
      onClick={() => onStatusChange(status)}
      disabled={disabled || isActive}
      style={{
        background: isActive ? config.color : 'white',
        color: isActive ? 'white' : config.color,
        border: `1px solid ${config.color}`,
        padding: '4px 8px',
        borderRadius: '4px',
        cursor: disabled || isActive ? 'not-allowed' : 'pointer',
        fontSize: '0.8rem',
        opacity: disabled ? 0.7 : 1,
        fontWeight: isActive ? 'bold' : 'normal'
      }}
    >
      {config.label}
    </button>
  );
}

function EditTodoModal({ 
  todo, 
  onSave, 
  onCancel, 
  isLoading 
}: { 
  todo: Todo; 
  onSave: (data: any) => void; 
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    title: todo.title,
    description: todo.description || '',
    priority: todo.priority,
    category: todo.category,
    dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : '',
    tags: todo.tags ? todo.tags.join(', ') : '',
    estimatedMinutes: todo.estimatedMinutes?.toString() || '',
    actualMinutes: todo.actualMinutes?.toString() || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    onSave({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      category: formData.category,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      tags: tagsArray,
      estimatedMinutes: formData.estimatedMinutes ? parseInt(formData.estimatedMinutes) : undefined,
      actualMinutes: formData.actualMinutes ? parseInt(formData.actualMinutes) : undefined
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '20px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2d3748' }}>Edit Todo</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem',
                minHeight: '80px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TodoPriority }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TodoCategory }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="personal">Personal</option>
                <option value="work">Work</option>
                <option value="shopping">Shopping</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
              Due Date
            </label>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
                Estimated Minutes
              </label>
              <input
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedMinutes: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                min="1"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
                Actual Minutes
              </label>
              <input
                type="number"
                value={formData.actualMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, actualMinutes: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
                min="0"
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#4a5568' }}>
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                background: '#a0aec0',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: isLoading ? '#a0aec0' : '#4299e1',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '1rem'
              }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const el = document.getElementById("root");

if (!el) {
  throw new Error("No root element");
}

const root = ReactDOM.createRoot(el);

root.render(<App />);

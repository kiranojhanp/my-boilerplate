/**
 * 🛣️ TODO ROUTES
 * Route configuration for todo feature
 */

import { lazy } from 'react';

// Lazy load the TodoDashboard for better performance
const LazyTodoDashboard = lazy(() => 
  import('./frontend').then(module => ({ default: module.TodoDashboard }))
);

export const todoRoutes = [
  {
    path: "todos",
    element: <LazyTodoDashboard />,
  },
  // Future todo-related routes can be added here
  // {
  //   path: "todos/:id",
  //   element: <TodoDetail />,
  // },
];

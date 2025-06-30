import React from "react";
import type { RouteConfig, RouteMetadata } from "../../shared/types/routes";
import { TodoDashboard } from "./components/TodoDashboard";

// Route metadata for navigation
export const todoRouteMetadata: RouteMetadata[] = [
  {
    title: "Dashboard",
    path: "/",
    showInNav: true,
    description: "Main todo dashboard",
  },
  {
    title: "All Todos",
    path: "/todos",
    showInNav: true,
    description: "View all todos",
  },
];

// Todo feature routes
export const todoRoutes: RouteConfig[] = [
  {
    index: true,
    element: <TodoDashboard />,
  },
  {
    path: "todos",
    element: <TodoDashboard />,
  },
  // Future todo-related routes can be added here
  // {
  //   path: "todos/:id",
  //   element: <TodoDetail />,
  // },
  // {
  //   path: "todos/:id/edit",
  //   element: <TodoEdit />,
  // },
];

import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  NavLink,
} from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { todoRoutes } from "@/features/todo/routes";

// Simple layout components
function AppLayout() {
  return (
    <div>
      <nav style={{ padding: "1rem", borderBottom: "1px solid #ccc" }}>
        <NavLink
          to="/"
          style={({ isActive }) => ({
            marginRight: "1rem",
            textDecoration: "none",
            color: isActive ? "#0056b3" : "#007bff",
            fontWeight: isActive ? "bold" : "normal",
          })}
          end
        >
          Home
        </NavLink>
        <NavLink
          to="/todos"
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive ? "#0056b3" : "#007bff",
            fontWeight: isActive ? "bold" : "normal",
          })}
        >
          Todos
        </NavLink>
      </nav>
      <main style={{ padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
}

function ErrorLayout() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Oops! Something went wrong</h1>
      <p>Please try again later.</p>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}

function HomePage() {
  return (
    <div>
      <h1>Welcome to Basic API</h1>
      <p>A simple todo application built with the LLM-optimized structure.</p>
    </div>
  );
}

// Build routes dynamically from feature routes
function buildRoutes(): RouteObject[] {
  return [
    {
      path: "/",
      element: <AppLayout />,
      errorElement: <ErrorLayout />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        ...todoRoutes,
        {
          path: "*",
          element: <NotFoundPage />,
        },
      ],
    },
  ];
}

// Cache routes for performance
const routes = buildRoutes();

// Create browser router for client-side
export function createAppRouter() {
  return createBrowserRouter(routes);
}

// Router provider component
interface AppRouterProps {
  router: ReturnType<typeof createAppRouter>;
}

export function AppRouter({ router }: AppRouterProps) {
  return <RouterProvider router={router} />;
}

export { routes };

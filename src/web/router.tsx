import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { TodoDashboard } from "./features/todo";
import { About } from "./features/about";
import { ErrorAlert, Navigation } from "./shared/components";

// Layout component
function Layout() {
  return (
    <div
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "20px",
        color: "#2d3748",
      }}
    >
      <Navigation />
      <Outlet />
    </div>
  );
}

// Define routes
const routes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: (
      <div style={{ padding: "20px" }}>
        <ErrorAlert message="Something went wrong loading this page." />
      </div>
    ),
    children: [
      {
        index: true,
        element: <TodoDashboard />,
      },
      {
        path: "todos",
        element: <TodoDashboard />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "*",
        element: (
          <div style={{ padding: "20px", textAlign: "center" }}>
            <h2>Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/" style={{ color: "var(--color-primary)" }}>
              Go back home
            </a>
          </div>
        ),
      },
    ],
  },
];

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

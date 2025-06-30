import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import { mergeFeatureRoutes } from "./router/registry";
import { AppLayout, ErrorLayout, NotFoundPage } from "./router/layouts";

// Build routes dynamically from feature routes
function buildRoutes(): RouteObject[] {
  const featureRoutes = mergeFeatureRoutes();

  return [
    {
      path: "/",
      element: <AppLayout />,
      errorElement: <ErrorLayout />,
      children: [
        ...featureRoutes,
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

import React, { lazy, Suspense } from "react";
import type { RouteConfig, RouteMetadata } from "@/web/shared/types/routes";
import { LoadingSpinner } from "@/web/shared/components/LoadingSpinner";

// Lazy load components for code splitting
const Settings = lazy(() =>
  import("./index").then((m) => ({ default: m.Settings }))
);

// Wrapper component for Suspense
const LazySettings = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <Settings />
  </Suspense>
);

// Route metadata for navigation
export const settingsRouteMetadata: RouteMetadata[] = [
  {
    title: "Settings",
    path: "/settings",
    showInNav: true,
    description: "Application settings and preferences",
  },
];

// Settings feature routes
export const settingsRoutes: RouteConfig[] = [
  {
    path: "settings",
    element: <LazySettings />,
  },
  // You can easily add sub-routes:
  // {
  //   path: "settings/profile",
  //   element: <ProfileSettings />,
  // },
  // {
  //   path: "settings/notifications",
  //   element: <NotificationSettings />,
  // },
];

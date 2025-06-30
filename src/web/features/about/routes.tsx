import React, { lazy, Suspense } from "react";
import type { RouteConfig, RouteMetadata } from "@/web/shared/types/routes";
import { LoadingSpinner } from "@/web/shared/components/LoadingSpinner";

// Lazy load components for code splitting
const About = lazy(() => import("./index").then((m) => ({ default: m.About })));

// Wrapper component for Suspense
const LazyAbout = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <About />
  </Suspense>
);

// Route metadata for navigation
export const aboutRouteMetadata: RouteMetadata[] = [
  {
    title: "About",
    path: "/about",
    showInNav: true,
    description: "About the application",
  },
];

// About feature routes
export const aboutRoutes: RouteConfig[] = [
  {
    path: "about",
    element: <LazyAbout />,
  },
];

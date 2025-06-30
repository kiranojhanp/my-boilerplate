import React from "react";
import type { RouteConfig, RouteMetadata } from "@/web/shared/types/routes";
import { About } from "./index";

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
    element: <About />,
  },
];

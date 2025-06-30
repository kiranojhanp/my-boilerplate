import React from "react";
import type { RouteConfig, RouteMetadata } from "../../shared/types/routes";
import { Settings } from "./index";

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
    element: <Settings />,
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

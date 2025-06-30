import type {
  RouteConfig,
  RouteMetadata,
  FeatureRoutes,
} from "@/web/shared/types/routes";

// Import feature routes
import { todoRoutes, todoRouteMetadata } from "@/web/features/todo/routes";
import { aboutRoutes, aboutRouteMetadata } from "@/web/features/about/routes";
import {
  settingsRoutes,
  settingsRouteMetadata,
} from "@/web/features/settings/routes";

// Registry of all feature routes
const featureRoutes: FeatureRoutes[] = [
  {
    name: "todo",
    routes: todoRoutes,
  },
  {
    name: "about",
    routes: aboutRoutes,
  },
  {
    name: "settings",
    routes: settingsRoutes,
  },
  // Add new features here:
  // {
  //   name: "users",
  //   routes: userRoutes,
  // },
];

// Collect all route metadata for navigation
export const allRouteMetadata: RouteMetadata[] = [
  ...todoRouteMetadata,
  ...aboutRouteMetadata,
  ...settingsRouteMetadata,
  // Add new feature metadata here automatically
];

// Utility function to merge all feature routes
export function mergeFeatureRoutes(): RouteConfig[] {
  return featureRoutes.flatMap((feature) => feature.routes);
}

// Get routes by feature name
export function getRoutesByFeature(featureName: string): RouteConfig[] {
  const feature = featureRoutes.find((f) => f.name === featureName);
  return feature ? feature.routes : [];
}

// Get navigation routes (routes that should show in navigation)
export function getNavigationRoutes(): RouteMetadata[] {
  return allRouteMetadata.filter((route) => route.showInNav);
}

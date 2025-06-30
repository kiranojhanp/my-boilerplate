import type {
  RouteConfig,
  RouteMetadata,
  FeatureRoutes,
} from "@/web/shared/types/routes";

// Import feature routes
import { todoRoutes, todoRouteMetadata } from "@/features/todo/web/routes";

// Registry of all feature routes
const featureRoutes: FeatureRoutes[] = [
  {
    name: "todo",
    routes: todoRoutes,
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

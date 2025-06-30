import type { RouteObject } from "react-router-dom";

// Base route configuration type
export type RouteConfig = RouteObject;

// Feature route definition interface
export interface FeatureRoutes {
  name: string;
  routes: RouteConfig[];
}

// Route metadata for navigation and other purposes
export interface RouteMetadata {
  title: string;
  path: string;
  icon?: string;
  showInNav?: boolean;
  requiresAuth?: boolean;
  description?: string;
}

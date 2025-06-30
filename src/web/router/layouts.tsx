import React from "react";
import { Outlet } from "react-router-dom";
import { Navigation } from "../shared/components";

// Main layout component
export function AppLayout() {
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

// Error boundary layout
export function ErrorLayout() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Something went wrong</h2>
      <p>An error occurred while loading this page.</p>
      <a href="/" style={{ color: "var(--color-primary)" }}>
        Go back home
      </a>
    </div>
  );
}

// 404 Not Found component
export function NotFoundPage() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/" style={{ color: "var(--color-primary)" }}>
        Go back home
      </a>
    </div>
  );
}

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getNavigationRoutes } from "../../../router/registry";

export function Navigation() {
  const location = useLocation();
  const navigationRoutes = getNavigationRoutes();

  const navStyle: React.CSSProperties = {
    display: "flex",
    gap: "var(--spacing-lg)",
    marginBottom: "var(--spacing-xl)",
    padding: "var(--spacing-md) 0",
    borderBottom: "1px solid var(--color-gray-200)",
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: "none",
    color: "var(--color-gray-600)",
    fontWeight: "var(--font-weight-medium)",
    padding: "var(--spacing-sm) var(--spacing-md)",
    borderRadius: "var(--radius-md)",
    transition: "var(--transition-fast)",
  };

  const activeLinkStyle: React.CSSProperties = {
    ...linkStyle,
    color: "var(--color-primary)",
    backgroundColor: "var(--color-primary-light)",
  };

  return (
    <nav style={navStyle}>
      {navigationRoutes.map((route) => (
        <Link
          key={route.path}
          to={route.path}
          style={location.pathname === route.path ? activeLinkStyle : linkStyle}
          title={route.description}
        >
          {route.title}
        </Link>
      ))}
    </nav>
  );
}

import React from "react";
import { Link, useLocation } from "react-router-dom";

export function Navigation() {
  const location = useLocation();

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
      <Link
        to="/"
        style={location.pathname === "/" ? activeLinkStyle : linkStyle}
      >
        Dashboard
      </Link>
      <Link
        to="/todos"
        style={location.pathname === "/todos" ? activeLinkStyle : linkStyle}
      >
        All Todos
      </Link>
      <Link
        to="/about"
        style={location.pathname === "/about" ? activeLinkStyle : linkStyle}
      >
        About
      </Link>
    </nav>
  );
}

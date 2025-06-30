import React from "react";
import { Link } from "react-router-dom";

export function About() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 20px" }}>
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: "bold",
          marginBottom: "24px",
          color: "var(--color-text-primary)",
        }}
      >
        About Todo Manager
      </h1>

      <div
        style={{
          fontSize: "1.1rem",
          lineHeight: "1.6",
          color: "var(--color-text-secondary)",
          marginBottom: "32px",
        }}
      >
        <p style={{ marginBottom: "16px" }}>
          Welcome to Todo Manager, a modern task management application built
          with cutting-edge web technologies.
        </p>

        <p style={{ marginBottom: "16px" }}>
          This application demonstrates the power of React Router for
          client-side routing, providing smooth navigation without page reloads.
        </p>

        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            margin: "32px 0 16px 0",
            color: "var(--color-text-primary)",
          }}
        >
          Features
        </h2>

        <ul style={{ paddingLeft: "20px", marginBottom: "24px" }}>
          <li style={{ marginBottom: "8px" }}>
            Create, update, and delete todos
          </li>
          <li style={{ marginBottom: "8px" }}>Filter todos by status</li>
          <li style={{ marginBottom: "8px" }}>Real-time updates with tRPC</li>
          <li style={{ marginBottom: "8px" }}>
            Client-side routing with React Router
          </li>
          <li style={{ marginBottom: "8px" }}>Modern, responsive design</li>
        </ul>

        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            margin: "32px 0 16px 0",
            color: "var(--color-text-primary)",
          }}
        >
          Technology Stack
        </h2>

        <ul style={{ paddingLeft: "20px", marginBottom: "32px" }}>
          <li style={{ marginBottom: "8px" }}>React 18 with TypeScript</li>
          <li style={{ marginBottom: "8px" }}>
            React Router DOM for client-side routing
          </li>
          <li style={{ marginBottom: "8px" }}>tRPC for type-safe API calls</li>
          <li style={{ marginBottom: "8px" }}>
            TanStack Query for data fetching
          </li>
          <li style={{ marginBottom: "8px" }}>Bun as runtime and bundler</li>
          <li style={{ marginBottom: "8px" }}>Drizzle ORM with SQLite</li>
        </ul>
      </div>

      <Link
        to="/"
        style={{
          display: "inline-block",
          padding: "12px 24px",
          backgroundColor: "var(--color-primary)",
          color: "white",
          textDecoration: "none",
          borderRadius: "8px",
          fontWeight: "500",
          transition: "background-color 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-primary-dark)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-primary)";
        }}
      >
        Back to Todos
      </Link>
    </div>
  );
}

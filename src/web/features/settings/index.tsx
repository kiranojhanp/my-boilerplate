import React from "react";

export function Settings() {
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
        Settings
      </h1>

      <div
        style={{
          fontSize: "1.1rem",
          lineHeight: "1.6",
          color: "var(--color-text-secondary)",
        }}
      >
        <p>
          This is an example of how easy it is to add new features with the
          scalable routing system.
        </p>

        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: "600",
            margin: "32px 0 16px 0",
            color: "var(--color-text-primary)",
          }}
        >
          Application Preferences
        </h2>

        <div
          style={{
            padding: "16px",
            background: "var(--color-gray-50)",
            borderRadius: "8px",
          }}
        >
          <p>Settings content would go here...</p>
        </div>
      </div>
    </div>
  );
}

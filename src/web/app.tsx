import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, createTRPCClient, createQueryClient } from "./shared/lib/trpc";
import { TodoDashboard } from "./features/todo";

function App() {
  const [queryClient] = useState(() => createQueryClient());
  const [trpcClient] = useState(() => createTRPCClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
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
          <TodoDashboard />
        </div>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const el = document.getElementById("root");

if (!el) {
  throw new Error("No root element");
}

const root = ReactDOM.createRoot(el);
root.render(<App />);

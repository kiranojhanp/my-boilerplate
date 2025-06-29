import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import {
  QueryClientProvider,
  QueryClient,
  HydrationBoundary,
} from "@tanstack/react-query";
import { trpc, createTRPCClient, createQueryClient } from "./shared/lib/trpc";
import { TodoDashboard } from "./features/todo";

function App() {
  const [queryClient] = useState(() => createQueryClient());
  const [trpcClient] = useState(() => createTRPCClient());

  // Get dehydrated state from SSR if available
  const dehydratedState = (globalThis as any).__DEHYDRATED_STATE__;

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={dehydratedState}>
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
        </HydrationBoundary>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const el = document.getElementById("root");

if (!el) {
  throw new Error("No root element");
}

const root = ReactDOM.createRoot(el);

// Use hydrateRoot for SSR, createRoot for CSR
if ((globalThis as any).__DEHYDRATED_STATE__) {
  root.render(<App />);
} else {
  root.render(<App />);
}

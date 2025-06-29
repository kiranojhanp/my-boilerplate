import React from "react";
import ReactDOMServer from "react-dom/server";
import {
  QueryClient,
  QueryClientProvider,
  dehydrate,
} from "@tanstack/react-query";
import { createSSRTRPCClient, createSSRQueryClient } from "./shared/lib/ssr";
import { TodoDashboard } from "./features/todo";
import { trpc } from "./shared/lib/trpc";
import type { TodoFilters } from "./shared/types";

interface SSRAppProps {
  queryClient: QueryClient;
  trpcClient: ReturnType<typeof createSSRTRPCClient>;
  dehydratedState?: any;
}

function SSRApp({ queryClient, trpcClient, dehydratedState }: SSRAppProps) {
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

export async function renderSSR(baseUrl: string = "http://localhost:3000") {
  const queryClient = createSSRQueryClient();
  const trpcClient = createSSRTRPCClient(baseUrl);

  // Pre-fetch initial data on the server
  try {
    // Fetch todos and stats for initial render
    const filters: TodoFilters = {};

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: [["todo", "list"], { input: filters, type: "query" }],
        queryFn: () => trpcClient.todo.list.query(filters),
      }),
      queryClient.prefetchQuery({
        queryKey: [["todo", "getStats"], { type: "query" }],
        queryFn: () => trpcClient.todo.getStats.query(),
      }),
    ]);
  } catch (error) {
    console.error("SSR prefetch error:", error);
    // Continue with empty state if prefetch fails
  }

  // Dehydrate the query client state for client hydration
  const dehydratedState = dehydrate(queryClient);

  // Render the app to string
  const html = ReactDOMServer.renderToString(
    <SSRApp
      queryClient={queryClient}
      trpcClient={trpcClient}
      dehydratedState={dehydratedState}
    />
  );

  return {
    html,
    dehydratedState,
  };
}

export { SSRApp };

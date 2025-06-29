import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../../server/trpc/router";

// Create a server-side tRPC client for SSR data fetching
export function createSSRTRPCClient(baseUrl: string = "http://localhost:3000") {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
        transformer: superjson,
      }),
    ],
  });
}

// Create a QueryClient for SSR
export function createSSRQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: false, // Don't retry on server
      },
    },
  });
}

// Helper to dehydrate query client state for client hydration
export function dehydrateQueryClient(queryClient: QueryClient) {
  return {
    queries: queryClient
      .getQueryCache()
      .getAll()
      .map((query) => ({
        queryKey: query.queryKey,
        queryHash: query.queryHash,
        state: query.state,
      })),
    mutations: [],
  };
}

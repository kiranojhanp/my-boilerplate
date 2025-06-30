import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCReact,
  createWSClient,
  httpLink,
  splitLink,
  wsLink,
} from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "@/server/trpc/router";

export const trpc = createTRPCReact<AppRouter>();

export function createTRPCClient() {
  return trpc.createClient({
    links: [
      splitLink({
        condition: (op) => op.type === "subscription",
        true: wsLink({
          client: createWSClient({
            url: "ws://localhost:3000/trpc",
          }),
          transformer: superjson,
        }),
        false: httpLink({
          url: "http://localhost:3000/trpc",
          transformer: superjson,
        }),
      }),
    ],
  });
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  });
}

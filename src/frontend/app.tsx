import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, createTRPCClient, createQueryClient } from "./utils";
import { AppRouter, createAppRouter } from "./router";
import "./styles.css";

function App() {
  const [queryClient] = useState(() => createQueryClient());
  const [trpcClient] = useState(() => createTRPCClient());
  const [router] = useState(() => createAppRouter());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppRouter router={router} />
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

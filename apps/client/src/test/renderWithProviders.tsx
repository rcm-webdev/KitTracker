import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { ReactElement, ReactNode } from "react";

interface WrapperOptions {
  initialEntries?: string[];
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

function makeWrapper({ initialEntries = ["/"] }: WrapperOptions) {
  const queryClient = makeQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries,
    ...renderOptions
  }: WrapperOptions & Omit<RenderOptions, "wrapper"> = {}
) {
  return render(ui, {
    wrapper: makeWrapper({ initialEntries }),
    ...renderOptions,
  });
}

export * from "@testing-library/react";

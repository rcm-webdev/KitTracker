import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { renderWithProviders } from "@/test/renderWithProviders";
import { server } from "@/test/msw/server";
import { mockBin } from "@/test/msw/handlers";
import BinNew from "./BinNew";

describe("BinNew", () => {
  it("shows error message when create fails", async () => {
    server.use(
      http.post("/api/bins", () =>
        HttpResponse.json({ error: "Name is required" }, { status: 400 })
      )
    );
    const user = userEvent.setup();
    renderWithProviders(<BinNew />);

    await user.type(screen.getByLabelText(/bin name/i), "My Bin");
    await user.click(screen.getByRole("button", { name: /create bin/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("submit button is disabled while mutation is in-flight", async () => {
    server.use(
      http.post("/api/bins", async () => {
        await new Promise((r) => setTimeout(r, 200));
        return HttpResponse.json(mockBin, { status: 201 });
      })
    );
    const user = userEvent.setup();
    renderWithProviders(<BinNew />);

    await user.type(screen.getByLabelText(/bin name/i), "My Bin");
    await user.click(screen.getByRole("button", { name: /create bin/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /creating/i })).toBeDisabled();
    });
  });
});

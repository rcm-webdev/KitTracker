import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/renderWithProviders";
import BinCard from "./BinCard";
import type { Bin } from "@strawhats/shared";

const bin: Bin = {
  id: "bin-1",
  userId: "user-1",
  name: "Garage Tools",
  location: "Garage",
  description: null,
  providerTags: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  items: [
    { id: "item-1", binId: "bin-1", name: "Hammer", description: null, createdAt: "2026-01-01T00:00:00.000Z" },
    { id: "item-2", binId: "bin-1", name: "Screwdriver", description: null, createdAt: "2026-01-01T00:00:00.000Z" },
  ],
};

describe("BinCard", () => {
  it("renders bin name and location", () => {
    renderWithProviders(<BinCard bin={bin} />);
    expect(screen.getByText("Garage Tools")).toBeInTheDocument();
    expect(screen.getByText("Garage")).toBeInTheDocument();
  });

  it("renders item count", () => {
    renderWithProviders(<BinCard bin={bin} />);
    expect(screen.getByText("2 supplies")).toBeInTheDocument();
  });

  it("renders 0 items when items array is empty", () => {
    renderWithProviders(<BinCard bin={{ ...bin, items: [] }} />);
    expect(screen.getByText("0 supplies")).toBeInTheDocument();
  });

  it("edit link points to /bins/:id/edit", () => {
    renderWithProviders(<BinCard bin={bin} />);
    expect(screen.getByRole("link", { name: /edit garage tools/i })).toHaveAttribute(
      "href",
      "/bins/bin-1/edit"
    );
  });
});

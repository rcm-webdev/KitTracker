import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import PrintLabel from "./PrintLabel";
import type { Bin } from "@kittracker/shared";

const bin: Bin = {
  id: "bin-1",
  userId: "user-1",
  name: "Tool Bin",
  location: "Workshop",
  description: "My tools",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  items: [
    { id: "item-1", binId: "bin-1", name: "Wrench", description: null, createdAt: "2026-01-01T00:00:00.000Z" },
  ],
};

describe("PrintLabel", () => {
  it("renders bin name and location", () => {
    render(<PrintLabel bin={bin} appUrl="https://app.example.com" />);
    expect(screen.getByText("Tool Bin")).toBeInTheDocument();
    expect(screen.getByText(/Workshop/)).toBeInTheDocument();
  });

  it("renders item count", () => {
    render(<PrintLabel bin={bin} appUrl="https://app.example.com" />);
    expect(screen.getByText(/1 item/)).toBeInTheDocument();
  });

  it("renders a canvas element for the QR code", () => {
    render(<PrintLabel bin={bin} appUrl="https://app.example.com" />);
    expect(screen.getByRole("img", { name: /qr code/i })).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import QRCode from "./QRCode";

describe("QRCode", () => {
  it("renders a canvas element", () => {
    render(<QRCode url="https://example.com/bins/bin-1" />);
    expect(screen.getByRole("img", { name: /qr code/i })).toBeInTheDocument();
  });

  it("renders without crashing given any URL string", () => {
    expect(() =>
      render(<QRCode url="https://anything.example.com/path?q=1#hash" />)
    ).not.toThrow();
  });
});

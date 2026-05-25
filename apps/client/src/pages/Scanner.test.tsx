import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test/renderWithProviders";
import Scanner from "./Scanner";

const mockStart = vi.fn();
const mockStop = vi.fn();
const mockGetState = vi.fn();

vi.mock("html5-qrcode", () => ({
  Html5Qrcode: vi.fn(function () {
    return { start: mockStart, stop: mockStop, getState: mockGetState };
  }),
  Html5QrcodeScannerState: { SCANNING: 2, PAUSED: 3 },
}));

describe("Scanner", () => {
  beforeEach(() => {
    mockStart.mockReset();
    mockStop.mockReset();
    mockGetState.mockReset();
    mockStop.mockResolvedValue(undefined);
    mockGetState.mockReturnValue(0);
  });

  it("renders the scanner container element", () => {
    mockStart.mockResolvedValue(undefined);
    renderWithProviders(<Scanner />);
    expect(document.getElementById("qr-scanner-container")).toBeInTheDocument();
  });

  it("shows an error message when camera permission is denied", async () => {
    mockStart.mockRejectedValue(new Error("Permission denied"));
    renderWithProviders(<Scanner />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/camera error/i);
    });
  });
});

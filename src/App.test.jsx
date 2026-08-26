import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";

vi.mock("./api/ncrs.js", async () => {
  const actual = await vi.importActual("./api/ncrs.js");
  return {
    ...actual,
    listNcrs: vi.fn(async () => []),
    createNcr: vi.fn(),
    updateNcrStatus: vi.fn(),
  };
});

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders NCR console branding and create form", async () => {
    render(<App />);
    expect(screen.getByText("NCR Console")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /drive nonconformance workflow/i })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: /create ncr/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("qa.inspector")).toBeInTheDocument();
  });
});

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";
import { listNcrs, updateNcrStatus } from "./api/ncrs.js";

vi.mock("./api/ncrs.js", async () => {
  const actual = await vi.importActual("./api/ncrs.js");
  return {
    ...actual,
    listNcrs: vi.fn(),
    createNcr: vi.fn(),
    updateNcrStatus: vi.fn(),
  };
});

const underReviewNcr = {
  id: 7,
  ncrNumber: "NCR-007",
  title: "Seal damage",
  reportedBy: "qa.inspector",
  severity: "HIGH",
  status: "UNDER_REVIEW",
  lotNumber: "LOT-42",
  updatedAt: "2026-08-26T05:00:00Z",
  containmentAction: null,
};

describe("App", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    listNcrs.mockResolvedValue([]);
  });

  it("renders NCR console branding and create form", async () => {
    render(<App />);
    expect(screen.getByText("NCR Console")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /drive nonconformance workflow/i })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: /create ncr/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("qa.inspector")).toBeInTheDocument();
  });

  it("blocks a CONTAINED transition until an action is entered", async () => {
    listNcrs.mockResolvedValue([underReviewNcr]);
    updateNcrStatus.mockResolvedValue({ ...underReviewNcr, status: "CONTAINED" });

    render(<App />);

    const action = await screen.findByLabelText("Containment action for NCR-007");
    const apply = screen.getByRole("button", { name: "Apply" });
    expect(action).toBeRequired();
    expect(action).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Containment action is required to move to CONTAINED.")).toBeInTheDocument();
    expect(apply).toBeDisabled();

    fireEvent.change(action, { target: { value: "Quarantined affected lot" } });
    expect(action).toHaveAttribute("aria-invalid", "false");
    expect(apply).toBeEnabled();
    fireEvent.click(apply);

    await waitFor(() =>
      expect(updateNcrStatus).toHaveBeenCalledWith(7, {
        status: "CONTAINED",
        note: null,
        containmentAction: "Quarantined affected lot",
      }),
    );
  });

  it("allows reuse of an existing containment action", async () => {
    listNcrs.mockResolvedValue([
      { ...underReviewNcr, containmentAction: "Existing quarantine instruction" },
    ]);
    updateNcrStatus.mockResolvedValue({ ...underReviewNcr, status: "CONTAINED" });

    render(<App />);

    await screen.findByLabelText("Containment action for NCR-007");
    expect(screen.getByText("The existing containment action will be reused.")).toBeInTheDocument();
    const apply = screen.getByRole("button", { name: "Apply" });
    expect(apply).toBeEnabled();
    fireEvent.click(apply);

    await waitFor(() =>
      expect(updateNcrStatus).toHaveBeenCalledWith(7, {
        status: "CONTAINED",
        note: null,
        containmentAction: "Existing quarantine instruction",
      }),
    );
  });
});

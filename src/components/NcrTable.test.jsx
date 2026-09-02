import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NcrTable from "./NcrTable.jsx";

describe("NcrTable", () => {
  it("shows API guidance when the list is empty due to an error", () => {
    render(
      <NcrTable
        ncrs={[]}
        busy={false}
        statusDrafts={{}}
        onDraftChange={vi.fn()}
        onTransition={vi.fn()}
        filter=""
        apiError
      />,
    );
    expect(screen.getByText(/qms-ncr-service on :8082/i)).toBeInTheDocument();
  });

  it("shows filter-specific guidance when no records match", () => {
    render(
      <NcrTable
        ncrs={[]}
        busy={false}
        statusDrafts={{}}
        onDraftChange={vi.fn()}
        onTransition={vi.fn()}
        filter="OPEN"
        apiError={false}
      />,
    );
    expect(screen.getByText(/No NCRs with status OPEN/i)).toBeInTheDocument();
  });
});

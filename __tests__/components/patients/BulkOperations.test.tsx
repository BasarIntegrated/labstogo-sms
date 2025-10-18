import BulkOperations from "@/components/patients/BulkOperations";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockProps = {
  selectedPatients: ["1", "2", "3"],
  onBulkUpdate: jest.fn(),
  onBulkDelete: jest.fn(),
  onBulkTag: jest.fn(),
  onExport: jest.fn(),
  onClearSelection: jest.fn(),
  isProcessing: false,
};

describe("BulkOperations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders when patients are selected", () => {
    render(<BulkOperations {...mockProps} />);

    expect(screen.getByText("3 patients selected")).toBeInTheDocument();
    expect(screen.getByText("Update Status")).toBeInTheDocument();
    expect(screen.getByText("Add Tags")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("does not render when no patients are selected", () => {
    render(<BulkOperations {...mockProps} selectedPatients={[]} />);

    expect(screen.queryByText("patients selected")).not.toBeInTheDocument();
  });

  it("handles bulk status update", async () => {
    render(<BulkOperations {...mockProps} />);

    const updateButton = screen.getByText("Update Status");
    fireEvent.click(updateButton);

    expect(screen.getByText("Bulk Operation")).toBeInTheDocument();

    const executeButton = screen.getByText("Execute");
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(mockProps.onBulkUpdate).toHaveBeenCalledWith(["1", "2", "3"], {
        status: "active",
      });
    });
  });

  it("handles bulk tag operations", async () => {
    render(<BulkOperations {...mockProps} />);

    const addTagsButton = screen.getByText("Add Tags");
    fireEvent.click(addTagsButton);

    const tagsInput = screen.getByPlaceholderText(
      "Enter tags separated by commas (e.g., vip, premium, new)"
    );
    fireEvent.change(tagsInput, { target: { value: "vip, premium" } });

    const executeButton = screen.getByText("Execute");
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(mockProps.onBulkTag).toHaveBeenCalledWith(
        ["1", "2", "3"],
        ["vip", "premium"],
        "add"
      );
    });
  });

  it("handles bulk delete with confirmation", async () => {
    // Mock window.confirm
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    render(<BulkOperations {...mockProps} />);

    const deleteButton = screen.getByText("Delete");
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByText("Delete");
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(mockProps.onBulkDelete).toHaveBeenCalledWith(["1", "2", "3"]);
    });

    confirmSpy.mockRestore();
  });

  it("handles export functionality", async () => {
    render(<BulkOperations {...mockProps} />);

    const exportButton = screen.getByText("Export");
    fireEvent.click(exportButton);

    const executeButton = screen.getByText("Execute");
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(mockProps.onExport).toHaveBeenCalledWith(["1", "2", "3"]);
    });
  });

  it("clears selection when clear button is clicked", () => {
    render(<BulkOperations {...mockProps} />);

    const clearButton = screen.getByRole("button", { name: "" });
    fireEvent.click(clearButton);

    expect(mockProps.onClearSelection).toHaveBeenCalled();
  });

  it("disables buttons when processing", () => {
    render(<BulkOperations {...mockProps} isProcessing={true} />);

    const updateButton = screen.getByText("Update Status");
    const addTagsButton = screen.getByText("Add Tags");
    const deleteButton = screen.getByText("Delete");

    expect(updateButton).toBeDisabled();
    expect(addTagsButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it("handles tag removal operation", async () => {
    render(<BulkOperations {...mockProps} />);

    const removeTagsButton = screen.getByText("Remove Tags");
    fireEvent.click(removeTagsButton);

    const tagsInput = screen.getByPlaceholderText(
      "Enter tags separated by commas (e.g., vip, premium, new)"
    );
    fireEvent.change(tagsInput, { target: { value: "vip" } });

    const executeButton = screen.getByText("Execute");
    fireEvent.click(executeButton);

    await waitFor(() => {
      expect(mockProps.onBulkTag).toHaveBeenCalledWith(
        ["1", "2", "3"],
        ["vip"],
        "remove"
      );
    });
  });

  it("validates tag input", async () => {
    render(<BulkOperations {...mockProps} />);

    const addTagsButton = screen.getByText("Add Tags");
    fireEvent.click(addTagsButton);

    // Don't enter any tags
    const executeButton = screen.getByText("Execute");
    fireEvent.click(executeButton);

    // Should not call onBulkTag with empty tags
    expect(mockProps.onBulkTag).not.toHaveBeenCalled();
  });

  it("handles single patient selection", () => {
    render(<BulkOperations {...mockProps} selectedPatients={["1"]} />);

    expect(screen.getByText("1 patient selected")).toBeInTheDocument();
  });
});

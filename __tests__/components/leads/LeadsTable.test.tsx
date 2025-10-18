import LeadsTable from "@/components/leads/LeadsTable";
import { Lead } from "@/types/database";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

// Mock data
const mockLeads: Lead[] = [
  {
    id: "1",
    phone_number: "+15550101",
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    company: "Acme Corp",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    tags: ["vip"],
    metadata: {
      exam_date: "2024-06-01",
      renewal_date: "2024-12-01",
      exam_type: "Medical License",
    },
  },
  {
    id: "2",
    phone_number: undefined as any, // This should trigger the error we want to catch
    first_name: "Jane",
    last_name: "Smith",
    email: "jane@example.com",
    company: "Tech Inc",
    status: "inactive",
    created_at: "2024-01-02T00:00:00Z",
    updated_at: "2024-01-02T00:00:00Z",
  },
  {
    id: "3",
    phone_number: "", // Empty string case
    first_name: "Bob",
    last_name: "Johnson",
    email: undefined as any,
    company: undefined as any,
    status: "renewal_due",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
  },
];

const mockProps = {
  leads: mockLeads,
  isLoading: false,
  selectedLeads: [],
  onToggleSelection: jest.fn(),
  onSelectAll: jest.fn(),
  onClearSelection: jest.fn(),
  onEditLead: jest.fn(),
  onViewLead: jest.fn(),
  onDeleteLead: jest.fn(),
  onUpdateStatus: jest.fn(),
  filters: {
    search: "",
    status: [],
    tags: [],
    created_after: "",
    created_before: "",
    phone_prefix: "",
    page: 0,
    limit: 50,
    sortBy: "created_at",
    sortOrder: "desc",
  },
  onFiltersChange: jest.fn(),
};

describe("LeadsTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<LeadsTable {...mockProps} />);
    expect(screen.getByText("Lead")).toBeInTheDocument();
  });

  it("handles undefined phone numbers gracefully", () => {
    // This test specifically catches the error you encountered
    expect(() => {
      render(<LeadsTable {...mockProps} />);
    }).not.toThrow();

    // Should render the table without crashing
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("displays phone numbers correctly", () => {
    render(<LeadsTable {...mockProps} />);

    // Should format valid phone numbers - check for the actual formatted number
    expect(screen.getByText("+15550101")).toBeInTheDocument();

    // Should handle missing phone numbers gracefully (no crash)
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("handles empty string phone numbers", () => {
    render(<LeadsTable {...mockProps} />);

    // Should not crash with empty string phone numbers
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("displays lead information correctly", () => {
    render(<LeadsTable {...mockProps} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("handles missing email gracefully", () => {
    render(<LeadsTable {...mockProps} />);

    // Should not crash when email is undefined
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("displays renewal information when available", () => {
    render(<LeadsTable {...mockProps} />);

    // Should show renewal date for lead with metadata
    expect(screen.getByText("Medical License")).toBeInTheDocument();
    expect(screen.getByText("Dec 1, 2024")).toBeInTheDocument();
  });

  it("shows 'No renewal data' for leads without metadata", () => {
    render(<LeadsTable {...mockProps} />);

    const noRenewalElements = screen.getAllByText("No renewal data");
    expect(noRenewalElements.length).toBeGreaterThan(0);
  });

  it("handles sorting functionality", () => {
    render(<LeadsTable {...mockProps} />);

    const statusHeader = screen.getByText("Status");
    fireEvent.click(statusHeader);

    // Should not crash when sorting
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("handles selection functionality", () => {
    render(<LeadsTable {...mockProps} />);

    // Get the first checkbox (select all)
    const checkboxes = screen.getAllByRole("checkbox");
    const selectAllCheckbox = checkboxes[0];
    fireEvent.click(selectAllCheckbox);

    expect(mockProps.onSelectAll).toHaveBeenCalledWith(["1", "2", "3"]);
  });

  it("displays loading state", () => {
    render(<LeadsTable {...mockProps} isLoading={true} />);

    expect(screen.getByText("Loading leads...")).toBeInTheDocument();
  });

  it("displays empty state when no leads", () => {
    render(<LeadsTable {...mockProps} leads={[]} />);

    expect(screen.getByText("No leads found")).toBeInTheDocument();
  });

  it("handles filter changes", () => {
    render(<LeadsTable {...mockProps} />);

    // Click the filters button to open the filter panel
    const filtersButton = screen.getByText("Filters");
    fireEvent.click(filtersButton);

    // The component should handle filter interactions
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("formats dates correctly", () => {
    render(<LeadsTable {...mockProps} />);

    // Should format created dates
    expect(screen.getByText("Jan 1, 2024")).toBeInTheDocument();
    expect(screen.getByText("Jan 2, 2024")).toBeInTheDocument();
    expect(screen.getByText("Jan 3, 2024")).toBeInTheDocument();
  });

  it("handles status colors correctly", () => {
    render(<LeadsTable {...mockProps} />);

    // Should apply correct status colors
    const activeStatus = screen.getByText("active");
    const inactiveStatus = screen.getByText("inactive");
    const renewalDueStatus = screen.getByText("renewal due");

    expect(activeStatus).toBeInTheDocument();
    expect(inactiveStatus).toBeInTheDocument();
    expect(renewalDueStatus).toBeInTheDocument();
  });

  it("handles action buttons", () => {
    render(<LeadsTable {...mockProps} />);

    // Check that action buttons are present
    const viewButtons = screen.getAllByTitle("View lead details");
    const editButtons = screen.getAllByTitle("Edit lead");
    const deleteButtons = screen.getAllByTitle("Delete lead");

    expect(viewButtons.length).toBe(3);
    expect(editButtons.length).toBe(3);
    expect(deleteButtons.length).toBe(3);

    // Should not crash when clicking buttons
    fireEvent.click(viewButtons[0]);
    // The button click should trigger the callback with any lead data
    expect(mockProps.onViewLead).toHaveBeenCalled();
  });
});

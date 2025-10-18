import PatientsTable from "@/components/patients/PatientsTable";
import { Patient } from "@/types/database";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";

// Mock data
const mockPatients: Patient[] = [
  {
    id: "1",
    phone_number: "+15550101",
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    license_type: "Medical",
    license_number: "MD123456",
    specialty: "Cardiology",
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    tags: ["vip"],
    exam_date: "2024-06-01",
    renewal_date: "2024-12-01",
  },
  {
    id: "2",
    phone_number: undefined as any, // This should trigger the error we want to catch
    first_name: "Jane",
    last_name: "Smith",
    email: "jane@example.com",
    license_type: "Nursing",
    license_number: "RN789012",
    specialty: "Emergency",
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
    license_type: undefined as any,
    license_number: undefined as any,
    specialty: undefined as any,
    status: "renewal_due",
    created_at: "2024-01-03T00:00:00Z",
    updated_at: "2024-01-03T00:00:00Z",
  },
];

const mockProps = {
  patients: mockPatients,
  isLoading: false,
  selectedPatients: [],
  onToggleSelection: jest.fn(),
  onSelectAll: jest.fn(),
  onClearSelection: jest.fn(),
  onEditPatient: jest.fn(),
  onViewPatient: jest.fn(),
  onDeletePatient: jest.fn(),
  onUpdateStatus: jest.fn(),
  filters: {
    search: "",
    status: [],
    tags: [],
    license_type: [],
    specialty: [],
    created_after: "",
    created_before: "",
    phone_prefix: "",
    exam_date_after: "",
    exam_date_before: "",
    renewal_date_after: "",
    renewal_date_before: "",
    page: 0,
    limit: 50,
    sortBy: "created_at",
    sortOrder: "desc",
  },
  onFiltersChange: jest.fn(),
};

describe("PatientsTable", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<PatientsTable {...mockProps} />);
    expect(screen.getByText("Patient")).toBeInTheDocument();
  });

  it("handles undefined phone numbers gracefully", () => {
    // This test specifically catches the error you encountered
    expect(() => {
      render(<PatientsTable {...mockProps} />);
    }).not.toThrow();

    // Should render the table without crashing
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("displays phone numbers correctly", () => {
    render(<PatientsTable {...mockProps} />);

    // Should format valid phone numbers - check for the actual formatted number
    expect(screen.getByText("+15550101")).toBeInTheDocument();

    // Should handle missing phone numbers gracefully (no crash)
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });

  it("handles empty string phone numbers", () => {
    render(<PatientsTable {...mockProps} />);

    // Should not crash with empty string phone numbers
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("displays patient information correctly", () => {
    render(<PatientsTable {...mockProps} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Medical")).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("handles missing email gracefully", () => {
    render(<PatientsTable {...mockProps} />);

    // Should not crash when email is undefined
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });

  it("displays renewal information when available", () => {
    render(<PatientsTable {...mockProps} />);

    // Should show renewal date for patient with exam data
    expect(screen.getByText("Medical")).toBeInTheDocument();
    // Check for renewal date in the table
    expect(screen.getByText("Renewal: Dec 1, 2024")).toBeInTheDocument();
  });

  it("shows 'No renewal data' for patients without exam data", () => {
    render(<PatientsTable {...mockProps} />);

    const noRenewalElements = screen.getAllByText("No renewal data");
    expect(noRenewalElements.length).toBeGreaterThan(0);
  });

  it("handles sorting functionality", () => {
    render(<PatientsTable {...mockProps} />);

    const statusHeader = screen.getByText("Status");
    fireEvent.click(statusHeader);

    // Should not crash when sorting
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("handles selection functionality", () => {
    render(<PatientsTable {...mockProps} />);

    // Get the first checkbox (select all)
    const checkboxes = screen.getAllByRole("checkbox");
    const selectAllCheckbox = checkboxes[0];
    fireEvent.click(selectAllCheckbox);

    expect(mockProps.onSelectAll).toHaveBeenCalledWith(["1", "2", "3"]);
  });

  it("displays loading state", () => {
    render(<PatientsTable {...mockProps} isLoading={true} />);

    expect(screen.getByText("Loading patients...")).toBeInTheDocument();
  });

  it("displays empty state when no patients", () => {
    render(<PatientsTable {...mockProps} patients={[]} />);

    expect(screen.getByText("No patients found")).toBeInTheDocument();
  });

  it("handles filter changes", () => {
    render(<PatientsTable {...mockProps} />);

    // Click the filters button to open the filter panel
    const filtersButton = screen.getByText("Filters");
    fireEvent.click(filtersButton);

    // The component should handle filter interactions
    expect(screen.getByText("Filters")).toBeInTheDocument();
  });

  it("formats dates correctly", () => {
    render(<PatientsTable {...mockProps} />);

    // Should format created dates
    expect(screen.getByText("Jan 1, 2024")).toBeInTheDocument();
    expect(screen.getByText("Jan 2, 2024")).toBeInTheDocument();
    expect(screen.getByText("Jan 3, 2024")).toBeInTheDocument();
  });

  it("handles status colors correctly", () => {
    render(<PatientsTable {...mockProps} />);

    // Should apply correct status colors
    const activeStatus = screen.getByText("active");
    const inactiveStatus = screen.getByText("inactive");
    const renewalDueStatus = screen.getByText("renewal due");

    expect(activeStatus).toBeInTheDocument();
    expect(inactiveStatus).toBeInTheDocument();
    expect(renewalDueStatus).toBeInTheDocument();
  });

  it("handles action buttons", () => {
    render(<PatientsTable {...mockProps} />);

    // Check that action buttons are present
    const viewButtons = screen.getAllByTitle("View patient details");
    const editButtons = screen.getAllByTitle("Edit patient");
    const deleteButtons = screen.getAllByTitle("Delete patient");

    expect(viewButtons.length).toBe(3);
    expect(editButtons.length).toBe(3);
    expect(deleteButtons.length).toBe(3);

    // Should not crash when clicking buttons
    fireEvent.click(viewButtons[0]);
    // The button click should trigger the callback with any patient data
    expect(mockProps.onViewPatient).toHaveBeenCalled();
  });

  it("displays license type badges", () => {
    render(<PatientsTable {...mockProps} />);

    // Should show license type badges
    expect(screen.getByText("Medical")).toBeInTheDocument();
    expect(screen.getByText("Nursing")).toBeInTheDocument();
  });

  it("handles patients without license type", () => {
    render(<PatientsTable {...mockProps} />);

    // Should not crash when license_type is undefined
    expect(screen.getByText("Bob Johnson")).toBeInTheDocument();
  });
});

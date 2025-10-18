import RenewalTracker from "@/components/patients/RenewalTracker";
import { RenewalData } from "@/types/database";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockRenewals: RenewalData[] = [
  {
    id: "1",
    patient_id: "patient1",
    exam_type: "Medical License",
    exam_date: "2024-01-01",
    renewal_date: "2024-12-01",
    status: "pending",
    notifications_sent: 2,
    last_reminder: "2024-11-01",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    patients: {
      id: "patient1",
      first_name: "John",
      last_name: "Doe",
      phone_number: "+15550101",
      email: "john@example.com",
    },
  },
  {
    id: "2",
    patient_id: "patient2",
    exam_type: "Professional Certification",
    exam_date: "2024-02-01",
    renewal_date: "2023-12-01", // Overdue
    status: "overdue",
    notifications_sent: 5,
    last_reminder: "2024-11-15",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
    patients: {
      id: "patient2",
      first_name: "Jane",
      last_name: "Smith",
      phone_number: "+15550102",
      email: "jane@example.com",
    },
  },
];

const mockDueRenewals: RenewalData[] = [mockRenewals[1]]; // Only the overdue one

const mockProps = {
  renewals: mockRenewals,
  dueRenewals: mockDueRenewals,
  isLoading: false,
  onCreateRenewal: jest.fn(),
  onUpdateRenewal: jest.fn(),
  onSendReminders: jest.fn(),
  onDeleteRenewal: jest.fn(),
  isProcessing: false,
};

describe("RenewalTracker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<RenewalTracker {...mockProps} />);

    expect(screen.getByText("Renewal Tracking")).toBeInTheDocument();
    expect(screen.getByText("Add Renewal")).toBeInTheDocument();
    expect(screen.getByText("Send Reminders")).toBeInTheDocument();
  });

  it("displays due renewals alert", () => {
    render(<RenewalTracker {...mockProps} />);

    expect(screen.getByText("1 Renewal Due")).toBeInTheDocument();
    expect(
      screen.getByText("1 renewal is past due date and require attention.")
    ).toBeInTheDocument();
  });

  it("displays renewals table", () => {
    render(<RenewalTracker {...mockProps} />);

    expect(screen.getByText("All Renewals")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("Medical License")).toBeInTheDocument();
    expect(screen.getByText("Professional Certification")).toBeInTheDocument();
  });

  it("handles empty renewals state", () => {
    render(<RenewalTracker {...mockProps} renewals={[]} dueRenewals={[]} />);

    expect(screen.getByText("No renewals found")).toBeInTheDocument();
    expect(
      screen.getByText("Get started by adding a renewal record.")
    ).toBeInTheDocument();
  });

  it("opens add renewal modal", () => {
    render(<RenewalTracker {...mockProps} />);

    const addButton = screen.getByText("Add Renewal");
    fireEvent.click(addButton);

    expect(screen.getByText("Add Renewal")).toBeInTheDocument();
    expect(screen.getByLabelText("Patient ID")).toBeInTheDocument();
    expect(screen.getByLabelText("Exam Type")).toBeInTheDocument();
    expect(screen.getByLabelText("Exam Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Renewal Date")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
  });

  it("creates new renewal", async () => {
    render(<RenewalTracker {...mockProps} />);

    const addButton = screen.getByText("Add Renewal");
    fireEvent.click(addButton);

    const patientIdInput = screen.getByLabelText("Patient ID");
    const examTypeInput = screen.getByLabelText("Exam Type");
    const examDateInput = screen.getByLabelText("Exam Date");
    const renewalDateInput = screen.getByLabelText("Renewal Date");

    fireEvent.change(patientIdInput, { target: { value: "patient3" } });
    fireEvent.change(examTypeInput, { target: { value: "Nursing License" } });
    fireEvent.change(examDateInput, { target: { value: "2024-03-01" } });
    fireEvent.change(renewalDateInput, { target: { value: "2025-03-01" } });

    const createButton = screen.getByText("Create");
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockProps.onCreateRenewal).toHaveBeenCalledWith({
        patient_id: "patient3",
        exam_type: "Nursing License",
        exam_date: "2024-03-01",
        renewal_date: "2025-03-01",
        status: "pending",
        notifications_sent: 0,
      });
    });
  });

  it("edits existing renewal", async () => {
    render(<RenewalTracker {...mockProps} />);

    const editButtons = screen.getAllByTitle("Edit renewal");
    fireEvent.click(editButtons[0]);

    expect(screen.getByText("Edit Renewal")).toBeInTheDocument();
    expect(screen.getByDisplayValue("patient1")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Medical License")).toBeInTheDocument();

    const updateButton = screen.getByText("Update");
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockProps.onUpdateRenewal).toHaveBeenCalled();
    });
  });

  it("deletes renewal with confirmation", async () => {
    const confirmSpy = jest.spyOn(window, "confirm").mockReturnValue(true);

    render(<RenewalTracker {...mockProps} />);

    const deleteButtons = screen.getAllByTitle("Delete renewal");
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockProps.onDeleteRenewal).toHaveBeenCalledWith("1");
    });

    confirmSpy.mockRestore();
  });

  it("sends renewal reminders", async () => {
    render(<RenewalTracker {...mockProps} />);

    const sendRemindersButton = screen.getByText("Send Reminders");
    fireEvent.click(sendRemindersButton);

    await waitFor(() => {
      expect(mockProps.onSendReminders).toHaveBeenCalledWith(["2"]); // Only overdue renewal
    });
  });

  it("displays loading state", () => {
    render(<RenewalTracker {...mockProps} isLoading={true} />);

    expect(screen.getByText("Loading renewals...")).toBeInTheDocument();
  });

  it("formats dates correctly", () => {
    render(<RenewalTracker {...mockProps} />);

    expect(screen.getByText("Jan 1, 2024")).toBeInTheDocument();
    expect(screen.getByText("Dec 1, 2024")).toBeInTheDocument();
    expect(screen.getByText("Dec 1, 2023")).toBeInTheDocument();
  });

  it("displays status correctly", () => {
    render(<RenewalTracker {...mockProps} />);

    expect(screen.getByText("pending")).toBeInTheDocument();
    expect(screen.getByText("overdue")).toBeInTheDocument();
  });

  it("displays notification counts", () => {
    render(<RenewalTracker {...mockProps} />);

    expect(screen.getByText("2")).toBeInTheDocument(); // notifications_sent for first renewal
    expect(screen.getByText("5")).toBeInTheDocument(); // notifications_sent for second renewal
  });

  it("handles overdue renewals styling", () => {
    render(<RenewalTracker {...mockProps} />);

    // Should highlight overdue renewals
    const overdueDate = screen.getByText("Dec 1, 2023");
    expect(overdueDate).toHaveClass("text-red-600");
  });

  it("closes modal when cancel is clicked", () => {
    render(<RenewalTracker {...mockProps} />);

    const addButton = screen.getByText("Add Renewal");
    fireEvent.click(addButton);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(screen.queryByText("Add Renewal")).not.toBeInTheDocument();
  });

  it("handles processing state", () => {
    render(<RenewalTracker {...mockProps} isProcessing={true} />);

    const sendRemindersButton = screen.getByText("Send Reminders");
    expect(sendRemindersButton).toBeDisabled();
  });
});

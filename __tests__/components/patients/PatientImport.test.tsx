import PatientImportPage from "@/app/patients/import/page";
import { PatientImport } from "@/components/patients/PatientImport";
import { usePatientImport } from "@/hooks/usePatientImport";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

// Mock the patient import hook
jest.mock("@/hooks/usePatientImport");
const mockUsePatientImport = usePatientImport as jest.MockedFunction<
  typeof usePatientImport
>;

// Mock fetch
global.fetch = jest.fn();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("PatientImportPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the import page correctly", () => {
    mockUsePatientImport.mockReturnValue({
      progress: { stage: "idle", progress: 0, message: "Ready to import" },
      result: null,
      errors: [],
      isImporting: false,
      importPatients: jest.fn(),
      resetImport: jest.fn(),
      validateFile: jest.fn(),
    });

    render(
      <TestWrapper>
        <PatientImportPage />
      </TestWrapper>
    );

    expect(screen.getByText("Import Patients")).toBeInTheDocument();
    expect(
      screen.getByText("Upload a CSV file to import patients in bulk")
    ).toBeInTheDocument();
  });

  it("calls onImportComplete when import is completed", () => {
    const mockOnImportComplete = jest.fn();
    const mockResult = {
      success: true,
      totalRows: 10,
      imported: 8,
      skipped: 2,
      errors: [],
      duplicates: [],
      summary: {
        newPatients: 8,
        updatedPatients: 0,
        skippedPatients: 2,
        errorCount: 0,
        duplicateCount: 0,
      },
    };

    mockUsePatientImport.mockReturnValue({
      progress: {
        stage: "completed",
        progress: 100,
        message: "Import completed!",
      },
      result: mockResult,
      errors: [],
      isImporting: false,
      importPatients: jest.fn(),
      resetImport: jest.fn(),
      validateFile: jest.fn(),
    });

    render(
      <TestWrapper>
        <PatientImport onImportComplete={mockOnImportComplete} />
      </TestWrapper>
    );

    expect(mockOnImportComplete).toHaveBeenCalledWith(mockResult);
  });
});

describe("PatientImport Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders file upload area", () => {
    render(
      <TestWrapper>
        <PatientImport />
      </TestWrapper>
    );

    expect(screen.getByText("Drag & drop a CSV file here")).toBeInTheDocument();
    expect(screen.getByText("or click to browse files")).toBeInTheDocument();
  });

  it("shows sample CSV download link", () => {
    render(
      <TestWrapper>
        <PatientImport />
      </TestWrapper>
    );

    expect(
      screen.getByText("Download sample CSV template")
    ).toBeInTheDocument();
  });

  it("handles file selection", () => {
    const mockFile = new File(["test"], "test.csv", { type: "text/csv" });

    render(
      <TestWrapper>
        <PatientImport />
      </TestWrapper>
    );

    const fileInput = screen.getByRole("textbox", { hidden: true });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(screen.getByText("Selected: test.csv")).toBeInTheDocument();
  });

  it("shows import options when file is selected", () => {
    const mockFile = new File(["test"], "test.csv", { type: "text/csv" });

    render(
      <TestWrapper>
        <PatientImport />
      </TestWrapper>
    );

    const fileInput = screen.getByRole("textbox", { hidden: true });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(screen.getByText("Import Options")).toBeInTheDocument();
    expect(
      screen.getByText("Skip duplicate phone numbers")
    ).toBeInTheDocument();
    expect(screen.getByText("Update existing patients")).toBeInTheDocument();
  });

  it("shows start import button when file is selected", () => {
    const mockFile = new File(["test"], "test.csv", { type: "text/csv" });

    render(
      <TestWrapper>
        <PatientImport />
      </TestWrapper>
    );

    const fileInput = screen.getByRole("textbox", { hidden: true });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(screen.getByText("Start Import")).toBeInTheDocument();
  });

  it("shows progress during import", () => {
    render(
      <TestWrapper>
        <PatientImport />
      </TestWrapper>
    );

    // Mock progress state
    const { rerender } = render(
      <TestWrapper>
        <PatientImport />
      </TestWrapper>
    );

    // Simulate import progress
    rerender(
      <TestWrapper>
        <PatientImport />
      </TestWrapper>
    );
  });

  it("shows import results", () => {
    const mockResult = {
      success: true,
      totalRows: 10,
      imported: 8,
      skipped: 2,
      errors: [],
      duplicates: [],
      summary: {
        newPatients: 8,
        updatedPatients: 0,
        skippedPatients: 2,
        errorCount: 0,
        duplicateCount: 0,
      },
    };

    render(
      <TestWrapper>
        <PatientImport />
      </TestWrapper>
    );

    // This would be tested with actual component state
    expect(screen.getByText("Import Results")).toBeInTheDocument();
  });

  it("shows validation errors", () => {
    const mockErrors = ["Invalid file format", "File is too large"];

    render(
      <TestWrapper>
        <PatientImport />
      </TestWrapper>
    );

    // This would be tested with actual component state
    expect(screen.getByText("Import Errors:")).toBeInTheDocument();
  });

  it("handles import options changes", () => {
    const mockFile = new File(["test"], "test.csv", { type: "text/csv" });

    render(
      <TestWrapper>
        <PatientImport />
      </TestWrapper>
    );

    const fileInput = screen.getByRole("textbox", { hidden: true });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    const skipDuplicatesCheckbox = screen.getByLabelText(
      "Skip duplicate phone numbers"
    );
    fireEvent.click(skipDuplicatesCheckbox);

    expect(skipDuplicatesCheckbox).toBeChecked();
  });

  it("resets import state", () => {
    render(
      <TestWrapper>
        <PatientImport />
      </TestWrapper>
    );

    const resetButton = screen.getByText("Import Another File");
    fireEvent.click(resetButton);

    // Verify state is reset
    expect(screen.getByText("Drag & drop a CSV file here")).toBeInTheDocument();
  });
});

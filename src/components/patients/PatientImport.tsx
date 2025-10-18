"use client";

import { ImportOptions, ImportResult } from "@/app/api/patients/import/route";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

interface ContactImportProps {
  onImportComplete?: (result: ImportResult) => void;
  onImportStart?: () => void;
  onComplete?: () => void;
}

interface ImportProgress {
  stage: "idle" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  message: string;
}

/**
 * Contact Import Component
 *
 * Provides drag-and-drop file upload, CSV validation, import options,
 * progress tracking, and detailed results display.
 */
export const PatientImport: React.FC<PatientImportProps> = ({
  onImportComplete,
  onImportStart,
  onComplete,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    skipDuplicates: true,
    updateExisting: false,
    validatePhoneNumbers: true,
    validateEmails: true,
    batchSize: 100,
  });
  const [progress, setProgress] = useState<ImportProgress>({
    stage: "idle",
    progress: 0,
    message: "Ready to import",
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const fileExtension = file?.name.toLowerCase().split(".").pop();
    if (file && ["csv", "xlsx", "xls"].includes(fileExtension || "")) {
      setSelectedFile(file);
      setErrors([]);
      setImportResult(null);
    } else {
      setErrors([
        "Please select a valid CSV or Excel file (.csv, .xlsx, .xls)",
      ]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
    },
    multiple: false,
  });

  const handleImport = async () => {
    if (!selectedFile) return;

    const sessionId = `import_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    setProgress({
      stage: "uploading",
      progress: 0,
      message: "Uploading file...",
    });
    onImportStart?.();

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("options", JSON.stringify(importOptions));
      formData.append("sessionId", sessionId);

      setProgress({
        stage: "processing",
        progress: 10,
        message: `Processing ${selectedFile.name}...`,
      });

      // Start polling for progress updates
      const progressInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch(
            `/api/patients/import/progress?sessionId=${sessionId}`
          );
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            setProgress({
              stage:
                progressData.status === "completed"
                  ? "completed"
                  : progressData.status === "error"
                  ? "error"
                  : "processing",
              progress: progressData.progress || 0,
              message: progressData.message || "Processing...",
            });

            if (
              progressData.status === "completed" ||
              progressData.status === "error"
            ) {
              clearInterval(progressInterval);
            }
          }
        } catch (error) {
          console.error("Error fetching progress:", error);
        }
      }, 500); // Poll every 500ms

      const response = await fetch("/api/patients/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      clearInterval(progressInterval);

      if (result.success) {
        // Use progress information from API response
        const apiProgress = result.progress;
        setProgress({
          stage: "completed",
          progress: apiProgress?.percentage || 100,
          message: apiProgress?.message || "Import completed!",
        });
        setImportResult(result.data);
        onImportComplete?.(result.data);
      } else {
        const apiProgress = result.progress;
        setProgress({
          stage: "error",
          progress: apiProgress?.percentage || 0,
          message: apiProgress?.message || result.error,
        });
        setErrors([result.error]);
      }
    } catch (error) {
      setProgress({ stage: "error", progress: 0, message: "Import failed" });
      setErrors([error instanceof Error ? error.message : "Unknown error"]);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    setErrors([]);
    setProgress({ stage: "idle", progress: 0, message: "Ready to import" });
  };

  const downloadSampleTemplate = (format: "csv" | "xlsx" = "csv") => {
    const sampleData = [
      ["phone_number", "first_name", "last_name", "email", "company"],
      [
        "+1-555-0101",
        "John",
        "Smith",
        "john.smith@example.com",
        "TechCorp Inc",
      ],
      [
        "+1-555-0102",
        "Sarah",
        "Johnson",
        "sarah.j@example.com",
        "HealthPlus Medical",
      ],
      [
        "+1-555-0103",
        "Mike",
        "Chen",
        "mike.chen@example.com",
        "RetailMax Stores",
      ],
    ];

    if (format === "csv") {
      const csvContent = sampleData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sample-patients.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      // Create Excel file
      const ws = XLSX.utils.aoa_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Patients");
      XLSX.writeFile(wb, "sample-patients.xlsx");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Import Patients
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Upload a CSV or Excel file to import patients in bulk
        </p>
      </div>

      {/* File Upload Area */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {isDragActive
                    ? "Drop the file here"
                    : "Drag & drop a CSV or Excel file here"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  or click to browse files
                </p>
              </div>
              {selectedFile && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-400">
                    Selected: {selectedFile.name} (
                    {(selectedFile.size / 1024).toFixed(1)} KB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sample Download */}
          <div className="mt-4 text-center space-x-4">
            <button
              onClick={() => downloadSampleTemplate("csv")}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Download CSV template
            </button>
            <button
              onClick={() => downloadSampleTemplate("xlsx")}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Download Excel template
            </button>
          </div>
        </div>
      </div>

      {/* Import Options */}
      {selectedFile && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Import Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.skipDuplicates}
                    onChange={(e) =>
                      setImportOptions({
                        ...importOptions,
                        skipDuplicates: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Skip duplicate phone numbers
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.updateExisting}
                    onChange={(e) =>
                      setImportOptions({
                        ...importOptions,
                        updateExisting: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Update existing patients
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.validatePhoneNumbers}
                    onChange={(e) =>
                      setImportOptions({
                        ...importOptions,
                        validatePhoneNumbers: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Validate phone numbers
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.validateEmails}
                    onChange={(e) =>
                      setImportOptions({
                        ...importOptions,
                        validateEmails: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Validate email addresses
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Batch Size
                </label>
                <select
                  value={importOptions.batchSize}
                  onChange={(e) =>
                    setImportOptions({
                      ...importOptions,
                      batchSize: parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value={50}>50 records</option>
                  <option value={100}>100 records</option>
                  <option value={200}>200 records</option>
                  <option value={500}>500 records</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      {progress.stage !== "idle" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {progress.message}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {progress.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  progress.stage === "error"
                    ? "bg-red-500"
                    : progress.stage === "completed"
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">
            Import Errors:
          </h4>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Import Results
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {importResult.summary.newPatients}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  New Patients
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {importResult.summary.updatedPatients}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Updated
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {importResult.summary.skippedPatients}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Skipped
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {importResult.summary.errorCount}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Errors
                </div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Validation Errors:
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  {importResult.errors.slice(0, 10).map((error, index) => (
                    <div
                      key={index}
                      className="text-xs text-red-600 dark:text-red-400 mb-1"
                    >
                      Row {error.row}: {error.message}
                    </div>
                  ))}
                  {importResult.errors.length > 10 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ... and {importResult.errors.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            )}

            {importResult.duplicates.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duplicates Found:
                </h4>
                <div className="max-h-40 overflow-y-auto">
                  {importResult.duplicates
                    .slice(0, 10)
                    .map((duplicate, index) => (
                      <div
                        key={index}
                        className="text-xs text-yellow-600 dark:text-yellow-400 mb-1"
                      >
                        Row {duplicate.row}: {duplicate.phoneNumber} -{" "}
                        {duplicate.action}
                      </div>
                    ))}
                  {importResult.duplicates.length > 10 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ... and {importResult.duplicates.length - 10} more
                      duplicates
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        {selectedFile && progress.stage === "idle" && (
          <button
            onClick={handleImport}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Start Import
          </button>
        )}

        {(progress.stage === "completed" || progress.stage === "error") && (
          <div className="flex space-x-4">
            <button
              onClick={resetImport}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Import Another File
            </button>
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
            >
              Complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

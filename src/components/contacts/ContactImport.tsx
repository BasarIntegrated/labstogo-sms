"use client";

import { ImportOptions, ImportResult } from "@/app/api/contacts/import/route";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface ContactImportProps {
  onImportComplete?: (result: ImportResult) => void;
  onImportStart?: () => void;
  onImportError?: (error: string) => void;
  onComplete?: () => void;
  onRefetch?: () => void;
}

interface ImportProgress {
  stage: "idle" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  message: string;
  current?: number;
  total?: number;
}

/**
 * Contact Import Component
 *
 * Provides drag-and-drop file upload, CSV validation, import options,
 * progress tracking, and detailed results display.
 */
export const ContactImport: React.FC<ContactImportProps> = ({
  onImportComplete,
  onImportStart,
  onImportError,
  onComplete,
  onRefetch,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    skipDuplicates: true,
    updateExisting: true,
    validatePhoneNumbers: true,
    validateEmails: true,
    batchSize: 100,
  });
  const [progress, setProgress] = useState<ImportProgress>({
    stage: "idle",
    progress: 0,
    message: "Ready to import",
    current: 0,
    total: 0,
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const fileExtension = file?.name.toLowerCase().split(".").pop();
    if (file && fileExtension === "csv") {
      setSelectedFile(file);
      setErrors([]);
      setImportResult(null);
    } else {
      setErrors(["Please select a valid CSV file (.csv)"]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
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
        message: "Starting import...",
      });

      // Start a progress animation while waiting for API response
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev.stage === "processing" && prev.progress < 90) {
            return {
              ...prev,
              progress: Math.min(prev.progress + 5, 90),
              message: `Processing contacts... ${prev.progress}%`,
            };
          }
          return prev;
        });
      }, 500);

      const response = await fetch("/api/patients/import", {
        method: "POST",
        body: formData,
      });

      // Clear the progress animation
      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Import completed successfully
        const apiProgress = result.progress;

        setProgress({
          stage: "completed",
          progress: apiProgress?.progress || 100,
          message: apiProgress?.message || "Import completed!",
          current: apiProgress?.current || result.data?.totalRows || 0,
          total: apiProgress?.total || result.data?.totalRows || 0,
        });

        setImportResult(result.data);
        onImportComplete?.(result.data);
      } else {
        setProgress({
          stage: "error",
          progress: 0,
          message: result.error || "Import failed",
        });
        onImportError?.(result.error);
      }
    } catch (error) {
      setProgress({
        stage: "error",
        progress: 0,
        message: "Import failed",
        current: 0,
        total: 0,
      });
      setErrors([error instanceof Error ? error.message : "Unknown error"]);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    setErrors([]);
    setProgress({
      stage: "idle",
      progress: 0,
      message: "Ready to import",
      current: 0,
      total: 0,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Import Contacts
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Upload a CSV file to import contacts in bulk
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
                    : "Drag & drop a CSV file here"}
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
        </div>
      </div>

      {/* Import Options - Hidden, using defaults */}
      {/* 
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
      */}

      {/* Progress */}
      {progress.stage !== "idle" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {progress.stage === "processing" &&
                progress.current &&
                progress.total
                  ? `Processing ${progress.current} of ${progress.total} contacts...`
                  : progress.message}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 hidden">
                {progress.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ">
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
            {progress.stage === "processing" &&
              progress.current &&
              progress.total && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {progress.current} of {progress.total} contacts processed
                </div>
              )}
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

      {/* Success Modal */}
      {importResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                🎉 Import Successful!
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                {importResult?.summary?.newPatients > 0 &&
                importResult?.summary?.updatedPatients > 0
                  ? `Successfully imported ${importResult?.summary?.newPatients} new contacts and updated ${importResult?.summary?.updatedPatients} existing contacts.`
                  : importResult?.summary?.newPatients > 0
                  ? `Successfully imported ${importResult?.summary?.newPatients} new contacts.`
                  : importResult?.summary?.updatedPatients > 0
                  ? `Successfully updated ${importResult?.summary?.updatedPatients} existing contacts.`
                  : "Import completed successfully."}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {importResult?.summary?.newPatients || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    New Contacts
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {importResult?.summary?.updatedPatients || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Updated
                  </div>
                </div>
              </div>

              {(importResult?.summary?.skippedPatients > 0 ||
                importResult?.summary?.errorCount > 0) && (
                <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-sm text-yellow-800 dark:text-yellow-400">
                    {importResult?.summary?.skippedPatients > 0 && (
                      <div>
                        {importResult?.summary?.skippedPatients} contacts
                        skipped
                      </div>
                    )}
                    {importResult?.summary?.errorCount > 0 && (
                      <div>
                        {importResult?.summary?.errorCount} errors encountered
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={resetImport}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Import Another File
                </button>
                <button
                  onClick={() => {
                    try {
                      onComplete?.();
                      onRefetch?.();
                    } catch (error) {
                      console.error("Error in Done button click:", error);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResult && progress.stage !== "completed" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Import Results
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {importResult?.summary?.newPatients || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  New Patients
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {importResult?.summary?.updatedPatients || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Updated
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {importResult?.summary?.skippedPatients || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Skipped
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {importResult?.summary?.errorCount || 0}
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
      {progress.stage !== "completed" && (
        <div className="flex justify-center space-x-4">
          {selectedFile && progress.stage === "idle" && (
            <button
              onClick={handleImport}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Start Import
            </button>
          )}

          {progress.stage === "error" && (
            <div className="flex space-x-4">
              <button
                onClick={resetImport}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

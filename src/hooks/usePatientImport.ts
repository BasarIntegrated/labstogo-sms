"use client";

import { ImportOptions, ImportResult } from "@/app/api/patients/import/route";
import { useCallback, useState } from "react";

interface ImportProgress {
  stage: "idle" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  message: string;
}

interface UsePatientImportReturn {
  progress: ImportProgress;
  result: ImportResult | null;
  errors: string[];
  isImporting: boolean;
  importPatients: (file: File, options: ImportOptions) => Promise<void>;
  resetImport: () => void;
  validateFile: (file: File) => string[];
}

/**
 * Custom hook for managing patient import functionality
 *
 * Provides state management, file validation, import processing,
 * and error handling for patient CSV imports.
 */
export const usePatientImport = (): UsePatientImportReturn => {
  const [progress, setProgress] = useState<ImportProgress>({
    stage: "idle",
    progress: 0,
    message: "Ready to import",
  });
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const validateFile = useCallback((file: File): string[] => {
    const validationErrors: string[] = [];

    // Check file type
    const fileExtension = file.name.toLowerCase().split(".").pop();
    if (!["csv", "xlsx", "xls"].includes(fileExtension || "")) {
      validationErrors.push("Only CSV and Excel files are supported");
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      validationErrors.push("File size must be less than 10MB");
    }

    // Check if file is empty
    if (file.size === 0) {
      validationErrors.push("File is empty");
    }

    return validationErrors;
  }, []);

  const importPatients = useCallback(
    async (file: File, options: ImportOptions) => {
      // Validate file first
      const validationErrors = validateFile(file);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setProgress({
          stage: "error",
          progress: 0,
          message: "File validation failed",
        });
        return;
      }

      setIsImporting(true);
      setErrors([]);
      setResult(null);

      try {
        setProgress({
          stage: "uploading",
          progress: 0,
          message: "Uploading file...",
        });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("options", JSON.stringify(options));

        setProgress({
          stage: "processing",
          progress: 50,
          message: "Processing data...",
        });

        const response = await fetch("/api/patients/import", {
          method: "POST",
          body: formData,
        });

        const responseData = await response.json();

        if (responseData.success) {
          setProgress({
            stage: "completed",
            progress: 100,
            message: "Import completed!",
          });
          setResult(responseData.data);
        } else {
          setProgress({
            stage: "error",
            progress: 0,
            message: responseData.error,
          });
          setErrors([responseData.error]);
        }
      } catch (error) {
        setProgress({ stage: "error", progress: 0, message: "Import failed" });
        setErrors([error instanceof Error ? error.message : "Unknown error"]);
      } finally {
        setIsImporting(false);
      }
    },
    [validateFile]
  );

  const resetImport = useCallback(() => {
    setProgress({ stage: "idle", progress: 0, message: "Ready to import" });
    setResult(null);
    setErrors([]);
    setIsImporting(false);
  }, []);

  return {
    progress,
    result,
    errors,
    isImporting,
    importPatients,
    resetImport,
    validateFile,
  };
};

/**
 * Hook for managing import history and statistics
 */
export const useImportHistory = () => {
  const [importHistory, setImportHistory] = useState<ImportResult[]>([]);

  const addImportResult = useCallback((result: ImportResult) => {
    setImportHistory((prev) => [result, ...prev].slice(0, 10)); // Keep last 10 imports
  }, []);

  const getImportStats = useCallback(() => {
    if (importHistory.length === 0) {
      return {
        totalImports: 0,
        totalPatients: 0,
        successRate: 0,
        averageImportSize: 0,
      };
    }

    const totalImports = importHistory.length;
    const totalPatients = importHistory.reduce(
      (sum, result) => sum + result.imported,
      0
    );
    const successfulImports = importHistory.filter(
      (result) => result.success
    ).length;
    const successRate = (successfulImports / totalImports) * 100;
    const averageImportSize =
      importHistory.reduce((sum, result) => sum + result.totalRows, 0) /
      totalImports;

    return {
      totalImports,
      totalPatients,
      successRate,
      averageImportSize,
    };
  }, [importHistory]);

  return {
    importHistory,
    addImportResult,
    getImportStats,
  };
};

/**
 * Hook for CSV template generation
 */
export const useCSVTemplate = () => {
  const generateTemplate = useCallback((fields: string[] = []) => {
    const defaultFields = [
      "phone_number",
      "first_name",
      "last_name",
      "email",
      "company",
    ];
    const templateFields = fields.length > 0 ? fields : defaultFields;

    const headers = templateFields.join(",");
    const sampleRows = [
      "+1-555-0101,John,Smith,john.smith@example.com,TechCorp Inc",
      "+1-555-0102,Sarah,Johnson,sarah.j@example.com,HealthPlus Medical",
      "+1-555-0103,Mike,Chen,mike.chen@example.com,RetailMax Stores",
    ];

    return [headers, ...sampleRows].join("\n");
  }, []);

  const downloadTemplate = useCallback(
    (fields?: string[]) => {
      const csvContent = generateTemplate(fields);
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "patient-import-template.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    [generateTemplate]
  );

  return {
    generateTemplate,
    downloadTemplate,
  };
};

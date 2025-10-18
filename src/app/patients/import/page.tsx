"use client";

import { ImportResult } from "@/app/api/patients/import/route";
import { PatientImport } from "@/components/patients/PatientImport";
import { useRouter } from "next/navigation";

/**
 * Patient Import Page
 *
 * Provides a dedicated page for importing patients from CSV files
 * with comprehensive validation, progress tracking, and results display.
 */
export default function PatientImportPage() {
  const router = useRouter();

  const handleImportComplete = (result: ImportResult) => {
    console.log("Import completed:", result);
    // You can add additional logic here, such as:
    // - Redirect to patients list
    // - Show success notification
    // - Update patient count in navigation
  };

  const handleImportStart = () => {
    console.log("Import started");
    // You can add additional logic here, such as:
    // - Show loading state in navigation
    // - Disable other actions
  };

  const handleComplete = () => {
    // Navigate back to patients list
    router.push("/patients");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PatientImport
          onImportComplete={handleImportComplete}
          onImportStart={handleImportStart}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}

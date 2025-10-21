"use client";

import { ImportResult } from "@/app/api/contacts/import/route";
import { ContactImport } from "@/components/contacts/ContactImport";
import { useRouter } from "next/navigation";

/**
 * Contact Import Page
 *
 * Provides a dedicated page for importing contacts from CSV files
 * with comprehensive validation, progress tracking, and results display.
 */
export default function ContactImportPage() {
  const router = useRouter();

  const handleImportComplete = (result: ImportResult) => {
    console.log("Import completed:", result);
    // You can add additional logic here, such as:
    // - Redirect to contacts list
    // - Show success notification
    // - Update contact count in navigation
  };

  const handleImportStart = () => {
    console.log("Import started");
    // You can add additional logic here, such as:
    // - Show loading state in navigation
    // - Disable other actions
  };

  const handleComplete = () => {
    // Navigate back to contacts list
    router.push("/contacts");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContactImport
          onImportComplete={handleImportComplete}
          onImportStart={handleImportStart}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}

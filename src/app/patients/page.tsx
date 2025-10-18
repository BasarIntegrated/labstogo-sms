"use client";

import PatientsDashboard from "@/components/patients/PatientsDashboard";
import { usePatientsManagement } from "@/hooks/usePatientsManagement";

export default function PatientsPage() {
  const { patients, total, isLoading, refetch } = usePatientsManagement();

  return (
    <PatientsDashboard
      patients={patients || []}
      total={total}
      isLoading={isLoading}
      onRefresh={refetch}
    />
  );
}

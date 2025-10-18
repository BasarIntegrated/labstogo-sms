"use client";

import PatientsDashboard from "@/components/patients/PatientsDashboard";

export default function PatientsPage() {
  return (
    <PatientsDashboard patients={[]} isLoading={false} onRefresh={() => {}} />
  );
}

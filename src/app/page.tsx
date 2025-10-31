"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Homepage - Redirects to /dashboard
 *
 * Automatically redirects users to the main dashboard page
 * which contains the comprehensive analytics and real-time data.
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

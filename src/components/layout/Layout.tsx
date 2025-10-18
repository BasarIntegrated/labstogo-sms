"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Notification, User } from "@/types/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import Footer from "./Footer";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

// Mock notifications - replace with actual notification system

const mockNotifications: Notification[] = [
  {
    id: "1",
    message: "Campaign 'Summer Sale' completed successfully",
    type: "success",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    message: "New contacts uploaded: 150 contacts",
    type: "info",
    isRead: true,
    createdAt: new Date().toISOString(),
  },
];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated (must be called before any early returns)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Don't show layout for login page
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (redirect is handled by useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Convert auth user to navigation user format
  const navUser: User | null = user
    ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role === "standard" ? "user" : user.role,
      }
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <Header
        user={navUser}
        currentPath={pathname}
        notifications={mockNotifications}
      />

      {/* Main content area */}
      <main className="min-h-screen">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumbs */}
          <Breadcrumbs currentPath={pathname} items={[]} />

          {/* Page content */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

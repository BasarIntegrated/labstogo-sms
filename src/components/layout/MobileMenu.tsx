"use client";

import { isNavItemActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { MobileMenuProps } from "@/types/navigation";
import { Home, Megaphone, Settings, Users, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const iconMap = {
  home: Home,
  megaphone: Megaphone,
  users: Users,
  settings: Settings,
};

export function MobileMenu({
  isOpen,
  onClose,
  items,
  currentPath,
}: MobileMenuProps) {
  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LG</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              LabsToGo SMS
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-4" role="navigation" aria-label="Mobile navigation">
          <div className="space-y-2">
            {items.map((item) => {
              const IconComponent = item.icon
                ? iconMap[item.icon as keyof typeof iconMap]
                : null;
              const isActive = isNavItemActive(item, currentPath);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium transition-colors duration-200",
                    "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {IconComponent && (
                    <IconComponent className="w-5 h-5" aria-hidden="true" />
                  )}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            LabsToGo SMS Blaster v1.0
          </div>
        </div>
      </div>
    </>
  );
}

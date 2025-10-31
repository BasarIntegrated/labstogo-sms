"use client";

import { generateBreadcrumbs } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { BreadcrumbsProps } from "@/types/navigation";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export function Breadcrumbs({ currentPath, items }: BreadcrumbsProps) {
  // Generate breadcrumbs if not provided
  const breadcrumbs =
    items.length > 0 ? items : generateBreadcrumbs(currentPath);

  // Don't show breadcrumbs on home page (redirects to /dashboard)
  if (currentPath === "/") {
    return null;
  }

  // Only show if there are breadcrumbs to display
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav
      className="flex items-center space-x-1 text-sm text-gray-500 mb-4"
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 mx-1 text-gray-400"
                  aria-hidden="true"
                />
              )}

              {isLast ? (
                <span
                  className={cn(
                    "font-medium text-gray-900",
                    isFirst && "flex items-center space-x-1"
                  )}
                  aria-current="page"
                >
                  {isFirst && <Home className="w-4 h-4" aria-hidden="true" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "hover:text-gray-700 transition-colors duration-150",
                    isFirst && "flex items-center space-x-1"
                  )}
                >
                  {isFirst && <Home className="w-4 h-4" aria-hidden="true" />}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

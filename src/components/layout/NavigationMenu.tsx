"use client";

import { isNavItemActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { NavigationMenuProps } from "@/types/navigation";
import { Activity, Home, Megaphone, Settings, Users } from "lucide-react";
import Link from "next/link";

const iconMap = {
  home: Home,
  megaphone: Megaphone,
  users: Users,
  settings: Settings,
  activity: Activity,
};

export function NavigationMenu({
  items,
  orientation,
  currentPath,
}: NavigationMenuProps) {
  const baseClasses =
    orientation === "horizontal"
      ? "flex items-center space-x-1"
      : "flex flex-col space-y-1";

  return (
    <nav className={baseClasses} role="navigation" aria-label="Main navigation">
      {items.map((item) => {
        const IconComponent = item.icon
          ? iconMap[item.icon as keyof typeof iconMap]
          : null;
        const isActive = isNavItemActive(item, currentPath);

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
              "hover:bg-gray-100 hover:text-gray-900",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              orientation === "vertical" && "w-full",
              isActive
                ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                : "text-gray-600"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {IconComponent && (
              <IconComponent className="w-4 h-4" aria-hidden="true" />
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
    </nav>
  );
}

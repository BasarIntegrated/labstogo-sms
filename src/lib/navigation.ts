import { BreadcrumbItem, NavItem } from "@/types/navigation";

/**
 * Get the active navigation item based on current path
 */
export function getActiveNavItem(
  items: NavItem[],
  currentPath: string
): string | null {
  for (const item of items) {
    if (item.href === currentPath) {
      return item.id;
    }

    // Check children if they exist
    if (item.children) {
      const activeChild = getActiveNavItem(item.children, currentPath);
      if (activeChild) {
        return activeChild;
      }
    }
  }

  return null;
}

/**
 * Check if a navigation item should be active
 */
export function isNavItemActive(item: NavItem, currentPath: string): boolean {
  if (item.href === currentPath) {
    return true;
  }

  // Check if current path starts with item href (for nested routes)
  if (item.href !== "/" && currentPath.startsWith(item.href)) {
    return true;
  }

  return false;
}

/**
 * Generate breadcrumbs from current path
 */
export function generateBreadcrumbs(currentPath: string): BreadcrumbItem[] {
  const pathSegments = currentPath.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Special case: if we're on /dashboard, just show "Dashboard"
  if (currentPath === "/dashboard") {
    breadcrumbs.push({
      label: "Dashboard",
      href: "/dashboard",
      isActive: true,
    });
    return breadcrumbs;
  }

  // Always start with Home (which redirects to /dashboard)
  breadcrumbs.push({
    label: "Home",
    href: "/dashboard",
    isActive: false,
  });

  // Build breadcrumbs from path segments
  let currentHref = "";
  pathSegments.forEach((segment, index) => {
    currentHref += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    // Use friendly labels for common routes
    let label = formatBreadcrumbLabel(segment);
    if (segment === "dashboard") {
      label = "Dashboard";
    }

    breadcrumbs.push({
      label,
      href: currentHref,
      isActive: isLast,
    });
  });

  return breadcrumbs;
}

/**
 * Format breadcrumb label from path segment
 */
function formatBreadcrumbLabel(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Filter navigation items based on authentication status
 */
export function filterNavItemsByAuth(
  items: NavItem[],
  isAuthenticated: boolean
): NavItem[] {
  return items.filter((item) => {
    // If item requires auth and user is not authenticated, hide it
    if (item.requiresAuth && !isAuthenticated) {
      return false;
    }

    // Recursively filter children
    if (item.children) {
      item.children = filterNavItemsByAuth(item.children, isAuthenticated);
    }

    return true;
  });
}

/**
 * Get navigation item by ID
 */
export function getNavItemById(items: NavItem[], id: string): NavItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item;
    }

    if (item.children) {
      const found = getNavItemById(item.children, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

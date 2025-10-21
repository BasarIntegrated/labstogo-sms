export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  badge?: string;
  requiresAuth?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "user";
}

export interface Notification {
  id: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  isRead: boolean;
  createdAt: string;
}

export interface HeaderProps {
  user: User | null;
  currentPath: string;
  notifications: Notification[];
}

export interface NavigationMenuProps {
  items: NavItem[];
  orientation: "horizontal" | "vertical";
  currentPath: string;
}

export interface UserMenuProps {
  user: User;
  onSignOut: () => void;
  notifications: Notification[];
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  currentPath: string;
}

export interface BreadcrumbsProps {
  currentPath: string;
  items: BreadcrumbItem[];
}

// Navigation configuration
export const navigationItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: "home",
    requiresAuth: true,
  },
  {
    id: "campaigns",
    label: "Campaigns",
    href: "/campaigns",
    icon: "megaphone",
    requiresAuth: true,
  },
  {
    id: "contacts",
    label: "Contacts",
    href: "/contacts",
    icon: "users",
    requiresAuth: true,
    children: [
      {
        id: "contacts-list",
        label: "All Contacts",
        href: "/contacts",
        icon: "users",
        requiresAuth: true,
      },
      {
        id: "contacts-import",
        label: "Import Contacts",
        href: "/patients/import",
        icon: "upload",
        requiresAuth: true,
      },
    ],
  },
  {
    id: "templates",
    label: "Templates",
    href: "/templates",
    icon: "file-text",
    requiresAuth: true,
  },
  {
    id: "messages",
    label: "Message History",
    href: "/messages",
    icon: "history",
    requiresAuth: true,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: "settings",
    requiresAuth: true,
  },
  {
    id: "queues",
    label: "Queue Dashboard",
    href: "/queue",
    icon: "activity",
    requiresAuth: true,
  },
];

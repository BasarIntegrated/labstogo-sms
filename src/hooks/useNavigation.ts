"use client";

import { filterNavItemsByAuth, getActiveNavItem } from "@/lib/navigation";
import { NavItem, Notification, User } from "@/types/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useNavigation(items: NavItem[], user: User | null) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<NavItem[]>([]);

  useEffect(() => {
    // Filter items based on authentication
    const filtered = filterNavItemsByAuth(items, !!user);
    setFilteredItems(filtered);

    // Set active item
    const active = getActiveNavItem(filtered, pathname);
    setActiveItem(active);
  }, [items, user, pathname]);

  return {
    activeItem,
    filteredItems,
    currentPath: pathname,
  };
}

export function useUserMenu(
  user: User | null,
  notifications: Notification[] = []
) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const count = notifications.filter((n) => !n.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return {
    isOpen,
    unreadCount,
    toggleMenu,
    closeMenu,
  };
}

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = () => setIsOpen(true);
  const closeMenu = () => setIsOpen(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return {
    isOpen,
    openMenu,
    closeMenu,
    toggleMenu,
  };
}

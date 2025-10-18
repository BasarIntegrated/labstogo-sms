import {
  useMobileMenu,
  useNavigation,
  useUserMenu,
} from "@/hooks/useNavigation";
import { Notification, User } from "@/types/navigation";
import { act, renderHook } from "@testing-library/react";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  usePathname: () => "/campaigns",
}));

const mockNavItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
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
];

const mockUser: User = {
  id: "1",
  name: "Test User",
  email: "test@example.com",
  role: "admin",
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    message: "Test notification",
    type: "info",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    message: "Read notification",
    type: "success",
    isRead: true,
    createdAt: new Date().toISOString(),
  },
];

describe("useNavigation", () => {
  it("returns active item and filtered items", () => {
    const { result } = renderHook(() => useNavigation(mockNavItems, mockUser));

    expect(result.current.activeItem).toBe("campaigns");
    expect(result.current.filteredItems).toHaveLength(2);
    expect(result.current.currentPath).toBe("/campaigns");
  });

  it("filters items based on authentication", () => {
    const { result } = renderHook(() => useNavigation(mockNavItems, null));

    expect(result.current.filteredItems).toHaveLength(0);
  });

  it("updates when pathname changes", () => {
    const { result } = renderHook(() => useNavigation(mockNavItems, mockUser));

    expect(result.current.activeItem).toBe("campaigns");
    expect(result.current.currentPath).toBe("/campaigns");
  });
});

describe("useUserMenu", () => {
  it("returns initial state", () => {
    const { result } = renderHook(() =>
      useUserMenu(mockUser, mockNotifications)
    );

    expect(result.current.isOpen).toBe(false);
    expect(result.current.unreadCount).toBe(1); // 1 unread notification
  });

  it("calculates unread count correctly", () => {
    const { result } = renderHook(() =>
      useUserMenu(mockUser, mockNotifications)
    );

    expect(result.current.unreadCount).toBe(1);
  });

  it("toggles menu state", () => {
    const { result } = renderHook(() => useUserMenu(mockUser, []));

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggleMenu();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggleMenu();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("closes menu", () => {
    const { result } = renderHook(() => useUserMenu(mockUser, []));

    act(() => {
      result.current.toggleMenu();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeMenu();
    });
    expect(result.current.isOpen).toBe(false);
  });
});

describe("useMobileMenu", () => {
  it("returns initial state", () => {
    const { result } = renderHook(() => useMobileMenu());

    expect(result.current.isOpen).toBe(false);
  });

  it("opens menu", () => {
    const { result } = renderHook(() => useMobileMenu());

    act(() => {
      result.current.openMenu();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it("closes menu", () => {
    const { result } = renderHook(() => useMobileMenu());

    act(() => {
      result.current.openMenu();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeMenu();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("toggles menu", () => {
    const { result } = renderHook(() => useMobileMenu());

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggleMenu();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggleMenu();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("closes menu on escape key", () => {
    const { result } = renderHook(() => useMobileMenu());

    act(() => {
      result.current.openMenu();
    });
    expect(result.current.isOpen).toBe(true);

    // Simulate escape key press
    act(() => {
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
    });

    expect(result.current.isOpen).toBe(false);
  });

  it("prevents body scroll when menu is open", () => {
    const { result } = renderHook(() => useMobileMenu());

    act(() => {
      result.current.openMenu();
    });
    expect(document.body.style.overflow).toBe("hidden");

    act(() => {
      result.current.closeMenu();
    });
    expect(document.body.style.overflow).toBe("unset");
  });
});

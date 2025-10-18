import { NavigationMenu } from "@/components/layout/NavigationMenu";
import { NavItem } from "@/types/navigation";
import { render, screen } from "@testing-library/react";

const mockNavItems: NavItem[] = [
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
  {
    id: "leads",
    label: "Leads",
    href: "/leads",
    icon: "users",
    requiresAuth: true,
  },
];

describe("NavigationMenu", () => {
  it("renders navigation items", () => {
    render(
      <NavigationMenu
        items={mockNavItems}
        orientation="horizontal"
        currentPath="/"
      />
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Campaigns")).toBeInTheDocument();
    expect(screen.getByText("Leads")).toBeInTheDocument();
  });

  it("highlights active item", () => {
    render(
      <NavigationMenu
        items={mockNavItems}
        orientation="horizontal"
        currentPath="/campaigns"
      />
    );

    const campaignsLink = screen.getByText("Campaigns").closest("a");
    expect(campaignsLink).toHaveAttribute("aria-current", "page");
  });

  it("renders with horizontal orientation", () => {
    render(
      <NavigationMenu
        items={mockNavItems}
        orientation="horizontal"
        currentPath="/"
      />
    );

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("flex", "items-center", "space-x-1");
  });

  it("renders with vertical orientation", () => {
    render(
      <NavigationMenu
        items={mockNavItems}
        orientation="vertical"
        currentPath="/"
      />
    );

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("flex", "flex-col", "space-y-1");
  });

  it("renders icons when provided", () => {
    render(
      <NavigationMenu
        items={mockNavItems}
        orientation="horizontal"
        currentPath="/"
      />
    );

    // Check that icons are rendered (they should have aria-hidden="true")
    const icons = document.querySelectorAll('[aria-hidden="true"]');
    expect(icons).toHaveLength(3);
  });

  it("renders badge when provided", () => {
    const itemsWithBadge: NavItem[] = [
      {
        ...mockNavItems[0],
        badge: "5",
      },
    ];

    render(
      <NavigationMenu
        items={itemsWithBadge}
        orientation="horizontal"
        currentPath="/"
      />
    );

    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(
      <NavigationMenu
        items={mockNavItems}
        orientation="horizontal"
        currentPath="/"
      />
    );

    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Main navigation");
  });
});

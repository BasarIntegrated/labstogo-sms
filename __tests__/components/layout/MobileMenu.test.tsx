import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavItem } from "@/types/navigation";
import { fireEvent, render, screen } from "@testing-library/react";

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
];

describe("MobileMenu", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("renders when isOpen is true", () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        items={mockNavItems}
        currentPath="/"
      />
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Campaigns")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <MobileMenu
        isOpen={false}
        onClose={mockOnClose}
        items={mockNavItems}
        currentPath="/"
      />
    );

    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        items={mockNavItems}
        currentPath="/"
      />
    );

    const closeButton = screen.getByLabelText("Close menu");
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop is clicked", () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        items={mockNavItems}
        currentPath="/"
      />
    );

    const backdrop = screen.getByRole("dialog").previousElementSibling;
    fireEvent.click(backdrop!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when escape key is pressed", () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        items={mockNavItems}
        currentPath="/"
      />
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("highlights active item", () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        items={mockNavItems}
        currentPath="/campaigns"
      />
    );

    const campaignsLink = screen.getByText("Campaigns").closest("a");
    expect(campaignsLink).toHaveAttribute("aria-current", "page");
  });

  it("renders icons", () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        items={mockNavItems}
        currentPath="/"
      />
    );

    const icons = document.querySelectorAll('[aria-hidden="true"]');
    expect(icons).toHaveLength(2);
  });

  it("renders badge when provided", () => {
    const itemsWithBadge: NavItem[] = [
      {
        ...mockNavItems[0],
        badge: "3",
      },
    ];

    render(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        items={itemsWithBadge}
        currentPath="/"
      />
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        items={mockNavItems}
        currentPath="/"
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Mobile navigation menu");
  });

  it("renders brand logo and name", () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        items={mockNavItems}
        currentPath="/"
      />
    );

    expect(screen.getByText("LabsToGo SMS")).toBeInTheDocument();
  });

  it("renders footer with version", () => {
    render(
      <MobileMenu
        isOpen={true}
        onClose={mockOnClose}
        items={mockNavItems}
        currentPath="/"
      />
    );

    expect(screen.getByText("LabsToGo SMS Blaster v1.0")).toBeInTheDocument();
  });
});

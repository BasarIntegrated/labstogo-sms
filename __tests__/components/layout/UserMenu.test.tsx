import { UserMenu } from "@/components/layout/UserMenu";
import { Notification, User } from "@/types/navigation";
import { fireEvent, render, screen } from "@testing-library/react";

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

describe("UserMenu", () => {
  const mockOnSignOut = jest.fn();

  beforeEach(() => {
    mockOnSignOut.mockClear();
  });

  it("renders user information", () => {
    render(
      <UserMenu user={mockUser} onSignOut={mockOnSignOut} notifications={[]} />
    );

    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("shows notification badge with unread count", () => {
    render(
      <UserMenu
        user={mockUser}
        onSignOut={mockOnSignOut}
        notifications={mockNotifications}
      />
    );

    expect(screen.getByText("1")).toBeInTheDocument(); // 1 unread notification
  });

  it("opens dropdown menu when clicked", () => {
    render(
      <UserMenu user={mockUser} onSignOut={mockOnSignOut} notifications={[]} />
    );

    const userMenuButton = screen.getByLabelText("User menu");
    fireEvent.click(userMenuButton);

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("calls onSignOut when sign out is clicked", () => {
    render(
      <UserMenu user={mockUser} onSignOut={mockOnSignOut} notifications={[]} />
    );

    const userMenuButton = screen.getByLabelText("User menu");
    fireEvent.click(userMenuButton);

    const signOutButton = screen.getByText("Sign out");
    fireEvent.click(signOutButton);

    expect(mockOnSignOut).toHaveBeenCalledTimes(1);
  });

  it("closes menu when clicking outside", () => {
    render(
      <div>
        <UserMenu
          user={mockUser}
          onSignOut={mockOnSignOut}
          notifications={[]}
        />
        <div data-testid="outside">Outside element</div>
      </div>
    );

    const userMenuButton = screen.getByLabelText("User menu");
    fireEvent.click(userMenuButton);

    expect(screen.getByText("Profile")).toBeInTheDocument();

    const outsideElement = screen.getByTestId("outside");
    fireEvent.mouseDown(outsideElement);

    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("closes menu when escape key is pressed", () => {
    render(
      <UserMenu user={mockUser} onSignOut={mockOnSignOut} notifications={[]} />
    );

    const userMenuButton = screen.getByLabelText("User menu");
    fireEvent.click(userMenuButton);

    expect(screen.getByText("Profile")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
  });

  it("shows notifications link when there are unread notifications", () => {
    render(
      <UserMenu
        user={mockUser}
        onSignOut={mockOnSignOut}
        notifications={mockNotifications}
      />
    );

    const userMenuButton = screen.getByLabelText("User menu");
    fireEvent.click(userMenuButton);

    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("displays user initials when no avatar is provided", () => {
    render(
      <UserMenu user={mockUser} onSignOut={mockOnSignOut} notifications={[]} />
    );

    expect(screen.getByText("TU")).toBeInTheDocument(); // Test User initials
  });

  it("has proper accessibility attributes", () => {
    render(
      <UserMenu user={mockUser} onSignOut={mockOnSignOut} notifications={[]} />
    );

    const userMenuButton = screen.getByLabelText("User menu");
    expect(userMenuButton).toHaveAttribute("aria-expanded", "false");
    expect(userMenuButton).toHaveAttribute("aria-haspopup", "true");
  });
});

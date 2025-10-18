"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useMobileMenu, useNavigation } from "@/hooks/useNavigation";
import { HeaderProps, navigationItems } from "@/types/navigation";
import { Menu, MessageSquare } from "lucide-react";
import { MobileMenu } from "./MobileMenu";
import { NavigationMenu } from "./NavigationMenu";
import { UserMenu } from "./UserMenu";

export function Header({ user, currentPath, notifications }: HeaderProps) {
  const { filteredItems } = useNavigation(navigationItems, user);
  const { isOpen: isMobileMenuOpen, toggleMenu: toggleMobileMenu } =
    useMobileMenu();

  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Message Blasting App
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <NavigationMenu
                items={filteredItems}
                orientation="horizontal"
                currentPath={currentPath}
              />
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              {/* User Menu */}
              {user ? (
                <UserMenu
                  user={user}
                  onSignOut={handleSignOut}
                  notifications={notifications}
                />
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">?</span>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">Guest</p>
                    <p className="text-xs text-gray-500">Not signed in</p>
                  </div>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
                aria-label="Open mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => toggleMobileMenu()}
        items={filteredItems}
        currentPath={currentPath}
      />
    </>
  );
}

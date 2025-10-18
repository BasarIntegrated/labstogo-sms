# Header Navigation Enhancement Specification

## Overview

This specification defines the requirements for enhancing the header navigation system of the LabsToGo SMS Blaster application. The goal is to create a comprehensive, responsive, and accessible navigation system that improves user experience across all devices.

## Architecture Requirements

### Components to Create/Modify:

- Header.tsx: Main navigation container
- NavigationMenu.tsx: Dropdown menu component
- UserMenu.tsx: User profile dropdown
- MobileMenu.tsx: Mobile navigation drawer
- Breadcrumbs.tsx: Page breadcrumb navigation

### Component Specifications:

#### Header.tsx

- Props: { user: User | null, currentPath: string, notifications: Notification[] }
- State: { isMobileMenuOpen: boolean, isUserMenuOpen: boolean }
- Styling: Tailwind CSS with responsive design
- Accessibility: ARIA labels, keyboard navigation, focus management

#### NavigationMenu.tsx

- Props: { items: NavItem[], orientation: 'horizontal' | 'vertical' }
- State: { activeItem: string, openSubmenu: string | null }
- Features: Hover states, smooth transitions, submenu support
- Styling: Consistent with design system

#### UserMenu.tsx

- Props: { user: User, onSignOut: () => void }
- State: { isOpen: boolean }
- Features: Profile link, settings link, sign out option
- Styling: Dropdown with proper positioning

#### MobileMenu.tsx

- Props: { isOpen: boolean, onClose: () => void, items: NavItem[] }
- State: { activeItem: string }
- Features: Slide-out drawer, touch-friendly interactions
- Styling: Mobile-optimized design

#### Breadcrumbs.tsx

- Props: { currentPath: string, items: BreadcrumbItem[] }
- State: None (stateless)
- Features: Dynamic breadcrumb generation, clickable navigation
- Styling: Subtle, non-intrusive design

## Data Requirements

### Navigation Structure:

```typescript
interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
  badge?: string;
  requiresAuth?: boolean;
}

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "user";
}

interface Notification {
  id: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  isRead: boolean;
  createdAt: string;
}

const navigationItems: NavItem[] = [
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
  {
    id: "settings",
    label: "Settings",
    href: "/settings",
    icon: "settings",
    requiresAuth: true,
  },
];
```

## Styling Requirements

### Design System:

- Use existing Tailwind configuration
- Follow current color scheme (primary, secondary, accent)
- Responsive breakpoints: sm, md, lg, xl
- Dark mode support
- Consistent spacing and typography

### Layout:

- Desktop: Horizontal navigation with user menu on right
- Mobile: Hamburger menu with slide-out drawer
- Tablet: Collapsible horizontal menu

### Color Scheme:

```css
/* Primary Navigation Colors */
--nav-bg: theme("colors.white");
--nav-text: theme("colors.gray.900");
--nav-hover: theme("colors.gray.100");
--nav-active: theme("colors.blue.600");
--nav-border: theme("colors.gray.200");

/* Dark Mode */
--nav-bg-dark: theme("colors.gray.900");
--nav-text-dark: theme("colors.gray.100");
--nav-hover-dark: theme("colors.gray.800");
--nav-active-dark: theme("colors.blue.400");
--nav-border-dark: theme("colors.gray.700");
```

## Functionality Requirements

### Features:

1. **Active State Management**: Highlight current page
2. **Responsive Design**: Mobile-first approach
3. **User Authentication**: Show/hide items based on auth state
4. **Notifications**: Badge count for unread notifications
5. **Search**: Global search functionality (optional)
6. **Breadcrumbs**: Show current page hierarchy

### Interactions:

- Smooth hover animations
- Click outside to close dropdowns
- Keyboard navigation support
- Touch-friendly mobile interactions

### Keyboard Navigation:

- Tab navigation through menu items
- Enter/Space to activate items
- Escape to close dropdowns
- Arrow keys for submenu navigation

## API Requirements

### User Context:

- GET /api/user/profile: Returns current user data
- GET /api/notifications: Returns user notifications
- POST /api/auth/signout: Handles sign out

### Navigation Data:

- GET /api/navigation: Returns navigation structure
- GET /api/breadcrumbs: Returns breadcrumb data for current path

## Accessibility Requirements

### ARIA Labels:

- `aria-label` for navigation landmarks
- `aria-expanded` for dropdown states
- `aria-current` for active navigation items
- `aria-haspopup` for dropdown triggers

### Screen Reader Support:

- Semantic HTML structure
- Proper heading hierarchy
- Descriptive link text
- Focus management

### Keyboard Navigation:

- All interactive elements accessible via keyboard
- Logical tab order
- Focus indicators visible
- Skip links for main content

## Performance Requirements

### Optimization:

- Lazy loading for mobile menu
- Memoization for expensive calculations
- Efficient re-rendering patterns
- Minimal bundle size impact

### Metrics:

- Initial render < 100ms
- Menu interactions < 50ms
- Mobile menu slide < 200ms
- Bundle size increase < 10KB

## Testing Requirements

### Unit Tests:

- Component rendering with different props
- User interaction handling
- Responsive behavior
- Accessibility compliance

### Integration Tests:

- Navigation flow between pages
- User authentication integration
- Mobile menu functionality

### E2E Tests:

- Complete user journey through navigation
- Mobile and desktop navigation flows

## Files to Create/Modify:

### New Files:

- src/components/layout/Header.tsx
- src/components/layout/NavigationMenu.tsx
- src/components/layout/UserMenu.tsx
- src/components/layout/MobileMenu.tsx
- src/components/layout/Breadcrumbs.tsx
- src/hooks/useNavigation.ts
- src/hooks/useUserMenu.ts
- src/lib/navigation.ts
- src/lib/breadcrumbs.ts
- **tests**/components/layout/Header.test.tsx
- **tests**/components/layout/NavigationMenu.test.tsx
- **tests**/components/layout/UserMenu.test.tsx
- **tests**/components/layout/MobileMenu.test.tsx
- **tests**/hooks/useNavigation.test.ts

### Modify Existing:

- src/app/layout.tsx (integrate new header)
- src/components/layout/Layout.tsx (update layout structure)
- src/types/navigation.ts (add navigation types)

## Implementation Phases

### Phase 1: Core Components

1. Create Header.tsx with basic structure
2. Implement NavigationMenu.tsx
3. Add responsive breakpoints
4. Implement basic styling

### Phase 2: User Features

1. Create UserMenu.tsx
2. Implement authentication integration
3. Add notification badges
4. Implement sign out functionality

### Phase 3: Mobile Experience

1. Create MobileMenu.tsx
2. Implement slide-out drawer
3. Add touch interactions
4. Optimize for mobile performance

### Phase 4: Advanced Features

1. Create Breadcrumbs.tsx
2. Implement active state management
3. Add keyboard navigation
4. Implement accessibility features

### Phase 5: Testing & Polish

1. Write comprehensive tests
2. Performance optimization
3. Accessibility audit
4. Cross-browser testing

## Success Criteria:

- [ ] Responsive design works on all screen sizes
- [ ] Navigation items highlight correctly
- [ ] User menu functions properly
- [ ] Mobile menu slides smoothly
- [ ] All accessibility requirements met
- [ ] Tests pass with 90%+ coverage
- [ ] Performance impact < 100ms
- [ ] No console errors or warnings
- [ ] Cross-browser compatibility
- [ ] Dark mode support working
- [ ] Keyboard navigation functional
- [ ] Screen reader compatibility

## Dependencies

### Required Packages:

- @radix-ui/react-dropdown-menu (already installed)
- @radix-ui/react-dialog (already installed)
- lucide-react (already installed)
- clsx (already installed)
- tailwind-merge (already installed)

### External Services:

- Supabase Auth (for user authentication)
- Next.js Router (for navigation)

## Notes

### Design Considerations:

- Maintain consistency with existing design system
- Ensure mobile-first responsive design
- Consider touch targets for mobile devices
- Implement smooth animations and transitions

### Technical Considerations:

- Use React hooks for state management
- Implement proper error boundaries
- Consider performance implications
- Ensure proper TypeScript typing

### Future Enhancements:

- Global search functionality
- Notification center
- User preferences
- Advanced breadcrumb customization

import React from 'react';
import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { navMock } = vi.hoisted(() => ({
  navMock: {
    navOpen: false,
    setNavOpen: vi.fn(),
  },
}));

vi.mock('@payloadcms/ui', () => ({
  useNav: () => navMock,
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

import {
  AdminThemeProviderClient,
  useAdminShell,
} from '@/admin/components/providers/admin-theme-provider-client';
import { CustomSidebarClient } from '@/admin/components/layout/custom-sidebar-client';

function AdminShellProbe() {
  const { isMobileSidebarOpen, toggleMobileSidebar } = useAdminShell();

  return React.createElement(
    'div',
    null,
    React.createElement('span', { 'data-testid': 'mobile-state' }, String(isMobileSidebarOpen)),
    React.createElement(
      'button',
      { type: 'button', onClick: toggleMobileSidebar },
      'toggle-mobile-sidebar',
    ),
  );
}

describe('admin shell mobile nav integration', () => {
  beforeEach(() => {
    navMock.navOpen = false;
    navMock.setNavOpen.mockReset();
    window.localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-admin-theme');

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('mirrors Payload nav state and delegates the mobile toggle back to useNav', () => {
    render(
      React.createElement(
        AdminThemeProviderClient,
        null,
        React.createElement(AdminShellProbe),
      ),
    );

    expect(screen.getByTestId('mobile-state')).toHaveTextContent('false');

    fireEvent.click(screen.getByRole('button', { name: 'toggle-mobile-sidebar' }));

    expect(navMock.setNavOpen).toHaveBeenCalledTimes(1);
    expect(navMock.setNavOpen).toHaveBeenCalledWith(true);

    cleanup();
    navMock.navOpen = true;

    render(
      React.createElement(
        AdminThemeProviderClient,
        null,
        React.createElement(AdminShellProbe),
      ),
    );

    expect(screen.getByTestId('mobile-state')).toHaveTextContent('true');
  });

  it('does not render a second desktop collapse control inside the custom sidebar', () => {
    render(
      React.createElement(
        AdminThemeProviderClient,
        null,
        React.createElement(CustomSidebarClient),
      ),
    );

    expect(
      screen.queryByRole('button', { name: /collapse sidebar/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /expand sidebar/i }),
    ).not.toBeInTheDocument();
  });
});

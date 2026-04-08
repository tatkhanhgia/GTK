import React from 'react';
import { render, screen, cleanup, act, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
}));

vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

import { AdminThemeProviderClient } from '@/admin/components/providers/admin-theme-provider-client';
import { CustomSidebarClient } from '@/admin/components/layout/custom-sidebar-client';

describe('admin shell mobile nav integration', () => {
  beforeEach(() => {
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

  it('reflects the mobile sidebar CSS class on <html> into the sidebar overlay state', async () => {
    // The mobile sidebar is controlled purely via the `admin-mobile-sidebar-open`
    // class on `document.documentElement` (toggled by the header menu button).
    // CustomSidebarClient observes that class via a MutationObserver and
    // swaps the overlay's `aria-hidden` attribute accordingly. The observer
    // fires asynchronously, so the assertions below must use `waitFor`.
    render(
      React.createElement(
        AdminThemeProviderClient,
        null,
        React.createElement(CustomSidebarClient),
      ),
    );

    const overlay = document.querySelector('[aria-hidden]');
    expect(overlay).not.toBeNull();
    // Closed by default — overlay is hidden
    expect(overlay?.getAttribute('aria-hidden')).toBe('true');

    act(() => {
      document.documentElement.classList.add('admin-mobile-sidebar-open');
    });

    await waitFor(() => {
      expect(overlay?.getAttribute('aria-hidden')).toBe('false');
    });

    act(() => {
      document.documentElement.classList.remove('admin-mobile-sidebar-open');
    });

    await waitFor(() => {
      expect(overlay?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('does not render a second desktop collapse control inside the custom sidebar', () => {
    // The desktop collapse toggle lives in the custom header, not the
    // sidebar itself. Guarding against a duplicate button here keeps the
    // sidebar free of the PanelLeft chevron that previously shipped twice.
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

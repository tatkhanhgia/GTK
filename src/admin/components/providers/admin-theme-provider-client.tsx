'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SidebarInjector } from '../layout/sidebar-injector';

type ThemePreference = 'dark' | 'light' | 'system';
type ResolvedTheme = 'dark' | 'light';

interface AdminShellContextValue {
  isDark: boolean;
  isSidebarCollapsed: boolean;
  themePreference: ThemePreference;
  toggleSidebarCollapse: () => void;
  setThemePreference: (nextTheme: ThemePreference) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'gtkblog-admin-theme';
const SIDEBAR_COLLAPSED_KEY = 'gtkblog-admin-sidebar-collapsed';

const AdminShellContext = createContext<AdminShellContextValue | null>(null);

function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  if (preference === 'system') {
    return prefersDark ? 'dark' : 'light';
  }

  return preference;
}

export function AdminThemeProviderClient({ children }: { children?: React.ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') {
      return 'system';
    }

    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    return savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system'
      ? savedTheme
      : 'system';
  });
  const [prefersDark, setPrefersDark] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  // Use CSS-based sidebar state for better compatibility with Payload's Nav component
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  });
  const resolvedTheme: ResolvedTheme = resolveTheme(themePreference, prefersDark);

  // Sync sidebar collapsed state to CSS and localStorage
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const root = window.document.documentElement;
    if (isSidebarCollapsed) {
      root.classList.add('admin-sidebar-collapsed');
    } else {
      root.classList.remove('admin-sidebar-collapsed');
    }
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isSidebarCollapsed));

    // Apply margin-left to main content to prevent sidebar overlap
    // This ensures main content is properly offset regardless of CSS selector specificity
    const SIDEBAR_WIDTH_EXPANDED = 288; // w-72 = 18rem = 288px
    const SIDEBAR_WIDTH_COLLAPSED = 72; // w-[72px] = 72px
    const marginLeft = isSidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

    // Find and update main content elements
    const mainContentSelectors = [
      '.template-default > .group',
      '.payload-admin > .group',
      '.payload-admin > div[class*="group"]',
      '.template-default > div[class*="group"]',
    ];

    // Only apply on desktop (screen width >= 768px)
    const isMobile = window.innerWidth < 768;

    mainContentSelectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        if (isMobile) {
          (el as HTMLElement).style.marginLeft = '0';
        } else {
          (el as HTMLElement).style.marginLeft = `${marginLeft}px`;
        }
      });
    });
  }, [isSidebarCollapsed]);

  // Listen for window resize to update margin on mobile/desktop transition
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      const SIDEBAR_WIDTH_EXPANDED = 288;
      const SIDEBAR_WIDTH_COLLAPSED = 72;
      const marginLeft = isSidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
      const isMobile = window.innerWidth < 768;

      const mainContentSelectors = [
        '.template-default > .group',
        '.payload-admin > .group',
        '.payload-admin > div[class*="group"]',
        '.template-default > div[class*="group"]',
      ];

      mainContentSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
          if (isMobile) {
            (el as HTMLElement).style.marginLeft = '0';
          } else {
            (el as HTMLElement).style.marginLeft = `${marginLeft}px`;
          }
        });
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SIDEBAR_COLLAPSED_KEY && e.newValue !== null) {
        setIsSidebarCollapsed(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    mediaQuery.addEventListener('change', handleThemeChange);

    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  useEffect(() => {
    const rootElement = document.documentElement;
    const isDark = resolvedTheme === 'dark';
    const isLight = resolvedTheme === 'light';
    rootElement.dataset.theme = resolvedTheme;
    rootElement.dataset.adminTheme = resolvedTheme;
    rootElement.classList.toggle('dark', isDark);
    rootElement.classList.toggle('admin-dark', isDark);
    rootElement.classList.toggle('light', isLight);
    rootElement.classList.toggle('admin-light', isLight);
    rootElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [resolvedTheme]);

  const setThemePreference = useCallback((nextTheme: ThemePreference) => {
    setThemePreferenceState(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePreference(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setThemePreference]);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((current) => !current);
  }, []);

  const value = useMemo<AdminShellContextValue>(
    () => ({
      isDark: resolvedTheme === 'dark',
      isSidebarCollapsed,
      themePreference,
      toggleSidebarCollapse,
      setThemePreference,
      toggleTheme,
    }),
    [
      resolvedTheme,
      isSidebarCollapsed,
      themePreference,
      toggleSidebarCollapse,
      setThemePreference,
      toggleTheme,
    ],
  );

  return (
    <AdminShellContext.Provider value={value}>
      {children}
      <SidebarInjector />
    </AdminShellContext.Provider>
  );
}

export function useAdminShell() {
  const context = useContext(AdminShellContext);

  if (!context) {
    throw new Error('useAdminShell must be used within AdminThemeProvider');
  }

  return context;
}

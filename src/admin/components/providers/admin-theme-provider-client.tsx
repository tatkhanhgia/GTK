'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname } from 'next/navigation';
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

  // Sync sidebar collapsed state to CSS and localStorage.
  // The actual layout offset is handled purely in CSS via the
  // --admin-sidebar-width variable on :root (see component-overrides.css),
  // toggled here by adding/removing the .admin-sidebar-collapsed class.
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

  const pathname = usePathname();
  // Detect auth pages via DOM class rather than URL — `/admin` is used for both
  // the login form (unauthenticated) and the dashboard (authenticated), so URL alone
  // cannot distinguish them. Payload adds `.template-login` to a direct child of
  // <body> on auth pages; CSS also uses `body:has(.template-login)` to reset padding.
  const [isAuthTemplate, setIsAuthTemplate] = useState(true);

  useEffect(() => {
    // Payload v3 uses .template-minimal for auth pages (login, forgot-password, reset, etc.)
    const check = () => setIsAuthTemplate(!!document.body.querySelector('.template-minimal'));
    check();
    // Re-check whenever Payload swaps the top-level template wrapper
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true });
    return () => observer.disconnect();
  }, [pathname]); // re-run on navigation

  return (
    <AdminShellContext.Provider value={value}>
      {children}
      {!isAuthTemplate && <SidebarInjector />}
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

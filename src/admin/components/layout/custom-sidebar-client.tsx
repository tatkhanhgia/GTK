'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpLeft,
  FileImage,
  FileText,
  LayoutGrid,
  Newspaper,
  Package,
  UserCircle2,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAdminShell } from '../providers/admin-theme-provider-client';

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutGrid },
  { label: 'Posts', href: '/admin/collections/posts', icon: Newspaper },
  { label: 'Products', href: '/admin/collections/products', icon: Package },
  { label: 'Media', href: '/admin/collections/media', icon: FileImage },
  { label: 'Pages', href: '/admin/collections/pages', icon: FileText },
  { label: 'Users', href: '/admin/collections/users', icon: Users },
  { label: 'Author', href: '/admin/globals/author-profile', icon: UserCircle2 },
];

function isItemActive(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

// Hook to sync with CSS class state
function useSidebarCollapsed() {
  const { isSidebarCollapsed: contextCollapsed } = useAdminShell();
  const [cssCollapsed, setCssCollapsed] = useState(() => {
    if (typeof window === 'undefined') return contextCollapsed;
    return window.document.documentElement.classList.contains('admin-sidebar-collapsed');
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Listen for class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newValue = root.classList.contains('admin-sidebar-collapsed');
          setCssCollapsed((prev) => (prev !== newValue ? newValue : prev));
        }
      });
    });

    observer.observe(root, { attributes: true });

    // Also listen for storage events (cross-tab sync)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'gtkblog-admin-sidebar-collapsed') {
        const newValue = e.newValue === 'true';
        setCssCollapsed((prev) => (prev !== newValue ? newValue : prev));
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Use CSS state if available, otherwise fall back to context
  return cssCollapsed ?? contextCollapsed ?? false;
}

// Hook for mobile sidebar state via CSS class
function useMobileSidebar() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.document.documentElement.classList.contains('admin-mobile-sidebar-open');
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Listen for class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsOpen(root.classList.contains('admin-mobile-sidebar-open'));
        }
      });
    });

    observer.observe(root, { attributes: true });

    return () => observer.disconnect();
  }, []);

  const close = () => {
    document.documentElement.classList.remove('admin-mobile-sidebar-open');
  };

  return { isOpen, close };
}

export function CustomSidebarClient() {
  const pathname = usePathname();
  const isSidebarCollapsed = useSidebarCollapsed();
  const { isOpen: isMobileOpen, close: closeMobileSidebar } = useMobileSidebar();

  // Prevent hydration mismatch by not rendering width-dependent classes until mounted
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close mobile sidebar on escape key
  useEffect(() => {
    if (!isMobileOpen) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileSidebar();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen, closeMobileSidebar]);

  // Close mobile sidebar on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [pathname, closeMobileSidebar]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (!isMobileOpen) {
      document.body.classList.remove('sidebar-open');
      document.body.style.paddingRight = '';
      return undefined;
    }

    document.body.classList.add('sidebar-open');
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : '';

    return () => {
      document.body.classList.remove('sidebar-open');
      document.body.style.paddingRight = '';
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Mobile Overlay */}
      <div
        aria-hidden={!isMobileOpen}
        className={`fixed inset-0 z-40 bg-[rgba(20,20,19,0.58)] backdrop-blur-sm transition-opacity md:hidden ${
          isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeMobileSidebar}
      />

      {/* Sidebar */}
      <aside
        suppressHydrationWarning
        className={`custom-sidebar fixed left-0 top-0 z-50 flex h-[100dvh] flex-col border-r border-[var(--admin-border)] bg-[var(--admin-bg-secondary)] shadow-[var(--admin-shadow-lg)] transition-all duration-300 ease-out md:fixed md:top-0 md:z-30 md:h-[100dvh] md:max-h-[100dvh] md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isClient && isSidebarCollapsed ? 'w-[72px]' : 'w-72'}`}
        style={{ willChange: 'transform, width' }}
      >
        {/* Header */}
        <div
          className={`sidebar-header flex items-center border-b border-[var(--admin-border)] py-5 ${
            isClient && isSidebarCollapsed ? 'justify-center px-3' : 'justify-between px-6'
          }`}
        >
          <Link
            href="/admin"
            className={`flex items-center gap-3 ${isClient && isSidebarCollapsed ? 'justify-center' : ''}`}
            onClick={closeMobileSidebar}
          >
            {isClient && isSidebarCollapsed ? (
              <div className="sidebar-logo flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--admin-accent)] to-[var(--admin-accent-hover)] text-white shadow-lg shadow-[var(--admin-accent)]/30 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-[var(--admin-accent)]/40">
                <span className="text-lg font-bold">G</span>
              </div>
            ) : (
              <>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--admin-accent)] text-white shadow-[var(--admin-shadow-md)]">
                  <span className="text-sm font-semibold">G</span>
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--admin-text-muted)]">
                    Content
                  </p>
                  <span className="text-base font-semibold text-[var(--admin-text-primary)]">
                    GTKBlog
                  </span>
                </div>
              </>
            )}
          </Link>

          {/* Close button - mobile only */}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--admin-text-secondary)] transition-colors hover:bg-[var(--admin-bg-tertiary)] md:hidden"
            onClick={closeMobileSidebar}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={`flex-1 space-y-1.5 overflow-y-auto py-5 ${
            isClient && isSidebarCollapsed ? 'px-2.5' : 'px-4'
          }`}
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive = isItemActive(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`group relative flex min-h-11 items-center rounded-xl transition-all duration-200 ease-out ${
                  isActive
                    ? 'bg-[var(--admin-accent-light)] text-[var(--admin-accent)]'
                    : 'text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] hover:text-[var(--admin-text-primary)]'
                } ${isClient && isSidebarCollapsed
                  ? 'justify-center px-0 mx-auto w-11 h-11'
                  : 'justify-start px-3 gap-3'
                }`}
                onClick={closeMobileSidebar}
                title={isClient && isSidebarCollapsed ? item.label : undefined}
              >
                {/* Active indicator bar for collapsed state */}
                {isClient && isSidebarCollapsed && isActive && (
                  <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1 h-6 bg-[var(--admin-accent)] rounded-r-full" />
                )}

                {/* Icon container */}
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--admin-accent)] text-white shadow-md shadow-[var(--admin-accent)]/30'
                      : 'bg-[var(--admin-bg-primary)] text-[var(--admin-text-tertiary)] group-hover:text-[var(--admin-accent)] group-hover:bg-[var(--admin-bg-secondary)]'
                  } ${isClient && isSidebarCollapsed ? 'scale-100 group-hover:scale-110' : ''}`}
                >
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>

                {/* Label - hidden when collapsed */}
                {!(isClient && isSidebarCollapsed) && (
                  <span className="overflow-hidden whitespace-nowrap text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`border-t border-[var(--admin-border)] py-4 ${isClient && isSidebarCollapsed ? 'px-2.5' : 'px-4'}`}>
          <Link
            href="/"
            className={`group relative flex min-h-11 items-center rounded-xl transition-all duration-200 ${
              isClient && isSidebarCollapsed
                ? 'justify-center w-11 h-11 mx-auto px-0'
                : 'justify-center gap-2 px-4'
            } text-sm text-[var(--admin-text-secondary)] hover:bg-[var(--admin-bg-tertiary)] hover:text-[var(--admin-text-primary)]`}
            onClick={closeMobileSidebar}
            title={isClient && isSidebarCollapsed ? 'Back to site' : undefined}
          >
            <span className={`flex items-center justify-center transition-transform duration-200 ${isClient && isSidebarCollapsed ? 'group-hover:-translate-x-0.5 group-hover:-translate-y-0.5' : 'group-hover:-translate-x-0.5'}`}>
              <ArrowUpLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            </span>
            {!(isClient && isSidebarCollapsed) && <span>Back to site</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, MoonStar, SunMedium, UserRound, ChevronRight, PanelLeft, Bell, Search } from 'lucide-react';
import { useAdminShell } from '../providers/admin-theme-provider-client';
import { useAdminTranslation } from '../../i18n/use-admin-translation';
import { LanguageSwitcherClient } from '../ui/language-switcher-client';
import type { TFunction } from '@payloadcms/translations';
import type { CustomTranslationKeys } from '../../i18n/custom-translations';

// Collections whose list route the header search can jump to. Anything not
// listed falls back to `posts`, the primary editorial surface.
const SEARCHABLE_COLLECTIONS = ['posts', 'products', 'digital-downloads', 'pages', 'users', 'categories', 'media'] as const;
type SearchableCollection = (typeof SEARCHABLE_COLLECTIONS)[number];
const SEARCHABLE_COLLECTION_SET = new Set<string>(SEARCHABLE_COLLECTIONS);

// Field used for the `where[<field>][like]` query parameter per collection.
// Users don't have a title; everything else does.
const SEARCH_FIELD_BY_COLLECTION: Partial<Record<SearchableCollection, string>> = {
  users: 'email',
};

// Each collection maps to a `customHeader:target*` translation key so the
// placeholder / aria-label follow the language picker instead of being
// hardcoded in Vietnamese.
const TARGET_KEY_BY_COLLECTION: Record<SearchableCollection, CustomTranslationKeys> = {
  posts: 'customHeader:targetPosts',
  products: 'customHeader:targetProducts',
  'digital-downloads': 'customHeader:targetDownloads',
  pages: 'customHeader:targetPages',
  users: 'customHeader:targetUsers',
  categories: 'customHeader:targetCategories',
  media: 'customHeader:targetMedia',
};

type SearchTarget = { collection: SearchableCollection; field: string; label: string; isDefault: boolean };

function resolveSearchTarget(pathname: string, t: TFunction<CustomTranslationKeys>): SearchTarget {
  const match = pathname.match(/^\/admin\/collections\/([^/]+)/);
  const matched = match && SEARCHABLE_COLLECTION_SET.has(match[1])
    ? (match[1] as SearchableCollection)
    : null;
  const collection = matched ?? 'posts';
  const field = SEARCH_FIELD_BY_COLLECTION[collection] ?? 'title';
  const label = t(TARGET_KEY_BY_COLLECTION[collection]);
  // When the user is not on a collection list route (e.g. /admin/globals/*),
  // the header search falls back to posts. Surface that clearly in the UI so
  // the aria-label / placeholder do not claim the user is searching the
  // current page.
  return { collection, field, label, isDefault: matched === null };
}

// Exact-match paths that map to a dedicated page-title translation key.
const ROUTE_TITLE_KEYS: Record<string, CustomTranslationKeys> = {
  '/admin': 'customHeader:pageTitleDashboard',
  '/admin/account': 'customHeader:pageTitleAccount',
  '/admin/globals/author-profile': 'customHeader:pageTitleAuthorProfile',
};

// Collection slugs surfaced in the breadcrumb fall back to their sidebar
// translation (already localized). Keeping a narrow map avoids a runtime
// `as any` when widening arbitrary strings to CustomTranslationKeys.
const COLLECTION_TITLE_KEYS: Record<string, CustomTranslationKeys> = {
  posts: 'customSidebar:posts',
  products: 'customSidebar:products',
  'digital-downloads': 'customSidebar:downloads',
  pages: 'customSidebar:pages',
  users: 'customSidebar:users',
  categories: 'customSidebar:categories',
  media: 'customSidebar:media',
};

function toTitleCase(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function getPageTitle(pathname: string, t: TFunction<CustomTranslationKeys>) {
  const routeKey = ROUTE_TITLE_KEYS[pathname];
  if (routeKey) {
    return t(routeKey);
  }

  if (pathname.startsWith('/admin/collections/')) {
    const segments = pathname.split('/').filter(Boolean);
    const collectionSlug = segments[2];
    const baseKey = COLLECTION_TITLE_KEYS[collectionSlug];
    const baseLabel = baseKey ? t(baseKey) : toTitleCase(collectionSlug);

    if (segments[3] === 'create') {
      return t('customHeader:createPrefix', { name: baseLabel });
    }

    return baseLabel;
  }

  if (pathname.startsWith('/admin/globals/')) {
    const segments = pathname.split('/').filter(Boolean);
    return toTitleCase(segments[2]);
  }

  return t('customHeader:pageTitleFallback');
}

export function CustomHeaderClient() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useAdminTranslation();
  const { isDark, isSidebarCollapsed, toggleTheme, toggleSidebarCollapse } = useAdminShell();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pageTitle = getPageTitle(pathname, t);
  const searchTarget = resolveSearchTarget(pathname, t);
  // Before hydration we use the locale-agnostic default so SSR output matches
  // the first client render regardless of the eventual user locale.
  const searchPlaceholder = mounted
    ? t('customHeader:searchPlaceholder', { target: searchTarget.label })
    : t('customHeader:searchPlaceholderDefault');
  const searchAriaLabel = mounted
    ? t('customHeader:searchAria', { target: searchTarget.label })
    : t('customHeader:searchAriaDefault');

  const runSearch = (rawQuery: string) => {
    const query = rawQuery.trim();
    const { collection, field } = searchTarget;
    const base = `/admin/collections/${collection}`;
    if (!query) {
      router.push(base);
      return;
    }
    // Payload v3 admin list accepts where[<field>][like] in the URL and renders
    // the filter chip automatically. Using `like` keeps it case-insensitive and
    // substring-based, which matches end-user expectations for a header search.
    const params = new URLSearchParams();
    params.set(`where[${field}][like]`, query);
    params.set('limit', '10');
    router.push(`${base}?${params.toString()}`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setSearchQuery('');
    }
  };
  // TODO: wire to real notification state — until the notification system exists,
  // keep the bell dot hidden so users aren't trained to ignore a permanent badge.
  const HAS_NOTIFICATIONS = false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track scroll for header shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="payload-admin-header sticky top-0 z-30 w-full">
      {/* Floating Glass Card Container */}
      <div
        className={`
          mx-3 mt-3 rounded-2xl border px-4 py-3
          backdrop-blur-xl md:mx-4 md:mt-4 md:px-5 md:py-3.5
          transition-all duration-300 ease-out
          ${scrolled
            ? 'bg-[var(--admin-bg-primary)]/90 shadow-[var(--admin-shadow-lg)] border-[var(--admin-border)]'
            : 'bg-[var(--admin-bg-primary)]/70 shadow-[var(--admin-shadow-md)] border-[var(--admin-border)]/60'
          }
        `}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left Section: Menu + Title */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="
                group relative inline-flex h-10 w-10 items-center justify-center
                rounded-xl border border-[var(--admin-border)]
                bg-gradient-to-br from-[var(--admin-bg-secondary)] to-[var(--admin-bg-tertiary)]
                text-[var(--admin-text-secondary)]
                transition-all duration-200
                hover:border-[var(--admin-accent)]/40 hover:shadow-[var(--admin-shadow-sm)]
                hover:text-[var(--admin-accent)]
                active:scale-95 md:hidden
                overflow-hidden
              "
              onClick={() => {
                document.documentElement.classList.toggle('admin-mobile-sidebar-open');
              }}
              aria-label={t('customHeader:toggleMobileSidebar')}
            >
              <span className="absolute inset-0 bg-gradient-to-br from-[var(--admin-accent)]/0 to-[var(--admin-accent)]/0 group-hover:from-[var(--admin-accent)]/5 group-hover:to-[var(--admin-accent)]/10 transition-all duration-300" />
              <Menu className="relative h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              type="button"
              className={`
                group relative hidden md:inline-flex h-10 w-10 items-center justify-center
                rounded-xl border transition-all duration-300
                ${isSidebarCollapsed
                  ? 'border-[var(--admin-accent)]/50 bg-[var(--admin-accent-light)] text-[var(--admin-accent)] shadow-[var(--admin-shadow-sm)]'
                  : 'border-[var(--admin-border)] bg-gradient-to-br from-[var(--admin-bg-secondary)] to-[var(--admin-bg-tertiary)] text-[var(--admin-text-secondary)] hover:border-[var(--admin-accent)]/40 hover:text-[var(--admin-accent)]'
                }
                hover:shadow-[var(--admin-shadow-sm)] active:scale-95
                overflow-hidden
              `}
              onClick={toggleSidebarCollapse}
              aria-label={
                mounted
                  ? isSidebarCollapsed
                    ? t('customHeader:sidebarExpand')
                    : t('customHeader:sidebarCollapse')
                  : t('customHeader:sidebarToggleFallback')
              }
              title={
                mounted
                  ? isSidebarCollapsed
                    ? t('customHeader:sidebarExpand')
                    : t('customHeader:sidebarCollapse')
                  : t('customHeader:sidebarToggleFallback')
              }
              suppressHydrationWarning
            >
              <span className="absolute inset-0 bg-gradient-to-br from-[var(--admin-accent)]/0 to-[var(--admin-accent)]/0 group-hover:from-[var(--admin-accent)]/5 group-hover:to-[var(--admin-accent)]/10 transition-all duration-300" />
              <PanelLeft
                className={`
                  relative h-[18px] w-[18px] transition-all duration-300
                  ${isSidebarCollapsed ? 'rotate-180' : ''}
                  group-hover:scale-110
                `}
                aria-hidden="true"
              />
            </button>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-gradient-to-b from-transparent via-[var(--admin-border)] to-transparent md:block" />

            {/* Page Title with Breadcrumb */}
            <div className="flex flex-col">
              {/* Breadcrumb */}
              <div className="hidden items-center gap-1.5 text-[11px] font-medium text-[var(--admin-text-muted)] md:flex">
                <span className="transition-colors hover:text-[var(--admin-text-secondary)] cursor-default">GTKBlog</span>
                <ChevronRight className="h-3 w-3 opacity-50" />
                <span className="text-[var(--admin-accent)]">{t('customHeader:breadcrumbAdmin')}</span>
                <ChevronRight className="h-3 w-3 opacity-50" />
                <span className="text-[var(--admin-text-secondary)] truncate max-w-[150px]">{pageTitle}</span>
              </div>
              {/* Title */}
              <h1 className="text-base font-semibold leading-tight tracking-tight text-[var(--admin-text-primary)] md:text-lg">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Center Section - Search (hidden on mobile) */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--admin-text-muted)] group-focus-within:text-[var(--admin-accent)] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder={searchPlaceholder}
                aria-label={searchAriaLabel}
                suppressHydrationWarning
                className="
                  admin-header-search-input
                  w-full h-10 pl-10 pr-4 rounded-xl
                  bg-[var(--admin-bg-secondary)]/50
                  border border-[var(--admin-border)]
                  text-sm text-[var(--admin-text-primary)]
                  placeholder:text-[var(--admin-text-muted)]
                  focus:outline-none focus:border-[var(--admin-accent)]/50 focus:bg-[var(--admin-bg-secondary)]
                  focus:shadow-[0_0_0_3px_rgba(217,119,87,0.1)]
                  transition-all duration-200
                "
              />
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button (mobile) */}
            <button
              type="button"
              className="lg:hidden group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-gradient-to-br from-[var(--admin-bg-secondary)] to-[var(--admin-bg-tertiary)] text-[var(--admin-text-secondary)] transition-all duration-200 hover:border-[var(--admin-accent)]/40 hover:text-[var(--admin-accent)] hover:shadow-[var(--admin-shadow-sm)] active:scale-95 overflow-hidden"
              aria-label={t('customHeader:searchMobileLabel')}
            >
              <Search className="relative h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-gradient-to-br from-[var(--admin-bg-secondary)] to-[var(--admin-bg-tertiary)] text-[var(--admin-text-secondary)] transition-all duration-200 hover:border-[var(--admin-accent)]/40 hover:text-[var(--admin-accent)] hover:shadow-[var(--admin-shadow-sm)] active:scale-95 overflow-hidden"
              aria-label={t('customHeader:notifications')}
            >
              <span className="absolute inset-0 bg-gradient-to-br from-[var(--admin-accent)]/0 to-[var(--admin-accent)]/0 group-hover:from-[var(--admin-accent)]/5 group-hover:to-[var(--admin-accent)]/10 transition-all duration-300" />
              <Bell className="relative h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
              {/* Notification dot — gated until a real notification system is wired up */}
              {HAS_NOTIFICATIONS && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[var(--admin-accent)] ring-2 ring-[var(--admin-bg-secondary)]" />
              )}
            </button>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-gradient-to-b from-transparent via-[var(--admin-border)] to-transparent sm:block" />

            {/* Account Link */}
            <Link
              href="/admin/account"
              className="
                group inline-flex h-10 items-center gap-2
                rounded-xl border border-[var(--admin-border)]
                bg-gradient-to-br from-[var(--admin-bg-secondary)] to-[var(--admin-bg-tertiary)]
                px-3 text-sm font-medium text-[var(--admin-text-secondary)]
                transition-all duration-200
                hover:border-[var(--admin-accent)]/40 hover:shadow-[var(--admin-shadow-sm)]
                hover:text-[var(--admin-accent)]
                active:scale-95
                relative overflow-hidden
              "
            >
              <span className="absolute inset-0 bg-gradient-to-br from-[var(--admin-accent)]/0 to-[var(--admin-accent)]/0 group-hover:from-[var(--admin-accent)]/5 group-hover:to-[var(--admin-accent)]/10 transition-all duration-300" />
              <UserRound className="relative h-4 w-4 transition-transform duration-200 group-hover:scale-110" aria-hidden="true" />
              <span className="relative hidden sm:inline">{t('customHeader:account')}</span>
            </Link>

            {/* Language Switcher */}
            <LanguageSwitcherClient />

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="
                group relative inline-flex h-10 w-10 items-center justify-center
                rounded-xl border border-[var(--admin-border)]
                bg-gradient-to-br from-[var(--admin-bg-secondary)] to-[var(--admin-bg-tertiary)]
                text-[var(--admin-text-secondary)]
                transition-all duration-200
                hover:border-[var(--admin-accent)]/40 hover:shadow-[var(--admin-shadow-sm)]
                hover:text-[var(--admin-accent)]
                active:scale-95
                overflow-hidden
              "
              aria-label={
                mounted
                  ? isDark
                    ? t('customHeader:themeDark')
                    : t('customHeader:themeLight')
                  : t('customHeader:themeToggle')
              }
              suppressHydrationWarning
            >
              <span className="absolute inset-0 bg-gradient-to-br from-[var(--admin-accent)]/0 to-[var(--admin-accent)]/0 group-hover:from-[var(--admin-accent)]/5 group-hover:to-[var(--admin-accent)]/10 transition-all duration-300" />
              <span className="relative h-5 w-5" suppressHydrationWarning>
                {mounted ? (
                  isDark ? (
                    <SunMedium className="h-5 w-5 transition-all duration-300 group-hover:rotate-90 group-hover:scale-110" aria-hidden="true" />
                  ) : (
                    <MoonStar className="h-5 w-5 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110" aria-hidden="true" />
                  )
                ) : (
                  <span className="block h-5 w-5" />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

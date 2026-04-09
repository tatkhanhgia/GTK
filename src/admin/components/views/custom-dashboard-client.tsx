'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Database,
  FileImage,
  FileText,
  HardDrive,
  Newspaper,
  Package,
  Search,
  ShieldCheck,
  Upload,
  UserCog,
  Users,
  Sparkles,
  TrendingUp,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '../ui/card';

type CollectionSlug = 'media' | 'pages' | 'posts' | 'products' | 'users';

interface PayloadListResponse<TDocument> {
  docs: TDocument[];
  totalDocs: number;
}

interface DashboardDocument {
  alt?: string;
  id: number | string;
  name?: string | Record<string, string>;
  title?: string | Record<string, string>;
  updatedAt?: string;
}

interface ActivityItem {
  accentClass: string;
  href: string;
  id: string;
  label: string;
  timeLabel: string;
  title: string;
}

interface StatCardData {
  description: string;
  href: string;
  icon: LucideIcon;
  isPrimary?: boolean;
  title: string;
  value: number;
}

interface DashboardState {
  activities: ActivityItem[];
  stats: StatCardData[];
  status: 'error' | 'loading' | 'ready';
}

const COUNT_ENDPOINTS: Array<Pick<StatCardData, 'description' | 'href' | 'icon' | 'title'> & { url: string }> = [
  {
    title: 'Published Posts',
    description: 'Live article count',
    href: '/admin/collections/posts',
    icon: Newspaper,
    url: '/api/posts?where[status][equals]=published&limit=0&depth=0',
  },
  {
    title: 'Products',
    description: 'Published product listings',
    href: '/admin/collections/products',
    icon: Package,
    url: '/api/products?where[status][equals]=published&limit=0&depth=0',
  },
  {
    title: 'Media Library',
    description: 'Uploaded assets',
    href: '/admin/collections/media',
    icon: FileImage,
    url: '/api/media?limit=0&depth=0',
  },
  {
    title: 'Admin Users',
    description: 'Payload accounts',
    href: '/admin/collections/users',
    icon: Users,
    url: '/api/users?limit=0&depth=0',
  },
];

const QUICK_ACTIONS: Array<{
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
  gradient: string;
}> = [
  {
    title: 'Viết bài mới',
    description: 'Tạo và xuất bản bài viết mới',
    href: '/admin/collections/posts/create',
    icon: FileText,
    gradient: 'from-[var(--admin-accent)]/20 to-[var(--admin-accent)]/5',
  },
  {
    title: 'Thêm sản phẩm',
    description: 'Tạo sản phẩm số mới',
    href: '/admin/collections/products/create',
    icon: Package,
    gradient: 'from-[var(--admin-success)]/20 to-[var(--admin-success)]/5',
  },
  {
    title: 'Tải media lên',
    description: 'Thêm hình ảnh hoặc file tải xuống',
    href: '/admin/collections/media/create',
    icon: Upload,
    gradient: 'from-[var(--admin-info)]/20 to-[var(--admin-info)]/5',
  },
  {
    title: 'Quản lý users',
    description: 'Xem quyền editor và admin',
    href: '/admin/collections/users',
    icon: UserCog,
    gradient: 'from-[var(--admin-warning)]/20 to-[var(--admin-warning)]/5',
  },
];

const ACTIVITY_ENDPOINTS: Array<{
  accentClass: string;
  href: (id: number | string) => string;
  label: string;
  slug: CollectionSlug;
  url: string;
}> = [
  {
    slug: 'posts',
    label: 'Bài viết cập nhật',
    accentClass: 'bg-[var(--admin-accent)]',
    href: (id) => `/admin/collections/posts/${id}`,
    url: '/api/posts?sort=-updatedAt&limit=2&depth=0',
  },
  {
    slug: 'products',
    label: 'Sản phẩm cập nhật',
    accentClass: 'bg-[var(--admin-success)]',
    href: (id) => `/admin/collections/products/${id}`,
    url: '/api/products?sort=-updatedAt&limit=2&depth=0',
  },
  {
    slug: 'media',
    label: 'Media tải lên',
    accentClass: 'bg-[var(--admin-info)]',
    href: (id) => `/admin/collections/media/${id}`,
    url: '/api/media?sort=-updatedAt&limit=2&depth=0',
  },
  {
    slug: 'pages',
    label: 'Trang chỉnh sửa',
    accentClass: 'bg-[var(--admin-warning)]',
    href: (id) => `/admin/collections/pages/${id}`,
    url: '/api/pages?sort=-updatedAt&limit=2&depth=0',
  },
];

async function fetchJSON<TData>(url: string) {
  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw new Error(`Request failed for ${url}`);
  }

  return (await response.json()) as TData;
}

function readTitle(value: DashboardDocument['alt' | 'name' | 'title']) {
  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  if (value && typeof value === 'object') {
    const localizedValue = Object.values(value).find(
      (entry) => typeof entry === 'string' && entry.trim().length > 0,
    );

    if (localizedValue) {
      return localizedValue;
    }
  }

  return 'Untitled item';
}

function formatRelativeTime(value?: string, locale: string = 'vi') {
  if (!value) {
    return locale === 'vi' ? 'Vừa xong' : 'Just now';
  }

  const targetDate = new Date(value);
  const diffInSeconds = Math.round((targetDate.getTime() - Date.now()) / 1000);

  // Vietnamese relative time
  if (locale === 'vi') {
    const absSeconds = Math.abs(diffInSeconds);
    if (absSeconds < 60) return diffInSeconds > 0 ? 'Trong vài giây' : 'Vừa xong';
    if (absSeconds < 3600) {
      const mins = Math.round(absSeconds / 60);
      return diffInSeconds > 0 ? `Trong ${mins} phút` : `${mins} phút trước`;
    }
    if (absSeconds < 86400) {
      const hours = Math.round(absSeconds / 3600);
      return diffInSeconds > 0 ? `Trong ${hours} giờ` : `${hours} giờ trước`;
    }
    if (absSeconds < 604800) {
      const days = Math.round(absSeconds / 86400);
      return diffInSeconds > 0 ? `Trong ${days} ngày` : `${days} ngày trước`;
    }
    if (absSeconds < 2592000) {
      const weeks = Math.round(absSeconds / 604800);
      return diffInSeconds > 0 ? `Trong ${weeks} tuần` : `${weeks} tuần trước`;
    }
    if (absSeconds < 31536000) {
      const months = Math.round(absSeconds / 2592000);
      return diffInSeconds > 0 ? `Trong ${months} tháng` : `${months} tháng trước`;
    }
    const years = Math.round(absSeconds / 31536000);
    return diffInSeconds > 0 ? `Trong ${years} năm` : `${years} năm trước`;
  }

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const intervals: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 60 * 60 * 24 * 365],
    ['month', 60 * 60 * 24 * 30],
    ['week', 60 * 60 * 24 * 7],
    ['day', 60 * 60 * 24],
    ['hour', 60 * 60],
    ['minute', 60],
  ];

  for (const [unit, seconds] of intervals) {
    if (Math.abs(diffInSeconds) >= seconds) {
      return formatter.format(Math.round(diffInSeconds / seconds), unit);
    }
  }

  return formatter.format(diffInSeconds, 'second');
}

async function loadDashboardData(): Promise<DashboardState> {
  const [statResponses, activityResponses] = await Promise.all([
    Promise.all(
      COUNT_ENDPOINTS.map((item) => fetchJSON<PayloadListResponse<DashboardDocument>>(item.url)),
    ),
    Promise.all(
      ACTIVITY_ENDPOINTS.map((item) => fetchJSON<PayloadListResponse<DashboardDocument>>(item.url)),
    ),
  ]);

  const stats = COUNT_ENDPOINTS.map((item, index) => ({
    description: item.description,
    href: item.href,
    icon: item.icon,
    isPrimary: index === 0,
    title: item.title,
    value: statResponses[index]?.totalDocs ?? 0,
  }));

  const activities = activityResponses
    .flatMap((response, index) =>
      response.docs.map((doc) => ({
        accentClass: ACTIVITY_ENDPOINTS[index].accentClass,
        href: ACTIVITY_ENDPOINTS[index].href(doc.id),
        id: `${ACTIVITY_ENDPOINTS[index].slug}-${doc.id}`,
        label: ACTIVITY_ENDPOINTS[index].label,
        timeLabel: formatRelativeTime(doc.updatedAt),
        title: readTitle(doc.title ?? doc.name ?? doc.alt),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).getTime() : 0,
      })),
    )
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, 6)
    .map((item) => ({
      accentClass: item.accentClass,
      href: item.href,
      id: item.id,
      label: item.label,
      timeLabel: item.timeLabel,
      title: item.title,
    }));

  return {
    activities,
    stats,
    status: 'ready',
  };
}

function formatNumber(num: number): string {
  return num.toLocaleString('vi-VN');
}

function StatCard({ description, href, icon: Icon, isPrimary, title, value }: StatCardData) {
  return (
    <Link href={href} className={`block ${isPrimary ? 'lg:col-span-2' : ''}`}>
      <Card
        className="h-full min-h-[140px] group relative overflow-hidden"
        variant="elevated"
      >
        {/* Background gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--admin-accent)]/0 to-[var(--admin-accent)]/0 group-hover:from-[var(--admin-accent)]/5 group-hover:to-[var(--admin-accent)]/10 transition-all duration-500" />

        <div className="relative flex h-full items-start justify-between gap-4">
          <div className="flex flex-col">
            <p className="text-sm font-medium text-[var(--admin-text-secondary)]">{title}</p>
            <p
              className={`mt-2 text-[var(--admin-text-primary)] ${
                isPrimary ? 'text-3xl font-bold tracking-tight md:text-4xl' : 'text-2xl font-bold md:text-3xl'
              }`}
            >
              {formatNumber(value)}
            </p>
            <p className="mt-auto pt-2 text-sm text-[var(--admin-text-muted)]">{description}</p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--admin-accent-light)] to-[var(--admin-accent-light)]/50 text-[var(--admin-accent)] group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
      </Card>
    </Link>
  );
}

function QuickActionCard({ description, href, icon: Icon, title, gradient }: typeof QUICK_ACTIONS[0]) {
  return (
    <Link
      href={href}
      className="group relative flex min-h-[120px] items-start gap-4 rounded-xl border border-[var(--admin-border)] bg-gradient-to-br from-[var(--admin-bg-tertiary)] to-[var(--admin-bg-secondary)] p-5 shadow-[var(--admin-shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--admin-accent)]/30 hover:shadow-[var(--admin-shadow-md)] overflow-hidden"
    >
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--admin-accent-light)] to-[var(--admin-accent-light)]/50 text-[var(--admin-accent)] transition-all duration-300 group-hover:bg-[var(--admin-accent)] group-hover:text-white shadow-sm">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="relative min-w-0 flex-1">
        <h3 className="font-semibold text-[var(--admin-text-primary)] group-hover:text-[var(--admin-accent)] transition-colors">{title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-[var(--admin-text-secondary)]">{description}</p>
      </div>

      {/* Arrow indicator */}
      <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-[var(--admin-text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={index === 0 ? 'xl:col-span-2' : ''}>
            <Card className="h-full">
              <div className="space-y-4">
                <div className="skeleton h-4 w-28 rounded-full" />
                <div className="skeleton h-10 w-24 rounded-2xl" />
                <div className="skeleton h-4 w-36 rounded-full" />
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton h-28 rounded-2xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card title="Recent Activity" description="Loading the latest updates">
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="skeleton mt-1 h-3 w-3 rounded-full" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-4 w-3/4 rounded-full" />
                  <div className="skeleton h-3 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </Card>
        <div className="skeleton h-[320px] rounded-2xl" />
      </div>
    </div>
  );
}

export const CustomDashboardClient = React.memo(function CustomDashboardClient() {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    activities: [],
    stats: [],
    status: 'loading',
  });

  useEffect(() => {
    let isMounted = true;

    loadDashboardData()
      .then((result) => {
        if (isMounted) {
          setDashboardState(result);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDashboardState({ activities: [], stats: [], status: 'error' });
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main
      id="admin-main-content"
      className="dashboard-content min-h-[calc(100dvh-5rem)] overflow-x-clip bg-gradient-to-b from-[var(--admin-bg-primary)] to-[var(--admin-bg-secondary)] px-4 pb-8 pt-4 sm:px-6 sm:pb-10 lg:px-8 lg:pb-12"
    >
      <div className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--admin-accent)]/10 via-[var(--admin-accent)]/5 to-transparent p-6 md:p-8">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-[var(--admin-accent)]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-[var(--admin-success)]/10 blur-2xl" />

          <div className="relative max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-[var(--admin-accent)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--admin-accent)]">
                Tổng quan
              </p>
            </div>
            <h2 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-[var(--admin-text-primary)] md:text-3xl lg:text-4xl">
              Quản lý nội dung, sản phẩm và media từ một giao diện duy nhất.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[var(--admin-text-secondary)]">
              Số liệu được tải trực tiếp từ Payload CMS để dashboard luôn phản ánh trạng thái
              hiện tại của hệ thống.
            </p>
          </div>
        </div>

        {dashboardState.status === 'loading' ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-8">
            {/* Stats Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-[var(--admin-accent)]" />
                <h2 className="text-lg font-semibold text-[var(--admin-text-primary)]">Thống kê</h2>
              </div>

              {dashboardState.stats.length > 0 ? (
                <div className="stats-grid grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {dashboardState.stats.map((item) => (
                    <StatCard key={item.title} {...item} />
                  ))}
                </div>
              ) : (
                <Card className="border-[rgba(217,79,79,0.25)]">
                  <div className="empty-state">
                    <Database className="empty-state-icon" />
                    <p className="empty-state-title">Không thể tải dữ liệu</p>
                    <p className="empty-state-description">
                      Không thể kết nối đến Payload API. Các thao tác nhanh vẫn có sẵn bên dưới.
                    </p>
                  </div>
                </Card>
              )}
            </section>

            {/* Quick Actions */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-[var(--admin-accent)]" />
                <h2 className="text-lg font-semibold text-[var(--admin-text-primary)]">Thao tác nhanh</h2>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {QUICK_ACTIONS.map((item) => (
                  <QuickActionCard key={item.title} {...item} />
                ))}
              </div>
            </section>

            {/* Activity & Status */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
              <Card
                title="Hoạt động gần đây"
                description="Cập nhật mới nhất từ các collections"
                className="relative overflow-hidden"
              >
                {/* Decorative line */}
                <div className="absolute left-[1.625rem] top-20 bottom-8 w-px bg-gradient-to-b from-[var(--admin-border)] via-[var(--admin-border)] to-transparent" />

                {dashboardState.status === 'error' ? (
                  <p className="text-sm text-[var(--admin-error)]">
                    Không thể tải hoạt động. Kiểm tra kết nối API hoặc thử làm mới trang.
                  </p>
                ) : dashboardState.activities.length === 0 ? (
                  <div className="py-8 text-center">
                    <Newspaper className="mx-auto mb-3 h-12 w-12 text-[var(--admin-text-muted)]" />
                    <p className="text-sm font-medium text-[var(--admin-text-primary)]">Chưa có hoạt động</p>
                    <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">
                      Hoạt động sẽ xuất hiện khi bạn tạo hoặc chỉnh sửa nội dung.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {dashboardState.activities.map((item) => (
                      <Link key={item.id} href={item.href} className="group block relative">
                        <div className="flex items-start gap-4">
                          <div className="relative flex flex-col items-center z-10">
                            <div className={`h-3.5 w-3.5 rounded-full ${item.accentClass} ring-4 ring-[var(--admin-bg-secondary)] group-hover:scale-125 transition-transform duration-300`} />
                          </div>
                          <div className="flex-1 border-b border-[var(--admin-border)] pb-5 last:border-b-0 group-hover:border-[var(--admin-accent)]/30 transition-colors">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-[var(--admin-text-primary)] group-hover:text-[var(--admin-accent)] transition-colors">
                                  {item.label}
                                </p>
                                <p className="mt-1 line-clamp-2 text-sm text-[var(--admin-text-secondary)]">
                                  {item.title}
                                </p>
                              </div>
                              <time className="shrink-0 text-xs tabular-nums text-[var(--admin-text-muted)]">
                                {item.timeLabel}
                              </time>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card>

              <Card
                title="Trạng thái hệ thống"
                description="Kiểm tra nhanh hệ thống admin"
                actions={
                  <Link
                    href="/admin/collections/media"
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--admin-accent)] hover:gap-2 transition-all"
                  >
                    Mở thư viện
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                }
                className="bg-gradient-to-b from-[var(--admin-bg-secondary)] to-[var(--admin-bg-primary)]"
              >
                <div className="space-y-3">
                  {[
                    { label: 'Database', status: 'Đã kết nối', icon: Database, color: 'bg-[var(--admin-success)]' },
                    { label: 'Media Storage', status: 'Hoạt động', icon: HardDrive, color: 'bg-[var(--admin-info)]' },
                    { label: 'Search Index', status: 'Sẵn sàng', icon: Search, color: 'bg-[var(--admin-warning)]' },
                    { label: 'Permissions', status: 'Được bảo vệ', icon: ShieldCheck, color: 'bg-[var(--admin-accent)]' },
                  ].map(({ icon: Icon, label, status, color }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between gap-4 rounded-xl bg-[var(--admin-bg-primary)]/50 backdrop-blur-sm border border-[var(--admin-border)] px-4 py-3 hover:border-[var(--admin-accent)]/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--admin-accent-light)] to-[var(--admin-accent-light)]/50 text-[var(--admin-accent)]">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="text-sm font-medium text-[var(--admin-text-primary)]">
                          {label}
                        </span>
                      </div>
                      <span className={`rounded-full ${color}/10 px-3 py-1 text-xs font-semibold ${color.replace('bg-', 'text-')}`}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
});

/**
 * Custom admin-panel translations merged into Payload's i18n registry.
 *
 * Design notes:
 * - Keys live under three flat namespaces (`customSidebar`, `customHeader`,
 *   `customDashboard`) so that each key looks like `namespace:flatKey` at the
 *   call site. A single colon is the safest interop with i18next's parser:
 *   deeper nesting (`custom:sidebar:posts`) is legal in Payload's TypeScript
 *   generics but has bitten us before at runtime when sub-namespaces were
 *   interpreted as key paths.
 * - Interpolation placeholders use i18next's `{{name}}` syntax — the same as
 *   Payload core keys, so the same `t(key, { target })` call works.
 * - Kept Vietnamese first since `fallbackLanguage: 'vi'`; the English object
 *   mirrors the same shape so the TypeScript type is derived from either.
 */

/**
 * Structural contract for every custom translation language variant.
 * Declared as a plain `type` so both vi and en can be annotated against the
 * same shape — using `as const` on the vi object narrowed the value types to
 * Vietnamese literals and blocked the English assignment.
 */
type CustomTranslationsShape = {
  customSidebar: {
    dashboard: string;
    aiConsole: string;
    posts: string;
    products: string;
    downloads: string;
    pages: string;
    categories: string;
    users: string;
    siteUsers: string;
    emailSettings: string;
    media: string;
    author: string;
    backToSite: string;
    closeSidebar: string;
    navigationLabel: string;
  };
  customHeader: {
    breadcrumbAdmin: string;
    pageTitleDashboard: string;
    pageTitleAiConsole: string;
    pageTitleAccount: string;
    pageTitleAuthorProfile: string;
    pageTitleFallback: string;
    createPrefix: string;
    searchPlaceholder: string;
    searchPlaceholderDefault: string;
    searchAria: string;
    searchAriaDefault: string;
    searchMobileLabel: string;
    targetPosts: string;
    targetProducts: string;
    targetDownloads: string;
    targetPages: string;
    targetCategories: string;
    targetUsers: string;
    targetMedia: string;
    sidebarExpand: string;
    sidebarCollapse: string;
    sidebarToggleFallback: string;
    toggleMobileSidebar: string;
    notifications: string;
    account: string;
    themeDark: string;
    themeLight: string;
    themeToggle: string;
    langSwitcherLabel: string;
    langSwitcherVi: string;
    langSwitcherEn: string;
  };
  customCells: {
    statusDraft: string;
    statusPublished: string;
    statusAriaLabel: string;
    typeEbook: string;
    typeTemplate: string;
    typeCode: string;
    typeAriaLabel: string;
    priceAriaLabel: string;
  };
  customFields: {
    platformNoOptions: string;
    platformPlaceholder: string;
  };
  version: {
    versionID: string;
    versions: string;
  };
  customDashboard: {
    heroKicker: string;
    heroTitle: string;
    heroSubtitle: string;
    sectionStats: string;
    sectionQuickActions: string;
    sectionRecentActivity: string;
    sectionRecentActivityDescription: string;
    sectionSystemStatus: string;
    sectionSystemStatusDescription: string;
    openLibrary: string;
    statPublishedPostsTitle: string;
    statPublishedPostsDescription: string;
    statProductsTitle: string;
    statProductsDescription: string;
    statMediaTitle: string;
    statMediaDescription: string;
    statUsersTitle: string;
    statUsersDescription: string;
    quickPostTitle: string;
    quickPostDescription: string;
    quickProductTitle: string;
    quickProductDescription: string;
    quickMediaTitle: string;
    quickMediaDescription: string;
    quickUsersTitle: string;
    quickUsersDescription: string;
    activityPostsLabel: string;
    activityProductsLabel: string;
    activityMediaLabel: string;
    activityPagesLabel: string;
    statsLoadErrorTitle: string;
    statsLoadErrorDescription: string;
    activityLoadError: string;
    noActivityTitle: string;
    noActivityDescription: string;
    untitledItem: string;
    systemDatabase: string;
    systemMediaStorage: string;
    systemSearchIndex: string;
    systemPermissions: string;
    systemStatusConnected: string;
    systemStatusActive: string;
    systemStatusReady: string;
    systemStatusProtected: string;
  };
};

export const customTranslationsVi: CustomTranslationsShape = {
  customSidebar: {
    dashboard: 'Bảng điều khiển',
    aiConsole: 'AI Console',
    posts: 'Bài viết',
    products: 'Sản phẩm',
    downloads: 'Tệp tải xuống',
    pages: 'Trang',
    categories: 'Danh mục',
    users: 'Người dùng',
    siteUsers: 'Thanh vien site',
    emailSettings: 'Cai dat email',
    media: 'Media',
    author: 'Tác giả',
    backToSite: 'Về trang chủ',
    closeSidebar: 'Đóng thanh điều hướng',
    navigationLabel: 'Điều hướng chính',
  },
  customHeader: {
    breadcrumbAdmin: 'Quản trị',
    pageTitleDashboard: 'Bảng điều khiển',
    pageTitleAiConsole: 'AI Ops Console',
    pageTitleAccount: 'Tài khoản',
    pageTitleAuthorProfile: 'Hồ sơ tác giả',
    pageTitleFallback: 'Trang quản trị',
    createPrefix: 'Tạo {{name}}',
    searchPlaceholder: 'Tìm {{target}}...',
    searchPlaceholderDefault: 'Tìm kiếm...',
    searchAria: 'Tìm {{target}}',
    searchAriaDefault: 'Tìm kiếm',
    searchMobileLabel: 'Tìm kiếm',
    targetPosts: 'bài viết',
    targetProducts: 'sản phẩm',
    targetDownloads: 'tệp tải xuống',
    targetPages: 'trang',
    targetCategories: 'danh mục',
    targetUsers: 'người dùng',
    targetMedia: 'media',
    sidebarExpand: 'Mở rộng thanh điều hướng',
    sidebarCollapse: 'Thu gọn thanh điều hướng',
    sidebarToggleFallback: 'Bật/tắt thanh điều hướng',
    toggleMobileSidebar: 'Bật/tắt thanh điều hướng',
    notifications: 'Thông báo',
    account: 'Tài khoản',
    themeDark: 'Chuyển sang chế độ sáng',
    themeLight: 'Chuyển sang chế độ tối',
    themeToggle: 'Đổi chủ đề',
    langSwitcherLabel: 'Chọn ngôn ngữ giao diện',
    langSwitcherVi: 'Tiếng Việt',
    langSwitcherEn: 'Tiếng Anh',
  },
  customCells: {
    statusDraft: 'Nháp',
    statusPublished: 'Đã xuất bản',
    statusAriaLabel: 'Trạng thái: {{label}}',
    typeEbook: 'Ebook',
    typeTemplate: 'Template',
    typeCode: 'Code',
    typeAriaLabel: 'Loại: {{label}}',
    priceAriaLabel: 'Giá: {{value}} VND',
  },
  customFields: {
    platformNoOptions: 'Không có lựa chọn',
    platformPlaceholder: 'Chọn nền tảng...',
  },
  version: {
    versionID: 'ID',
    versions: 'Lịch sử phiên bản',
  },
  customDashboard: {
    heroKicker: 'Tổng quan',
    heroTitle: 'Quản lý nội dung, sản phẩm và media từ một giao diện duy nhất.',
    heroSubtitle:
      'Số liệu được tải trực tiếp từ Payload CMS để dashboard luôn phản ánh trạng thái hiện tại của hệ thống.',
    sectionStats: 'Thống kê',
    sectionQuickActions: 'Thao tác nhanh',
    sectionRecentActivity: 'Hoạt động gần đây',
    sectionRecentActivityDescription: 'Cập nhật mới nhất từ các collection',
    sectionSystemStatus: 'Trạng thái hệ thống',
    sectionSystemStatusDescription: 'Kiểm tra nhanh hệ thống quản trị',
    openLibrary: 'Mở thư viện',
    statPublishedPostsTitle: 'Bài viết đã xuất bản',
    statPublishedPostsDescription: 'Tổng bài viết đang hiển thị',
    statProductsTitle: 'Sản phẩm',
    statProductsDescription: 'Sản phẩm đã xuất bản',
    statMediaTitle: 'Thư viện media',
    statMediaDescription: 'Tài sản đã tải lên',
    statUsersTitle: 'Tài khoản quản trị',
    statUsersDescription: 'Tài khoản Payload',
    quickPostTitle: 'Viết bài mới',
    quickPostDescription: 'Tạo và xuất bản bài viết mới',
    quickProductTitle: 'Thêm sản phẩm',
    quickProductDescription: 'Tạo sản phẩm số mới',
    quickMediaTitle: 'Tải media lên',
    quickMediaDescription: 'Thêm hình ảnh hoặc file tải xuống',
    quickUsersTitle: 'Quản lý người dùng',
    quickUsersDescription: 'Xem quyền editor và admin',
    activityPostsLabel: 'Bài viết cập nhật',
    activityProductsLabel: 'Sản phẩm cập nhật',
    activityMediaLabel: 'Media tải lên',
    activityPagesLabel: 'Trang chỉnh sửa',
    statsLoadErrorTitle: 'Không thể tải dữ liệu',
    statsLoadErrorDescription:
      'Không thể kết nối đến Payload API. Các thao tác nhanh vẫn có sẵn bên dưới.',
    activityLoadError: 'Không thể tải hoạt động. Kiểm tra kết nối API hoặc thử làm mới trang.',
    noActivityTitle: 'Chưa có hoạt động',
    noActivityDescription: 'Hoạt động sẽ xuất hiện khi bạn tạo hoặc chỉnh sửa nội dung.',
    untitledItem: 'Mục chưa đặt tên',
    systemDatabase: 'Cơ sở dữ liệu',
    systemMediaStorage: 'Lưu trữ media',
    systemSearchIndex: 'Chỉ mục tìm kiếm',
    systemPermissions: 'Phân quyền',
    systemStatusConnected: 'Đã kết nối',
    systemStatusActive: 'Hoạt động',
    systemStatusReady: 'Sẵn sàng',
    systemStatusProtected: 'Được bảo vệ',
  },
};

export const customTranslationsEn: CustomTranslationsShape = {
  customSidebar: {
    dashboard: 'Dashboard',
    aiConsole: 'AI Console',
    posts: 'Posts',
    products: 'Products',
    downloads: 'Downloads',
    pages: 'Pages',
    categories: 'Categories',
    users: 'Users',
    siteUsers: 'Site members',
    emailSettings: 'Email settings',
    media: 'Media',
    author: 'Author',
    backToSite: 'Back to site',
    closeSidebar: 'Close sidebar',
    navigationLabel: 'Main navigation',
  },
  customHeader: {
    breadcrumbAdmin: 'Admin',
    pageTitleDashboard: 'Dashboard',
    pageTitleAiConsole: 'AI Ops Console',
    pageTitleAccount: 'Account',
    pageTitleAuthorProfile: 'Author profile',
    pageTitleFallback: 'Admin panel',
    createPrefix: 'Create {{name}}',
    searchPlaceholder: 'Search {{target}}...',
    searchPlaceholderDefault: 'Search...',
    searchAria: 'Search {{target}}',
    searchAriaDefault: 'Search',
    searchMobileLabel: 'Search',
    targetPosts: 'posts',
    targetProducts: 'products',
    targetDownloads: 'downloads',
    targetPages: 'pages',
    targetCategories: 'categories',
    targetUsers: 'users',
    targetMedia: 'media',
    sidebarExpand: 'Expand sidebar',
    sidebarCollapse: 'Collapse sidebar',
    sidebarToggleFallback: 'Toggle sidebar',
    toggleMobileSidebar: 'Toggle sidebar',
    notifications: 'Notifications',
    account: 'Account',
    themeDark: 'Switch to light mode',
    themeLight: 'Switch to dark mode',
    themeToggle: 'Toggle theme',
    langSwitcherLabel: 'Select interface language',
    langSwitcherVi: 'Vietnamese',
    langSwitcherEn: 'English',
  },
  customCells: {
    statusDraft: 'Draft',
    statusPublished: 'Published',
    statusAriaLabel: 'Status: {{label}}',
    typeEbook: 'Ebook',
    typeTemplate: 'Template',
    typeCode: 'Code',
    typeAriaLabel: 'Type: {{label}}',
    priceAriaLabel: 'Price: {{value}} VND',
  },
  customFields: {
    platformNoOptions: 'No options available',
    platformPlaceholder: 'Select platform...',
  },
  version: {
    versionID: 'ID',
    versions: 'Version history',
  },
  customDashboard: {
    heroKicker: 'Overview',
    heroTitle: 'Manage content, products, and media from a single interface.',
    heroSubtitle:
      'Metrics are loaded directly from Payload CMS so the dashboard always reflects the current state of the system.',
    sectionStats: 'Statistics',
    sectionQuickActions: 'Quick actions',
    sectionRecentActivity: 'Recent activity',
    sectionRecentActivityDescription: 'Latest updates across collections',
    sectionSystemStatus: 'System status',
    sectionSystemStatusDescription: 'Quick health check for the admin system',
    openLibrary: 'Open library',
    statPublishedPostsTitle: 'Published posts',
    statPublishedPostsDescription: 'Live article count',
    statProductsTitle: 'Products',
    statProductsDescription: 'Published product listings',
    statMediaTitle: 'Media library',
    statMediaDescription: 'Uploaded assets',
    statUsersTitle: 'Admin users',
    statUsersDescription: 'Payload accounts',
    quickPostTitle: 'Write a new post',
    quickPostDescription: 'Create and publish a new article',
    quickProductTitle: 'Add a product',
    quickProductDescription: 'Create a new digital product',
    quickMediaTitle: 'Upload media',
    quickMediaDescription: 'Add images or downloadable files',
    quickUsersTitle: 'Manage users',
    quickUsersDescription: 'Review editor and admin access',
    activityPostsLabel: 'Post updated',
    activityProductsLabel: 'Product updated',
    activityMediaLabel: 'Media uploaded',
    activityPagesLabel: 'Page edited',
    statsLoadErrorTitle: 'Unable to load data',
    statsLoadErrorDescription:
      'Could not reach the Payload API. Quick actions are still available below.',
    activityLoadError: 'Unable to load activity. Check API connectivity or refresh the page.',
    noActivityTitle: 'No activity yet',
    noActivityDescription: 'Activity will appear here once you create or edit content.',
    untitledItem: 'Untitled item',
    systemDatabase: 'Database',
    systemMediaStorage: 'Media storage',
    systemSearchIndex: 'Search index',
    systemPermissions: 'Permissions',
    systemStatusConnected: 'Connected',
    systemStatusActive: 'Active',
    systemStatusReady: 'Ready',
    systemStatusProtected: 'Protected',
  },
};

/** Shape of the custom translation tree — used as the `TAdditionalTranslations` generic. */
export type CustomTranslations = CustomTranslationsShape;

/**
 * Union of every custom translation key in `namespace:flatKey` form.
 * Mirrors the shape Payload's `NestedKeysStripped` produces but restricted to
 * our two-level layout so it stays readable at call sites.
 */
export type CustomTranslationKeys = {
  [NS in keyof CustomTranslations]: `${NS & string}:${keyof CustomTranslations[NS] & string}`;
}[keyof CustomTranslations];

/** Ready-to-spread block for `payload.config.ts -> i18n.translations`. */
export const customTranslations = {
  vi: customTranslationsVi,
  en: customTranslationsEn,
};

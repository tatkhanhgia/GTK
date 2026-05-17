// Bilingual seed data definitions for GTKBlog development environment

export interface CategorySeed {
  slug: string
  type: 'blog' | 'product'
  vi: { name: string; description: string }
  en: { name: string; description: string }
}

export interface PostSeed {
  slug: string
  categorySlug: string
  daysAgo: number
  vi: { title: string; excerpt: string; content: string[] }
  en: { title: string; excerpt: string; content: string[] }
}

export interface ProductSeed {
  slug: string
  type: 'ebook' | 'template' | 'code'
  categorySlug?: string
  priceUSD: number
  priceVND: number
  vi: { name: string; excerpt: string; description: string[] }
  en: { name: string; excerpt: string; description: string[] }
}

export interface PageSeed {
  slug: string
  vi: { title: string; content: string[]; seoTitle: string; seoDescription: string }
  en: { title: string; content: string[]; seoTitle: string; seoDescription: string }
}

// 6 blog categories + 4 product categories
export const categories: CategorySeed[] = [
  { slug: 'ai-news', type: 'blog', vi: { name: 'Tin tuc AI', description: 'Cap nhat tin tuc moi nhat ve tri tue nhan tao' }, en: { name: 'AI News', description: 'Latest artificial intelligence news and updates' } },
  { slug: 'tech', type: 'blog', vi: { name: 'Cong nghe', description: 'Xu huong va danh gia cong nghe' }, en: { name: 'Technology', description: 'Tech trends and reviews' } },
  { slug: 'tutorials', type: 'blog', vi: { name: 'Huong dan', description: 'Huong dan lap trinh va ky thuat' }, en: { name: 'Tutorials', description: 'Programming and technical tutorials' } },
  { slug: 'opinions', type: 'blog', vi: { name: 'Quan diem', description: 'Bai viet quan diem ve cong nghe' }, en: { name: 'Opinions', description: 'Opinion pieces on technology' } },
  { slug: 'automation', type: 'blog', vi: { name: 'Tu dong hoa', description: 'Workflow, agent va he thong tu dong hoa' }, en: { name: 'Automation', description: 'Workflows, agents, and automation systems' } },
  { slug: 'devops', type: 'blog', vi: { name: 'DevOps', description: 'Trien khai, ha tang va van hanh ung dung' }, en: { name: 'DevOps', description: 'Deployment, infrastructure, and app operations' } },
  { slug: 'ebook', type: 'product', vi: { name: 'Ebook', description: 'Sach dien tu ve cong nghe' }, en: { name: 'Ebook', description: 'Technology ebooks' } },
  { slug: 'template', type: 'product', vi: { name: 'Template', description: 'Mau du an va giao dien' }, en: { name: 'Template', description: 'Project and UI templates' } },
  { slug: 'starter-kit', type: 'product', vi: { name: 'Starter Kit', description: 'Bo khoi dong du an san sang tuy bien' }, en: { name: 'Starter Kit', description: 'Customizable project starter kits' } },
  { slug: 'workflow', type: 'product', vi: { name: 'Workflow', description: 'Tai nguyen automation va quy trinh lam viec' }, en: { name: 'Workflow', description: 'Automation resources and operating workflows' } },
]

// 14 posts across blog categories
export const posts: PostSeed[] = [
  {
    slug: 'gpt-5-va-tuong-lai-ai', categorySlug: 'ai-news', daysAgo: 1,
    vi: { title: 'GPT-5 va tuong lai cua AI', excerpt: 'Kham pha nhung gi GPT-5 mang lai cho nganh cong nghe', content: ['OpenAI vua cong bo GPT-5 voi nhieu cai tien vuot bac trong kha nang suy luan va hieu ngu canh.', 'Mo hinh moi co the xu ly cac tac vu phuc tap hon va tao ra noi dung chinh xac hon bao gio het.', 'Day la buoc tien quan trong trong hanh trinh phat trien tri tue nhan tao tong quat.'] },
    en: { title: 'GPT-5 and the Future of AI', excerpt: 'Exploring what GPT-5 brings to the technology industry', content: ['OpenAI has announced GPT-5 with significant improvements in reasoning and context understanding.', 'The new model can handle more complex tasks and generate more accurate content than ever before.', 'This marks an important milestone in the journey toward artificial general intelligence.'] },
  },
  {
    slug: 'ai-trong-y-te-2026', categorySlug: 'ai-news', daysAgo: 2,
    vi: { title: 'AI trong y te nam 2026', excerpt: 'Tri tue nhan tao dang thay doi nganh y te nhu the nao', content: ['AI dang cach mang hoa nganh y te tu chan doan benh den phat trien thuoc moi.', 'Cac benh vien lon da trien khai he thong AI ho tro bac si trong viec doc ket qua xet nghiem.', 'Xu huong nay du kien se tiep tuc phat trien manh trong nhung nam toi.'] },
    en: { title: 'AI in Healthcare 2026', excerpt: 'How artificial intelligence is transforming the healthcare industry', content: ['AI is revolutionizing healthcare from disease diagnosis to new drug development.', 'Major hospitals have deployed AI systems to assist doctors in reading test results.', 'This trend is expected to continue growing strongly in the coming years.'] },
  },
  {
    slug: 'nextjs-16-co-gi-moi', categorySlug: 'tech', daysAgo: 3,
    vi: { title: 'Next.js 16 co gi moi?', excerpt: 'Tong hop nhung tinh nang moi trong Next.js 16', content: ['Next.js 16 mang den nhieu cai tien ve hieu suat va trai nghiem phat trien.', 'React Server Components da duoc toi uu hoa dang ke, giup trang web tai nhanh hon.', 'He thong routing moi cung linh hoat va de su dung hon phien ban truoc.'] },
    en: { title: "What's New in Next.js 16?", excerpt: 'A summary of new features in Next.js 16', content: ['Next.js 16 brings many improvements in performance and developer experience.', 'React Server Components have been significantly optimized, making websites load faster.', 'The new routing system is also more flexible and easier to use than previous versions.'] },
  },
  {
    slug: 'payload-cms-3-review', categorySlug: 'tech', daysAgo: 4,
    vi: { title: 'Danh gia Payload CMS 3.0', excerpt: 'Review chi tiet Payload CMS phien ban 3.0', content: ['Payload CMS 3.0 la mot buoc nhay vot so voi phien ban truoc voi kien truc hoan toan moi.', 'Tich hop sau voi Next.js giup xay dung website fullstack de dang hon bao gio het.', 'Local API manh me cho phep truy van du lieu truc tiep ma khong can HTTP request.'] },
    en: { title: 'Payload CMS 3.0 Review', excerpt: 'A detailed review of Payload CMS version 3.0', content: ['Payload CMS 3.0 is a giant leap from previous versions with an entirely new architecture.', 'Deep integration with Next.js makes building fullstack websites easier than ever.', 'The powerful Local API allows direct data queries without HTTP requests.'] },
  },
  {
    slug: 'xay-dung-blog-voi-nextjs', categorySlug: 'tutorials', daysAgo: 5,
    vi: { title: 'Xay dung blog voi Next.js va Payload CMS', excerpt: 'Huong dan tung buoc xay dung blog ca nhan', content: ['Trong bai viet nay, chung ta se xay dung mot blog hoan chinh su dung Next.js va Payload CMS.', 'Buoc dau tien la thiet lap du an voi TypeScript va cau hinh Payload.', 'Sau do chung ta se tao cac collection cho bai viet, danh muc va trang tinh.'] },
    en: { title: 'Building a Blog with Next.js and Payload CMS', excerpt: 'Step-by-step guide to building a personal blog', content: ['In this article, we will build a complete blog using Next.js and Payload CMS.', 'The first step is setting up the project with TypeScript and configuring Payload.', 'Then we will create collections for posts, categories, and static pages.'] },
  },
  {
    slug: 'tich-hop-thanh-toan-stripe', categorySlug: 'tutorials', daysAgo: 6,
    vi: { title: 'Tich hop thanh toan Stripe vao Next.js', excerpt: 'Huong dan tich hop Stripe cho san pham so', content: ['Stripe la nen tang thanh toan pho bien nhat cho cac ung dung web hien dai.', 'Bai viet nay huong dan cach tich hop Stripe Checkout vao ung dung Next.js.', 'Chung ta se xu ly webhook, quan ly don hang va cung cap file download sau thanh toan.'] },
    en: { title: 'Integrating Stripe Payments into Next.js', excerpt: 'A guide to integrating Stripe for digital products', content: ['Stripe is the most popular payment platform for modern web applications.', 'This article guides you through integrating Stripe Checkout into a Next.js application.', 'We will handle webhooks, manage orders, and provide file downloads after payment.'] },
  },
  {
    slug: 'thiet-ke-agent-workflow-cho-dev-team', categorySlug: 'automation', daysAgo: 7,
    vi: { title: 'Thiet ke agent workflow cho dev team', excerpt: 'Cach chia viec cho AI agent ma van giu duoc chat luong code', content: ['Agent workflow hieu qua bat dau tu ranh gioi file ro rang va tieu chi hoan thanh cu the.', 'Moi agent nen co ngu canh vua du, khong nhan ca lich su hoi thoai gay nhieu.', 'Buoc quan trong nhat la tich hop ket qua bang review va test that.'] },
    en: { title: 'Designing Agent Workflows for Dev Teams', excerpt: 'How to split AI agent work while keeping code quality high', content: ['Effective agent workflows start with clear file ownership and concrete acceptance criteria.', 'Each agent should receive enough context, not the entire conversation history.', 'The most important step is integrating results through real review and testing.'] },
  },
  {
    slug: 'postgres-indexing-cho-blog-va-store', categorySlug: 'devops', daysAgo: 8,
    vi: { title: 'Postgres indexing cho blog va store', excerpt: 'Nhung index co ich khi blog bat dau co nhieu noi dung', content: ['Index tot giup trang danh sach bai viet va san pham phan hoi on dinh hon khi du lieu tang.', 'Cac cot thuong can index gom slug, status, publishedAt va quan he danh muc.', 'Dung EXPLAIN de kiem tra thay vi them index theo cam tinh.'] },
    en: { title: 'Postgres Indexing for Blogs and Stores', excerpt: 'Useful indexes when content starts growing', content: ['Good indexes keep post and product listing pages responsive as data grows.', 'Common indexed fields include slug, status, publishedAt, and category relationships.', 'Use EXPLAIN to verify impact instead of adding indexes by instinct.'] },
  },
  {
    slug: 'quan-diem-ve-fullstack-cms', categorySlug: 'opinions', daysAgo: 9,
    vi: { title: 'Quan diem ve full-stack CMS', excerpt: 'Khi nao nen dung CMS embedded thay vi tach server rieng', content: ['Embedded CMS phu hop khi team muon giam so service phai van hanh.', 'Doi lai, can chu y ranh gioi schema, migration va quyen truy cap.', 'Voi blog va store nho, cach nay giup toc do phat trien nhanh hon dang ke.'] },
    en: { title: 'A Practical View on Full-stack CMS', excerpt: 'When embedded CMS beats a separate CMS server', content: ['An embedded CMS works well when teams want fewer services to operate.', 'The trade-off is stricter attention to schema boundaries, migrations, and access control.', 'For a small blog and store, this approach can speed up delivery meaningfully.'] },
  },
  {
    slug: 'tailwind-v4-trong-du-an-thuc-te', categorySlug: 'tech', daysAgo: 10,
    vi: { title: 'Tailwind v4 trong du an thuc te', excerpt: 'Nhung diem can luu y khi styling app san pham bang Tailwind v4', content: ['Tailwind v4 giup pipeline CSS gon hon nhung cung yeu cau cach to chuc token ro rang.', 'Dung component primitive de tranh lap lai pattern UI qua nhieu man hinh.', 'Khi app lon hon, design guideline quan trong khong kem framework.'] },
    en: { title: 'Tailwind v4 in Real Projects', excerpt: 'What to watch when styling product apps with Tailwind v4', content: ['Tailwind v4 simplifies the CSS pipeline but still needs clear token organization.', 'Use component primitives to avoid repeating UI patterns across screens.', 'As an app grows, design guidelines matter as much as the framework.'] },
  },
  {
    slug: 'xay-dung-newsletter-cho-blog-ca-nhan', categorySlug: 'tutorials', daysAgo: 11,
    vi: { title: 'Xay dung newsletter cho blog ca nhan', excerpt: 'Tu form dang ky den email xac nhan va unsubscribe', content: ['Newsletter nen bat dau tu flow don gian: dang ky, xac nhan email va huy dang ky.', 'Luu trang thai subscriber ro rang de tranh gui nham cho nguoi da unsubscribe.', 'Email transaction nen co template rieng va log de debug khi can.'] },
    en: { title: 'Building a Newsletter for a Personal Blog', excerpt: 'From signup form to confirmation and unsubscribe', content: ['A newsletter should start with a simple flow: subscribe, confirm email, and unsubscribe.', 'Store subscriber status clearly to avoid emailing users who opted out.', 'Transactional emails should have templates and logs for debugging.'] },
  },
  {
    slug: 'ai-coding-review-checklist', categorySlug: 'automation', daysAgo: 12,
    vi: { title: 'Checklist review code do AI viet', excerpt: 'Nhung diem can kiem tra truoc khi merge code do AI tao', content: ['Code do AI tao van can review nhu code cua lap trinh vien trong team.', 'Tap trung vao hop dong API, xu ly loi, bao mat va test that thay vi chi nhin format.', 'Checklist ngan giup review nhanh hon ma khong bo sot loi nghiem trong.'] },
    en: { title: 'Review Checklist for AI-written Code', excerpt: 'What to check before merging AI-generated code', content: ['AI-written code still needs the same review discipline as teammate code.', 'Focus on API contracts, error handling, security, and real tests instead of formatting alone.', 'A short checklist speeds up review without missing serious issues.'] },
  },
  {
    slug: 'deploy-nextjs-payload-voi-docker', categorySlug: 'devops', daysAgo: 13,
    vi: { title: 'Deploy Next.js + Payload voi Docker', excerpt: 'Cau truc container gon cho blog va store ca nhan', content: ['Docker giup dong goi Next.js, Payload va cac thu muc upload mot cach nhat quan.', 'Can tach volume cho media va digital downloads de khong mat du lieu khi deploy lai.', 'Healthcheck database giup server chi khoi dong khi Postgres san sang.'] },
    en: { title: 'Deploying Next.js + Payload with Docker', excerpt: 'A lean container setup for a personal blog and store', content: ['Docker packages Next.js, Payload, and upload folders consistently.', 'Use separate volumes for media and digital downloads so redeploys do not erase files.', 'Database healthchecks help the server start only when Postgres is ready.'] },
  },
  {
    slug: 'co-nen-ban-san-pham-so-tren-blog', categorySlug: 'opinions', daysAgo: 14,
    vi: { title: 'Co nen ban san pham so tren blog?', excerpt: 'Goc nhin thuc te ve viec bien noi dung thanh san pham', content: ['San pham so tot thuong den tu van de lap lai trong qua trinh viet va lam du an.', 'Blog giup chung minh nang luc va giai thich boi canh cua san pham.', 'Khong nen ban qua som neu chua co loi hua gia tri ro rang.'] },
    en: { title: 'Should You Sell Digital Products on a Blog?', excerpt: 'A practical take on turning content into products', content: ['Good digital products often come from repeated problems found while writing and building.', 'A blog proves expertise and explains the context behind the product.', 'Do not sell too early without a clear value promise.'] },
  },
]

// 8 products: ebooks, templates, source code, and workflow kits
export const products: ProductSeed[] = [
  {
    slug: 'ai-fundamentals-guide', type: 'ebook', categorySlug: 'ebook', priceUSD: 999, priceVND: 250000,
    vi: { name: 'Sach AI Co Ban', excerpt: 'Nen tang kien thuc AI cho nguoi moi bat dau', description: ['Cuon sach nay cung cap kien thuc nen tang ve tri tue nhan tao tu co ban den nang cao.', 'Bao gom machine learning, deep learning, NLP va computer vision.', 'Phu hop cho lap trinh vien muon bat dau voi AI.'] },
    en: { name: 'AI Fundamentals Guide', excerpt: 'Foundation AI knowledge for beginners', description: ['This book provides foundational knowledge about artificial intelligence from basic to advanced.', 'Covers machine learning, deep learning, NLP, and computer vision.', 'Suitable for developers looking to get started with AI.'] },
  },
  {
    slug: 'nextjs-blog-starter', type: 'template', categorySlug: 'template', priceUSD: 1999, priceVND: 500000,
    vi: { name: 'Next.js Blog Starter', excerpt: 'Template blog san sang trien khai', description: ['Template blog chuyen nghiep xay dung voi Next.js 16 va Payload CMS.', 'Bao gom SEO, dark mode, da ngon ngu va tich hop thanh toan.', 'Chi can cau hinh va trien khai, khong can code them.'] },
    en: { name: 'Next.js Blog Starter', excerpt: 'Production-ready blog template', description: ['Professional blog template built with Next.js 16 and Payload CMS.', 'Includes SEO, dark mode, multilingual support, and payment integration.', 'Just configure and deploy, no additional coding needed.'] },
  },
  {
    slug: 'payment-integration-kit', type: 'code', priceUSD: 2999, priceVND: 750000,
    vi: { name: 'Bo tich hop thanh toan', excerpt: 'Source code tich hop Stripe va SePay', description: ['Bo source code hoan chinh de tich hop thanh toan Stripe va SePay (VietQR).', 'Bao gom webhook handler, quan ly don hang va email xac nhan.', 'Tuong thich voi Next.js, Payload CMS va PostgreSQL.'] },
    en: { name: 'Payment Integration Kit', excerpt: 'Source code for Stripe and SePay integration', description: ['Complete source code package for integrating Stripe and SePay (VietQR) payments.', 'Includes webhook handlers, order management, and confirmation emails.', 'Compatible with Next.js, Payload CMS, and PostgreSQL.'] },
  },
  {
    slug: 'payload-cms-launch-kit', type: 'template', categorySlug: 'starter-kit', priceUSD: 2499, priceVND: 620000,
    vi: { name: 'Payload CMS Launch Kit', excerpt: 'Bo khoi dong CMS cho blog, docs va landing page', description: ['Starter kit gom collection mau, routing da ngon ngu va cau hinh admin co san.', 'Phu hop voi team can ra mat nhanh blog san pham hoac trung tam tai lieu.', 'Bao gom checklist migration va goi y deploy Docker.'] },
    en: { name: 'Payload CMS Launch Kit', excerpt: 'CMS starter for blogs, docs, and landing pages', description: ['A starter kit with sample collections, multilingual routing, and admin configuration.', 'Useful for teams launching a product blog or documentation hub quickly.', 'Includes migration checklist and Docker deployment notes.'] },
  },
  {
    slug: 'ai-agent-workflow-playbook', type: 'ebook', categorySlug: 'workflow', priceUSD: 1499, priceVND: 370000,
    vi: { name: 'AI Agent Workflow Playbook', excerpt: 'Playbook thiet ke workflow AI agent cho team nho', description: ['Tai lieu huong dan chia task, quan ly context va review ket qua AI agent.', 'Co mau prompt, checklist giao viec va khung danh gia rui ro.', 'Tap trung vao tinh thuc dung cho du an web full-stack.'] },
    en: { name: 'AI Agent Workflow Playbook', excerpt: 'A playbook for small-team AI agent workflows', description: ['A guide to task splitting, context management, and reviewing agent output.', 'Includes prompt templates, delegation checklists, and risk review frames.', 'Focused on practical full-stack web projects.'] },
  },
  {
    slug: 'nextjs-saas-dashboard-template', type: 'template', categorySlug: 'template', priceUSD: 3499, priceVND: 870000,
    vi: { name: 'Next.js SaaS Dashboard Template', excerpt: 'Dashboard SaaS gon voi bang, filter va layout quan tri', description: ['Template dashboard cho san pham SaaS gom sidebar, table, empty states va settings.', 'Thiet ke tap trung vao thao tac hang ngay thay vi landing page.', 'De tuy bien cho CRM, analytics hoac admin tool noi bo.'] },
    en: { name: 'Next.js SaaS Dashboard Template', excerpt: 'A focused SaaS dashboard with tables, filters, and admin layouts', description: ['A dashboard template with sidebar navigation, tables, empty states, and settings screens.', 'Designed for daily product operations instead of marketing pages.', 'Easy to adapt for CRM, analytics, or internal admin tools.'] },
  },
  {
    slug: 'resend-email-template-pack', type: 'code', categorySlug: 'starter-kit', priceUSD: 1299, priceVND: 320000,
    vi: { name: 'Resend Email Template Pack', excerpt: 'Bo React Email template cho auth, order va newsletter', description: ['Goi template email gom xac nhan tai khoan, hoa don, download va newsletter.', 'Cau truc component ro rang de dung lai trong Next.js va Payload.', 'Co noi dung song ngu Anh Viet de demo nhanh.'] },
    en: { name: 'Resend Email Template Pack', excerpt: 'React Email templates for auth, orders, and newsletters', description: ['A template pack for account confirmation, receipts, downloads, and newsletters.', 'Clear component structure for reuse in Next.js and Payload projects.', 'Includes bilingual English and Vietnamese sample copy.'] },
  },
  {
    slug: 'postgres-performance-checklist', type: 'ebook', categorySlug: 'ebook', priceUSD: 799, priceVND: 190000,
    vi: { name: 'Postgres Performance Checklist', excerpt: 'Checklist toi uu Postgres cho ung dung noi dung', description: ['Checklist ngan ve index, query plan, connection pool va backup cho Postgres.', 'Danh cho blog, ecommerce nho va dashboard noi bo.', 'Moi muc co dau hieu can kiem tra va cach xac minh nhanh.'] },
    en: { name: 'Postgres Performance Checklist', excerpt: 'A performance checklist for content-heavy apps', description: ['A concise checklist for indexes, query plans, connection pools, and Postgres backups.', 'Built for blogs, small ecommerce sites, and internal dashboards.', 'Each item includes symptoms to check and a quick verification method.'] },
  },
]

// 2 pages: About + Privacy Policy
export const pages: PageSeed[] = [
  {
    slug: 'about',
    vi: { title: 'Gioi thieu', seoTitle: 'Gioi thieu - GTKBlog', seoDescription: 'Tim hieu ve GTKBlog - blog cong nghe va AI', content: ['GTKBlog la noi chia se kien thuc ve cong nghe, tri tue nhan tao va lap trinh web.', 'Chung toi cung cap cac bai viet chat luong, huong dan chi tiet va san pham so huu ich.', 'Su menh cua chung toi la giup cong dong lap trinh vien Viet Nam tiep can cong nghe moi nhat.'] },
    en: { title: 'About', seoTitle: 'About - GTKBlog', seoDescription: 'Learn about GTKBlog - technology and AI blog', content: ['GTKBlog is a platform for sharing knowledge about technology, artificial intelligence, and web development.', 'We provide quality articles, detailed tutorials, and useful digital products.', 'Our mission is to help the Vietnamese developer community access the latest technologies.'] },
  },
  {
    slug: 'privacy',
    vi: { title: 'Chinh sach bao mat', seoTitle: 'Chinh sach bao mat - GTKBlog', seoDescription: 'Chinh sach bao mat cua GTKBlog', content: ['GTKBlog cam ket bao ve quyen rieng tu cua ban.', 'Chung toi chi thu thap thong tin can thiet de cung cap dich vu tot nhat.', 'Du lieu ca nhan cua ban khong bao gio duoc ban hoac chia se cho ben thu ba ma khong co su dong y.'] },
    en: { title: 'Privacy Policy', seoTitle: 'Privacy Policy - GTKBlog', seoDescription: "GTKBlog's privacy policy", content: ['GTKBlog is committed to protecting your privacy.', 'We only collect information necessary to provide the best service.', 'Your personal data is never sold or shared with third parties without your consent.'] },
  },
]

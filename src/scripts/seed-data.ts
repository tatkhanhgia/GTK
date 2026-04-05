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

// 4 blog categories + 2 product categories
export const categories: CategorySeed[] = [
  { slug: 'ai-news', type: 'blog', vi: { name: 'Tin tuc AI', description: 'Cap nhat tin tuc moi nhat ve tri tue nhan tao' }, en: { name: 'AI News', description: 'Latest artificial intelligence news and updates' } },
  { slug: 'tech', type: 'blog', vi: { name: 'Cong nghe', description: 'Xu huong va danh gia cong nghe' }, en: { name: 'Technology', description: 'Tech trends and reviews' } },
  { slug: 'tutorials', type: 'blog', vi: { name: 'Huong dan', description: 'Huong dan lap trinh va ky thuat' }, en: { name: 'Tutorials', description: 'Programming and technical tutorials' } },
  { slug: 'opinions', type: 'blog', vi: { name: 'Quan diem', description: 'Bai viet quan diem ve cong nghe' }, en: { name: 'Opinions', description: 'Opinion pieces on technology' } },
  { slug: 'ebook', type: 'product', vi: { name: 'Ebook', description: 'Sach dien tu ve cong nghe' }, en: { name: 'Ebook', description: 'Technology ebooks' } },
  { slug: 'template', type: 'product', vi: { name: 'Template', description: 'Mau du an va giao dien' }, en: { name: 'Template', description: 'Project and UI templates' } },
]

// 6 posts: 2 per blog category (ai-news, tech, tutorials)
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
]

// 3 products: 1 ebook, 1 template, 1 source code (prices in cents/VND)
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

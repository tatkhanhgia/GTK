import { getPayload } from 'payload'
import config from '../../payload.config'
import { categories, posts, products, pages } from './seed-data'

// Build Lexical richtext JSON from plain text paragraphs
function createRichText(paragraphs: string[]) {
  return {
    root: {
      children: paragraphs.map((text) => ({
        children: [{ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 }],
        direction: 'ltr' as const,
        format: '' as const,
        indent: 0,
        type: 'paragraph',
        version: 1,
        textFormat: 0,
        textStyle: '',
      })),
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

// Helper to create a record in default locale (vi), then update with English locale
async function createLocalized<T extends Record<string, unknown>>(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: string,
  viData: T,
  enData: Partial<T>,
  options?: { draft?: boolean },
) {
  const created = await payload.create({
    collection,
    locale: 'vi',
    ...(options?.draft === false ? { draft: false } : {}),
    data: viData as Record<string, unknown>,
  })
  await payload.update({
    collection,
    id: created.id,
    locale: 'en',
    ...(options?.draft === false ? { draft: false } : {}),
    data: enData as Record<string, unknown>,
  })
  return created
}

async function seed() {
  const env = process.env.NODE_ENV
  if (env && env !== 'development' && env !== 'test') {
    console.error(`Seed script only runs in development/test (current: ${env})`)
    process.exit(1)
  }

  const payload = await getPayload({ config })
  console.log('Seeding database...\n')

  // 1. Admin user (idempotent by email)
  const adminExists = await payload.find({ collection: 'users', where: { email: { equals: 'admin@gtkblog.com' } }, limit: 1 })
  let adminId: number | string
  if (adminExists.docs.length === 0) {
    const admin = await payload.create({
      collection: 'users',
      data: { email: 'admin@gtkblog.com', password: 'admin123456', name: 'GTKBlog Admin', role: 'admin' },
    })
    adminId = admin.id
    console.log('+ Admin user created')
  } else {
    adminId = adminExists.docs[0].id
    console.log('= Admin user already exists, skipping')
  }

  // 2. Categories (idempotent by slug)
  const categoryMap: Record<string, number | string> = {}
  for (const cat of categories) {
    const exists = await payload.find({ collection: 'categories', where: { slug: { equals: cat.slug } }, limit: 1 })
    if (exists.docs.length > 0) {
      categoryMap[cat.slug] = exists.docs[0].id
      console.log(`= Category "${cat.slug}" exists, skipping`)
      continue
    }
    const created = await createLocalized(
      payload, 'categories',
      { name: cat.vi.name, slug: cat.slug, type: cat.type, description: cat.vi.description },
      { name: cat.en.name, description: cat.en.description },
    )
    categoryMap[cat.slug] = created.id
    console.log(`+ Category "${cat.slug}" created`)
  }

  // 3. Posts (idempotent by slug, published, with author)
  const postMap: Record<string, number | string> = {}
  for (const post of posts) {
    const exists = await payload.find({ collection: 'posts', where: { slug: { equals: post.slug } }, limit: 1, draft: true })
    if (exists.docs.length > 0) {
      postMap[post.slug] = exists.docs[0].id
      console.log(`= Post "${post.slug}" exists, skipping`)
      continue
    }
    const publishedAt = new Date()
    publishedAt.setDate(publishedAt.getDate() - post.daysAgo)
    const created = await createLocalized(
      payload, 'posts',
      {
        title: post.vi.title, slug: post.slug, excerpt: post.vi.excerpt,
        content: createRichText(post.vi.content), category: categoryMap[post.categorySlug],
        author: adminId, status: 'published',
        publishedAt: publishedAt.toISOString(),
      },
      { title: post.en.title, excerpt: post.en.excerpt, content: createRichText(post.en.content) },
      { draft: false },
    )
    postMap[post.slug] = created.id
    console.log(`+ Post "${post.slug}" created`)
  }

  // 4. Products (idempotent by slug, published, dual pricing)
  for (const product of products) {
    const exists = await payload.find({ collection: 'products', where: { slug: { equals: product.slug } }, limit: 1, draft: true })
    if (exists.docs.length > 0) {
      console.log(`= Product "${product.slug}" exists, skipping`)
      continue
    }
    await createLocalized(
      payload, 'products',
      {
        name: product.vi.name, slug: product.slug, excerpt: product.vi.excerpt,
        description: createRichText(product.vi.description), type: product.type,
        priceUSD: product.priceUSD, priceVND: product.priceVND,
        status: 'published',
        ...(product.categorySlug ? { category: categoryMap[product.categorySlug] } : {}),
      },
      { name: product.en.name, excerpt: product.en.excerpt, description: createRichText(product.en.description) },
      { draft: false },
    )
    console.log(`+ Product "${product.slug}" created`)
  }

  // 5. Pages (idempotent by slug, with SEO fields)
  for (const page of pages) {
    const exists = await payload.find({ collection: 'pages', where: { slug: { equals: page.slug } }, limit: 1 })
    if (exists.docs.length > 0) {
      console.log(`= Page "${page.slug}" exists, skipping`)
      continue
    }
    await createLocalized(
      payload, 'pages',
      {
        title: page.vi.title, slug: page.slug, content: createRichText(page.vi.content),
        seoTitle: page.vi.seoTitle, seoDescription: page.vi.seoDescription,
      },
      {
        title: page.en.title, content: createRichText(page.en.content),
        seoTitle: page.en.seoTitle, seoDescription: page.en.seoDescription,
      },
    )
    console.log(`+ Page "${page.slug}" created`)
  }

  // 6. Author Profile Global (idempotent — Globals always exist, just update)
  try {
    await payload.updateGlobal({
      slug: 'author-profile',
      locale: 'vi',
      data: {
        name: 'GTK',
        title: 'Software Engineer & AI Enthusiast',
        bio: createRichText(['Xin chào! Mình là GTK, tác giả của GTKBlog.', 'Mình đam mê công nghệ, AI, và chia sẻ kiến thức qua blog và sản phẩm số.']),
        socialLinks: [
          { platform: 'github', url: 'https://github.com/example' },
          { platform: 'linkedin', url: 'https://linkedin.com/in/example' },
          { platform: 'x', url: 'https://x.com/example' },
        ],
        skills: [
          { category: 'Languages', items: [{ name: 'TypeScript' }, { name: 'Python' }, { name: 'Go' }] },
          { category: 'Frameworks', items: [{ name: 'Next.js' }, { name: 'React' }, { name: 'Payload CMS' }] },
          { category: 'Tools', items: [{ name: 'Docker' }, { name: 'PostgreSQL' }, { name: 'Cloudflare' }] },
        ],
        timeline: [
          { year: '2024', title: 'Ra mắt GTKBlog', description: 'Blog cá nhân + sản phẩm số', type: 'project' },
          { year: '2023', title: 'Senior Software Engineer', description: 'Full-stack development', type: 'work' },
        ],
        meEditorial: {
          heroSentence: 'Mình tập trung xây sản phẩm AI tối giản, hữu dụng và dễ triển khai trong công việc thật.',
          buildingNow: createRichText([
            'Hiện tại mình đang phát triển GTKBlog thành một nền tảng nội dung + sản phẩm số gọn, rõ, và thực dụng.',
            'Trọng tâm là workflow AI, automation cho dev, và tài liệu hóa kinh nghiệm triển khai thực tế.',
          ]),
          principles: [
            {
              title: 'Đơn giản trước',
              description: 'Ưu tiên giải pháp ít moving parts, dễ vận hành, dễ mở rộng khi thật sự cần.',
            },
            {
              title: 'Viết để dùng được ngay',
              description: 'Mỗi nội dung đều hướng tới việc áp dụng lại được trong dự án thật, không chỉ lý thuyết.',
            },
            {
              title: 'Làm rõ trade-off',
              description: 'Luôn nêu chi phí và giới hạn kỹ thuật để quyết định thực tế hơn.',
            },
          ],
          selectedWriting: [
            { post: postMap['xay-dung-blog-voi-nextjs'], note: 'Bài nền tảng để hiểu kiến trúc stack hiện tại.' },
            { post: postMap['payload-cms-3-review'], note: 'Góc nhìn thực chiến khi chọn CMS cho Next.js.' },
            { post: postMap['nextjs-16-co-gi-moi'], note: 'Tóm tắt thay đổi quan trọng ảnh hưởng DX và performance.' },
          ].filter((item) => Boolean(item.post)),
          timelineContext: 'Một vài cột mốc giúp bạn hiểu vì sao mình chọn hướng xây sản phẩm hiện tại.',
          contactCtaText: 'Nếu bạn muốn trao đổi về AI workflow, sản phẩm số, hoặc hợp tác kỹ thuật, cứ nhắn mình.',
        },
        contactEmail: 'contact@gtkblog.com',
        meta: { metaTitle: 'Về tác giả', metaDescription: 'Tìm hiểu về tác giả GTKBlog' },
      },
    })
    // Update English locale
    await payload.updateGlobal({
      slug: 'author-profile',
      locale: 'en',
      data: {
        title: 'Software Engineer & AI Enthusiast',
        bio: createRichText(["Hello! I'm GTK, the author of GTKBlog.", 'I love technology, AI, and sharing knowledge through blog posts and digital products.']),
        timeline: [
          { year: '2024', title: 'Launched GTKBlog', description: 'Personal blog + digital products', type: 'project' },
          { year: '2023', title: 'Senior Software Engineer', description: 'Full-stack development', type: 'work' },
        ],
        meEditorial: {
          heroSentence: 'I focus on building minimal, practical AI products that teams can actually use in real workflows.',
          buildingNow: createRichText([
            'Right now, I am shaping GTKBlog into a lean platform that combines practical writing and digital products.',
            'Main focus: AI workflows, developer automation, and implementation notes grounded in real project delivery.',
          ]),
          principles: [
            {
              title: 'Simplicity first',
              description: 'Prefer fewer moving parts, clear operations, and scalable decisions only when needed.',
            },
            {
              title: 'Write for immediate use',
              description: 'Every piece should help readers apply ideas directly in their own projects.',
            },
            {
              title: 'Make trade-offs explicit',
              description: 'I always highlight costs and constraints so decisions stay practical.',
            },
          ],
          selectedWriting: [
            { post: postMap['xay-dung-blog-voi-nextjs'], note: 'A foundation piece for the current stack architecture.' },
            { post: postMap['payload-cms-3-review'], note: 'Practical perspective on choosing CMS for Next.js.' },
            { post: postMap['nextjs-16-co-gi-moi'], note: 'Key updates affecting DX and performance.' },
          ].filter((item) => Boolean(item.post)),
          timelineContext: 'A few milestones that explain why I build products this way today.',
          contactCtaText: 'If you want to discuss AI workflows, digital products, or technical collaboration, send me a message.',
        },
        meta: { metaTitle: 'About Me', metaDescription: 'Learn about the author of GTKBlog' },
      },
    })
    console.log('+ Author Profile global seeded')
  } catch {
    console.log('= Author Profile seed skipped (Global may not exist yet — run migration first)')
  }

  console.log('\nSeeding complete!')
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })

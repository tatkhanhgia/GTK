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
  for (const post of posts) {
    const exists = await payload.find({ collection: 'posts', where: { slug: { equals: post.slug } }, limit: 1, draft: true })
    if (exists.docs.length > 0) {
      console.log(`= Post "${post.slug}" exists, skipping`)
      continue
    }
    const publishedAt = new Date()
    publishedAt.setDate(publishedAt.getDate() - post.daysAgo)
    await createLocalized(
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

  console.log('\nSeeding complete!')
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error)
    process.exit(1)
  })

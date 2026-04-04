import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface NewsletterPostProps {
  postTitle: string
  postExcerpt: string
  postUrl: string
  unsubscribeUrl: string
  locale?: string
}

/**
 * Newsletter notification email sent when a new blog post is published.
 * Includes post title, excerpt, CTA, and mandatory unsubscribe link.
 */
export function NewsletterPost({
  postTitle,
  postExcerpt,
  postUrl,
  unsubscribeUrl,
  locale = 'vi',
}: NewsletterPostProps) {
  const isVi = locale === 'vi'

  return (
    <Html>
      <Head />
      <Preview>{isVi ? `Bài mới: ${postTitle}` : `New post: ${postTitle}`}</Preview>
      <Body style={{ backgroundColor: '#FAF8F5', fontFamily: 'sans-serif' }}>
        <Container
          style={{
            maxWidth: '600px',
            margin: '40px auto',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '40px',
            border: '1px solid #E5DED5',
          }}
        >
          <Text
            style={{
              color: '#D97757',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 16px',
            }}
          >
            GTKBlog
          </Text>
          <Heading
            style={{
              color: '#1A1715',
              fontSize: '22px',
              fontWeight: 700,
              lineHeight: 1.3,
              margin: '0 0 12px',
            }}
          >
            {postTitle}
          </Heading>
          <Text
            style={{ color: '#5C554D', fontSize: '16px', lineHeight: '1.65', margin: '0 0 24px' }}
          >
            {postExcerpt}
          </Text>
          <Link
            href={postUrl}
            style={{
              backgroundColor: '#D97757',
              color: '#FFFFFF',
              padding: '12px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-block',
            }}
          >
            {isVi ? 'Đọc bài viết →' : 'Read Article →'}
          </Link>
          <Hr style={{ borderColor: '#E5DED5', margin: '40px 0 20px' }} />
          <Text style={{ color: '#8A817A', fontSize: '12px', textAlign: 'center' }}>
            {isVi
              ? 'Bạn nhận được email này vì đã đăng ký nhận bản tin GTKBlog. '
              : 'You received this because you subscribed to GTKBlog newsletter. '}
            <Link href={unsubscribeUrl} style={{ color: '#D97757' }}>
              {isVi ? 'Hủy đăng ký' : 'Unsubscribe'}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default NewsletterPost

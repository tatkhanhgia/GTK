import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  name: string
  locale?: string
}

/**
 * Welcome email sent on new user registration.
 * Supports Vietnamese and English via locale param.
 */
export function WelcomeEmail({ name, locale = 'vi' }: WelcomeEmailProps) {
  const isVi = locale === 'vi'

  return (
    <Html>
      <Head />
      <Preview>
        {isVi ? `Chào mừng đến với GTKBlog, ${name}!` : `Welcome to GTKBlog, ${name}!`}
      </Preview>
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
          <Heading
            style={{ color: '#1A1715', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}
          >
            {isVi ? `Chào mừng, ${name}!` : `Welcome, ${name}!`}
          </Heading>
          <Text style={{ color: '#5C554D', fontSize: '16px', lineHeight: '1.65' }}>
            {isVi
              ? 'Cảm ơn bạn đã tạo tài khoản trên GTKBlog. Khám phá các bài viết về AI và công nghệ!'
              : 'Thank you for creating an account on GTKBlog. Explore our articles about AI and technology!'}
          </Text>
          <Section style={{ marginTop: '32px', textAlign: 'center' }}>
            <Link
              href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
              style={{
                backgroundColor: '#D97757',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              {isVi ? 'Khám phá Blog' : 'Explore Blog'}
            </Link>
          </Section>
          <Text
            style={{ color: '#8A817A', fontSize: '12px', marginTop: '32px', textAlign: 'center' }}
          >
            GTKBlog —{' '}
            {isVi ? 'Blog công nghệ & AI cá nhân' : 'Personal Tech & AI Blog'}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

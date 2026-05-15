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
  body?: string
}

export function WelcomeEmail({ name, locale = 'vi', body }: WelcomeEmailProps) {
  const isVi = locale === 'vi'
  const defaultBody = isVi
    ? 'Cam on ban da tao tai khoan tren GTKBlog. Kham pha cac bai viet ve AI va cong nghe!'
    : 'Thank you for creating an account on GTKBlog. Explore our articles about AI and technology!'

  return (
    <Html>
      <Head />
      <Preview>{isVi ? `Chao mung den voi GTKBlog, ${name}!` : `Welcome to GTKBlog, ${name}!`}</Preview>
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
          <Heading style={{ color: '#1A1715', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
            {isVi ? `Chao mung, ${name}!` : `Welcome, ${name}!`}
          </Heading>
          <Text style={{ color: '#5C554D', fontSize: '16px', lineHeight: '1.65' }}>{body || defaultBody}</Text>
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
              {isVi ? 'Kham pha Blog' : 'Explore Blog'}
            </Link>
          </Section>
          <Text style={{ color: '#8A817A', fontSize: '12px', marginTop: '32px', textAlign: 'center' }}>
            GTKBlog - {isVi ? 'Blog cong nghe & AI ca nhan' : 'Personal Tech & AI Blog'}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

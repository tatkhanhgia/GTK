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

interface PasswordResetProps {
  resetUrl: string
  locale?: string
}

/**
 * Password reset email triggered by forgot-password flow.
 * Link expires in 1 hour — communicate this clearly in body copy.
 */
export function PasswordReset({ resetUrl, locale = 'vi' }: PasswordResetProps) {
  const isVi = locale === 'vi'

  return (
    <Html>
      <Head />
      <Preview>
        {isVi ? 'Đặt lại mật khẩu GTKBlog' : 'Reset your GTKBlog password'}
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
            style={{ color: '#1A1715', fontSize: '22px', fontWeight: 700, marginBottom: '16px' }}
          >
            {isVi ? 'Đặt lại mật khẩu' : 'Reset Password'}
          </Heading>
          <Text style={{ color: '#5C554D', fontSize: '16px', lineHeight: '1.65' }}>
            {isVi
              ? 'Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để tiếp tục.'
              : 'You requested a password reset. Click the button below to continue.'}
          </Text>
          <Section style={{ marginTop: '32px', textAlign: 'center' }}>
            <Link
              href={resetUrl}
              style={{
                backgroundColor: '#D97757',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              {isVi ? 'Đặt lại mật khẩu' : 'Reset Password'}
            </Link>
          </Section>
          <Text style={{ color: '#8A817A', fontSize: '13px', marginTop: '24px' }}>
            {isVi
              ? 'Liên kết này hết hạn sau 1 giờ. Nếu bạn không yêu cầu, hãy bỏ qua email này.'
              : 'This link expires in 1 hour. If you did not request this, please ignore this email.'}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default PasswordReset

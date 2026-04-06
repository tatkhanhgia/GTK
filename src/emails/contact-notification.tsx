import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface ContactNotificationProps {
  senderName: string
  senderEmail: string
  message: string
  locale?: string
}

/**
 * Email notification sent when someone submits the contact form.
 * Sent to the author's contactEmail from CMS.
 */
export function ContactNotification({
  senderName,
  senderEmail,
  message,
  locale = 'vi',
}: ContactNotificationProps) {
  const isVi = locale === 'vi'

  return (
    <Html>
      <Head />
      <Preview>
        {isVi
          ? `Tin nhắn mới từ ${senderName}`
          : `New message from ${senderName}`}
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
            {isVi ? 'Tin nhắn mới từ liên hệ' : 'New Contact Message'}
          </Heading>

          <Section style={{ marginBottom: '24px' }}>
            <Text style={{ color: '#5C554D', fontSize: '14px', margin: '4px 0' }}>
              <strong>{isVi ? 'Người gửi:' : 'From:'}</strong> {senderName}
            </Text>
            <Text style={{ color: '#5C554D', fontSize: '14px', margin: '4px 0' }}>
              <strong>Email:</strong> {senderEmail}
            </Text>
          </Section>

          <Section
            style={{
              backgroundColor: '#FAF8F5',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid #E5DED5',
            }}
          >
            <Text style={{ color: '#1A1715', fontSize: '15px', lineHeight: '1.65', whiteSpace: 'pre-wrap' }}>
              {message}
            </Text>
          </Section>

          <Text
            style={{ color: '#8A817A', fontSize: '12px', marginTop: '32px', textAlign: 'center' }}
          >
            {isVi
              ? 'Trả lời trực tiếp email này để phản hồi người gửi.'
              : 'Reply directly to this email to respond to the sender.'}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ContactNotification

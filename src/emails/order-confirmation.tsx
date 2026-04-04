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

interface OrderConfirmationProps {
  customerName: string
  productName: string
  amount: string
  downloadUrl: string
  locale?: string
}

/**
 * Order confirmation email sent after successful purchase.
 * Includes product name, amount paid, and time-limited download link.
 */
export function OrderConfirmation({
  customerName,
  productName,
  amount,
  downloadUrl,
  locale = 'vi',
}: OrderConfirmationProps) {
  const isVi = locale === 'vi'

  return (
    <Html>
      <Head />
      <Preview>
        {isVi ? `Xác nhận đơn hàng: ${productName}` : `Order Confirmation: ${productName}`}
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
            style={{ color: '#1A1715', fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}
          >
            {isVi ? 'Đặt hàng thành công!' : 'Order Confirmed!'}
          </Heading>
          <Text
            style={{ color: '#5C554D', fontSize: '16px', lineHeight: '1.65', marginBottom: '24px' }}
          >
            {isVi
              ? `Xin chào ${customerName}, cảm ơn bạn đã mua hàng!`
              : `Hi ${customerName}, thank you for your purchase!`}
          </Text>
          <Hr style={{ borderColor: '#E5DED5' }} />
          <Section style={{ margin: '24px 0' }}>
            <Text style={{ fontSize: '14px', color: '#8A817A', margin: 0 }}>
              {isVi ? 'Sản phẩm' : 'Product'}
            </Text>
            <Text
              style={{ fontSize: '16px', color: '#1A1715', fontWeight: 600, margin: '4px 0 0' }}
            >
              {productName}
            </Text>
            <Text style={{ fontSize: '14px', color: '#8A817A', margin: '8px 0 0' }}>
              {isVi ? 'Số tiền' : 'Amount'}: {amount}
            </Text>
          </Section>
          <Hr style={{ borderColor: '#E5DED5' }} />
          <Section style={{ marginTop: '24px', textAlign: 'center' }}>
            <Text
              style={{ color: '#5C554D', fontSize: '15px', marginBottom: '16px' }}
            >
              {isVi
                ? 'Nhấn để tải xuống sản phẩm của bạn:'
                : 'Click to download your product:'}
            </Text>
            <Link
              href={downloadUrl}
              style={{
                backgroundColor: '#D97757',
                color: '#FFFFFF',
                padding: '12px 28px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-block',
              }}
            >
              {isVi ? 'Tải xuống ngay' : 'Download Now'}
            </Link>
            <Text style={{ color: '#8A817A', fontSize: '12px', marginTop: '12px' }}>
              {isVi ? 'Liên kết hết hạn sau 48 giờ.' : 'Link expires after 48 hours.'}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderConfirmation

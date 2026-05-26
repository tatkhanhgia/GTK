import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AdminAiFormattedMessage } from '@/admin/components/ai/admin-ai-formatted-message'

describe('AdminAiFormattedMessage', () => {
  it('renders provider Markdown as readable console content', () => {
    render(
      <AdminAiFormattedMessage
        body={[
          'Vai trò chính của tôi là hỗ trợ **quản trị trang web**.',
          '',
          '1. **Bộ kỹ năng đó là gì?**',
          '2. **Mục đích sử dụng trong GTKBlog là gì?**',
          '',
          '* **Nếu muốn tôi hiểu thêm API:** cung cấp tài liệu.',
          '* **Nếu muốn tôi học kỹ năng mới:** xác định phạm vi.',
        ].join('\n')}
      />,
    )

    expect(screen.getByText('quản trị trang web').tagName).toBe('STRONG')

    const orderedItems = screen.getAllByRole('listitem').slice(0, 2)
    expect(orderedItems).toHaveLength(2)
    expect(within(orderedItems[0]).getByText('Bộ kỹ năng đó là gì?').tagName).toBe('STRONG')
    expect(orderedItems[1]).toHaveTextContent('Mục đích sử dụng trong GTKBlog là gì?')

    expect(screen.getByText('Nếu muốn tôi hiểu thêm API:').tagName).toBe('STRONG')
    expect(screen.getByText('Nếu muốn tôi học kỹ năng mới:').tagName).toBe('STRONG')
  })

  it('does not render raw HTML from provider output', () => {
    render(<AdminAiFormattedMessage body={'<script>alert(1)</script>\n\nDùng `health_check`.'} />)

    expect(screen.getByText('<script>alert(1)</script>')).toBeInTheDocument()
    expect(screen.getByText('health_check').tagName).toBe('CODE')
  })

  it('keeps lists readable even when provider omits blank lines', () => {
    render(<AdminAiFormattedMessage body={'Dựa trên vai trò admin:\n- Kiểm tra health\n- Cập nhật SEO'} />)

    expect(screen.getByText('Dựa trên vai trò admin:')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})

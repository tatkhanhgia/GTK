import type { AdminAiMessage } from './admin-ai-message-list'

export const initialMessages: AdminAiMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    body: 'Console đã sẵn sàng. Tôi có thể đọc health, nội dung, đơn hàng và log khi backend tool được kết nối.',
    status: 'read',
  },
  {
    id: 'confirmation-preview',
    role: 'assistant',
    body: 'Mọi hành động ghi dữ liệu sẽ dừng lại để admin xác nhận trước khi chạy.',
    status: 'pending-write',
  },
]

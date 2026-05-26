import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AdminAiComposer } from '@/admin/components/ai/admin-ai-composer'

describe('admin AI attachments UI', () => {
  it('renders attachment chips and blocks submit while upload is pending', () => {
    const onSubmit = vi.fn()

    render(
      <AdminAiComposer
        attachments={[{ referenceId: 'ref-1', filename: 'outline.md', byteSize: 120, status: 'ready' }]}
        isUploadingFile
        onSubmit={onSubmit}
      />,
    )

    expect(screen.getByTitle('outline.md')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Tin nhắn cho AI Ops Console'), { target: { value: 'write post' } })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi' }))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

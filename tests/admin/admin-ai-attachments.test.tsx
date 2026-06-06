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
  it('sends the current message when Enter is pressed', () => {
    const onSubmit = vi.fn()

    render(<AdminAiComposer onSubmit={onSubmit} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'check site health' } })
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })

    expect(onSubmit).toHaveBeenCalledWith('check site health')
    expect(textarea).toHaveValue('')
  })

  it('keeps multiline editing when Shift Enter is pressed', () => {
    const onSubmit = vi.fn()

    render(<AdminAiComposer onSubmit={onSubmit} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'line one' } })
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter', shiftKey: true })

    expect(onSubmit).not.toHaveBeenCalled()
    expect(textarea).toHaveValue('line one')
  })

  it('does not send with Enter while busy', () => {
    const onSubmit = vi.fn()

    render(<AdminAiComposer isBusy onSubmit={onSubmit} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'wait for current response' } })
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' })

    expect(onSubmit).not.toHaveBeenCalled()
  })
})

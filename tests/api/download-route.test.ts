import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'

const mockValidateDownloadToken = vi.fn()
const mockFindByID = vi.fn()

vi.mock('@/lib/payment/download-token', () => ({
  validateDownloadToken: mockValidateDownloadToken,
}))

vi.mock('payload', () => ({
  getPayload: vi.fn().mockResolvedValue({
    findByID: mockFindByID,
  }),
}))

vi.mock('@payload-config', () => ({ default: {} }))

const privateDownloadDir = path.resolve(process.cwd(), 'digital-downloads')
const privateDownloadFilePath = path.join(privateDownloadDir, 'ebook.pdf')
const legacyMediaDir = path.resolve(process.cwd(), 'public/media')
const legacyMediaFilePath = path.join(legacyMediaDir, 'ebook.pdf')

describe('GET /api/download/[token]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns 410 when token is invalid or expired', async () => {
    mockValidateDownloadToken.mockResolvedValueOnce(null)

    const { GET } = await import('@/app/api/download/[token]/route')
    const response = await GET(new Request('http://localhost/api/download/bad'), {
      params: Promise.resolve({ token: 'bad' }),
    })

    expect(response.status).toBe(410)
    expect(await response.text()).toBe('Invalid or expired download link')
  })

  it('returns 404 when the product has no download file', async () => {
    mockValidateDownloadToken.mockResolvedValueOnce({ product_id: 'prod-1' })
    mockFindByID.mockResolvedValueOnce({ id: 'prod-1', downloadFile: null })

    const { GET } = await import('@/app/api/download/[token]/route')
    const response = await GET(new Request('http://localhost/api/download/missing'), {
      params: Promise.resolve({ token: 'missing' }),
    })

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('File not found')
  })

  it('returns 404 when download metadata has no filename', async () => {
    mockValidateDownloadToken.mockResolvedValueOnce({ product_id: 'prod-1' })
    mockFindByID
      .mockResolvedValueOnce({ id: 'prod-1', downloadFile: 'file-1' })
      .mockResolvedValueOnce({ id: 'file-1', mimeType: 'application/pdf' })

    const { GET } = await import('@/app/api/download/[token]/route')
    const response = await GET(new Request('http://localhost/api/download/no-filename'), {
      params: Promise.resolve({ token: 'no-filename' }),
    })

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('File metadata missing')
  })

  it('returns 404 for unsafe filenames', async () => {
    mockValidateDownloadToken.mockResolvedValueOnce({ product_id: 'prod-1' })
    mockFindByID
      .mockResolvedValueOnce({ id: 'prod-1', downloadFile: 'file-1' })
      .mockResolvedValueOnce({
        id: 'file-1',
        filename: '../secret.txt',
        mimeType: 'text/plain',
      })

    const { GET } = await import('@/app/api/download/[token]/route')
    const response = await GET(new Request('http://localhost/api/download/unsafe'), {
      params: Promise.resolve({ token: 'unsafe' }),
    })

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('Invalid file path')
  })

  it('streams the file with attachment headers for a valid token', async () => {
    mockValidateDownloadToken.mockResolvedValueOnce({ product_id: 'prod-1' })
    mockFindByID
      .mockResolvedValueOnce({ id: 'prod-1', downloadFile: 'file-1' })
      .mockResolvedValueOnce({
        id: 'file-1',
        filename: 'ebook.pdf',
        filesize: 12,
        mimeType: 'application/pdf',
      })
    await mkdir(privateDownloadDir, { recursive: true })
    await writeFile(privateDownloadFilePath, 'hello world!')

    const { GET } = await import('@/app/api/download/[token]/route')
    const response = await GET(
      new Request('http://localhost/api/download/good'),
      {
        params: Promise.resolve({ token: 'good' }),
      }
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="ebook.pdf"')
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(await response.text()).toBe('hello world!')

    await rm(privateDownloadFilePath, { force: true })
  })

  it('serves the legacy media file for legacy metadata without probing private storage first', async () => {
    mockValidateDownloadToken.mockResolvedValueOnce({ product_id: 'prod-1' })
    mockFindByID
      .mockResolvedValueOnce({ id: 'prod-1', downloadFile: 'file-1' })
      .mockResolvedValueOnce({
        id: 'file-1',
        filename: 'ebook.pdf',
        filesize: 11,
        mimeType: 'application/pdf',
        url: '/media/ebook.pdf',
      })
    await mkdir(legacyMediaDir, { recursive: true })
    await writeFile(legacyMediaFilePath, 'legacy file')
    await mkdir(privateDownloadDir, { recursive: true })
    await writeFile(privateDownloadFilePath, 'wrong file')

    const { GET } = await import('@/app/api/download/[token]/route')
    const response = await GET(new Request('http://localhost/api/download/legacy-pending'), {
      params: Promise.resolve({ token: 'legacy-pending' }),
    })

    expect(response.status).toBe(200)
    expect(await response.text()).toBe('legacy file')

    await rm(privateDownloadFilePath, { force: true })
    await rm(legacyMediaFilePath, { force: true })
  })
})

type RichTextMediaIssue = {
  index: number
  message: string
}

type RichTextUploadNode = {
  fields?: Record<string, unknown>
  relationTo?: unknown
  type?: unknown
  value?: unknown
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function getText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function isUploadNode(node: Record<string, unknown>): node is RichTextUploadNode {
  return node.type === 'upload' && (node.relationTo === 'media' || !node.relationTo)
}

function inspectUploadNode(node: RichTextUploadNode, index: number): RichTextMediaIssue[] {
  const fields = asRecord(node.fields)
  const uploadDoc = asRecord(node.value)

  // Payload may hold only the media id in saved Lexical JSON. Skip those
  // nodes here to avoid blocking publish when the media document is not
  // populated enough to inspect.
  if (typeof node.value !== 'object' || node.value === null) return []

  const alt = getText(fields.alt) || getText(uploadDoc.alt)
  const caption = getText(fields.caption) || getText(uploadDoc.caption)
  const issues: RichTextMediaIssue[] = []

  if (!alt) issues.push({ index, message: `Inline image ${index} is missing alt text.` })
  if (!caption) issues.push({ index, message: `Inline image ${index} is missing a caption.` })

  return issues
}

function walk(node: unknown, state: { imageIndex: number; issues: RichTextMediaIssue[] }) {
  const record = asRecord(node)
  if (!record || Object.keys(record).length === 0) return

  if (record.root) walk(record.root, state)

  if (isUploadNode(record)) {
    state.imageIndex += 1
    state.issues.push(...inspectUploadNode(record, state.imageIndex))
  }

  const children = asRecord(node).children
  if (Array.isArray(children)) {
    for (const child of children) walk(child, state)
  }
}

export function findRichTextMediaQualityIssues(content: unknown): RichTextMediaIssue[] {
  const state = { imageIndex: 0, issues: [] as RichTextMediaIssue[] }
  walk(content, state)
  return state.issues
}

export function assertRichTextMediaQuality(content: unknown) {
  const issues = findRichTextMediaQualityIssues(content)
  if (issues.length === 0) return

  throw new Error(`Fix inline media before publishing: ${issues.map((issue) => issue.message).join(' ')}`)
}

import { RichText } from '@payloadcms/richtext-lexical/react'

interface Props {
  // Payload Lexical content is a dynamic JSON structure — typed as unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
}

/**
 * Renders Payload CMS Lexical rich text content to React JSX.
 * Uses the official @payloadcms/richtext-lexical/react renderer.
 */
export function RichTextRenderer({ content }: Props) {
  if (!content) return null
  return (
    <div className="rich-text-content max-w-none text-foreground">
      <RichText data={content} />
    </div>
  )
}

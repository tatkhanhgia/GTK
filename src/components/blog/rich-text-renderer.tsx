import Image from 'next/image'
import { RichText, type JSXConverter } from '@payloadcms/richtext-lexical/react'

interface Props {
  // Payload Lexical content is a dynamic JSON structure — typed as unknown
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any
}

type UploadDoc = {
  alt?: string
  caption?: string
  filename?: string
  height?: number
  mimeType?: string
  url?: string
  width?: number
}

type UploadNode = {
  fields?: {
    alt?: string
    caption?: string
  }
  value?: UploadDoc | number | string
}

function getUploadDoc(value: unknown): UploadDoc | null {
  return value && typeof value === 'object' ? (value as UploadDoc) : null
}

const uploadFigureConverter: JSXConverter = ({ node }) => {
  const uploadNode = node as UploadNode
  const uploadDoc = getUploadDoc(uploadNode.value)
  if (!uploadDoc?.url) return null

  const alt = uploadNode.fields?.alt || uploadDoc.alt || ''
  const caption = uploadNode.fields?.caption || uploadDoc.caption
  const width = Number(uploadDoc.width) || 1200
  const height = Number(uploadDoc.height) || 675

  if (!uploadDoc.mimeType?.startsWith('image')) {
    return (
      <a href={uploadDoc.url} rel="noopener noreferrer">
        {uploadDoc.filename || uploadDoc.url}
      </a>
    )
  }

  return (
    <figure className="rich-text-figure">
      <Image
        src={uploadDoc.url}
        alt={alt}
        width={width}
        height={height}
        sizes="(min-width: 1280px) 860px, (min-width: 768px) 80vw, 100vw"
        className="rich-text-figure-image"
      />
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

/**
 * Renders Payload CMS Lexical rich text content to React JSX.
 * Uses the official @payloadcms/richtext-lexical/react renderer.
 */
export function RichTextRenderer({ content }: Props) {
  if (!content) return null
  return (
    <div className="rich-text-content max-w-none text-foreground">
      <RichText
        data={content}
        converters={({ defaultConverters }) => ({
          ...defaultConverters,
          upload: uploadFigureConverter,
        })}
      />
    </div>
  )
}

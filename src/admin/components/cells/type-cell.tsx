'use client'
import React from 'react'

/**
 * Custom Cell component for the Products `type` field.
 * Renders a color-coded pill — same visual language as StatusCell but
 * with type-specific colors:
 *   - Ebook    → dusty slate-blue (knowledge)
 *   - Template → lavender (creative)
 *   - Code     → warm amber (technical)
 */

const LABELS: Record<string, string> = {
  ebook: 'Ebook',
  template: 'Template',
  code: 'Code',
}

type TypeCellProps = {
  cellData?: string | null
}

export const TypeCell: React.FC<TypeCellProps> = ({ cellData }) => {
  const value = (cellData ?? '').toLowerCase()
  const label = LABELS[value] ?? (value || '—')

  return (
    <span
      className={`type-pill type-pill--${value || 'unknown'}`}
      aria-label={`Type: ${label}`}
    >
      <span className="type-pill__dot" aria-hidden="true" />
      {label}
    </span>
  )
}

export default TypeCell

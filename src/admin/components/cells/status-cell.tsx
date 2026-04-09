'use client'
import React from 'react'

/**
 * Custom Cell component for the Posts `status` field.
 * Renders a color-coded pill (Draft = stone, Published = sage)
 * with a leading dot indicator. Used in the collection list view.
 */

const LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
}

type StatusCellProps = {
  cellData?: string | null
}

export const StatusCell: React.FC<StatusCellProps> = ({ cellData }) => {
  const value = (cellData ?? 'draft').toLowerCase()
  const label = LABELS[value] ?? value

  return (
    <span
      className={`status-pill status-pill--${value}`}
      aria-label={`Status: ${label}`}
    >
      <span className="status-pill__dot" aria-hidden="true" />
      {label}
    </span>
  )
}

export default StatusCell

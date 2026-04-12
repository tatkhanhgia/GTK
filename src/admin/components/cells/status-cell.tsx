'use client'
import React, { useMemo } from 'react'
import { useAdminTranslation } from '../../i18n/use-admin-translation'

/**
 * Custom Cell component for the Posts `status` field.
 * Renders a color-coded pill (Draft = stone, Published = sage)
 * with a leading dot indicator. Used in the collection list view.
 */

type StatusCellProps = {
  cellData?: string | null
}

export const StatusCell: React.FC<StatusCellProps> = ({ cellData }) => {
  const { t } = useAdminTranslation()
  const value = (cellData ?? 'draft').toLowerCase()

  const LABELS = useMemo<Record<string, string>>(
    () => ({
      draft: t('customCells:statusDraft'),
      published: t('customCells:statusPublished'),
    }),
    [t],
  )

  const label = LABELS[value] ?? value

  return (
    <span
      className={`status-pill status-pill--${value}`}
      aria-label={t('customCells:statusAriaLabel', { label })}
    >
      <span className="status-pill__dot" aria-hidden="true" />
      {label}
    </span>
  )
}

export default StatusCell

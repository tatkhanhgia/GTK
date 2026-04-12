'use client'
import React, { useMemo } from 'react'
import { useAdminTranslation } from '../../i18n/use-admin-translation'

/**
 * Custom Cell component for the Products `type` field.
 * Renders a color-coded pill — same visual language as StatusCell but
 * with type-specific colors:
 *   - Ebook    → dusty slate-blue (knowledge)
 *   - Template → lavender (creative)
 *   - Code     → warm amber (technical)
 */

type TypeCellProps = {
  cellData?: string | null
}

export const TypeCell: React.FC<TypeCellProps> = ({ cellData }) => {
  const { t } = useAdminTranslation()
  const value = (cellData ?? '').toLowerCase()

  const LABELS = useMemo<Record<string, string>>(
    () => ({
      ebook: t('customCells:typeEbook'),
      template: t('customCells:typeTemplate'),
      code: t('customCells:typeCode'),
    }),
    [t],
  )

  const label = LABELS[value] ?? (value || '—')

  return (
    <span
      className={`type-pill type-pill--${value || 'unknown'}`}
      aria-label={t('customCells:typeAriaLabel', { label })}
    >
      <span className="type-pill__dot" aria-hidden="true" />
      {label}
    </span>
  )
}

export default TypeCell

'use client'
import React from 'react'
import { useAdminTranslation } from '../../i18n/use-admin-translation'

/**
 * Custom Cell component for the Products `priceVND` field.
 * Formats raw VND integer (e.g. 250000) as locale-aware currency
 * (e.g. "250.000 ₫") for the collection list view.
 */

const formatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

type PriceVNDCellProps = {
  cellData?: number | string | null
}

export const PriceVNDCell: React.FC<PriceVNDCellProps> = ({ cellData }) => {
  const { t } = useAdminTranslation()

  if (cellData === null || cellData === undefined || cellData === '') {
    return <span className="price-cell price-cell--empty">—</span>
  }

  const numeric =
    typeof cellData === 'number' ? cellData : Number.parseInt(String(cellData), 10)

  if (Number.isNaN(numeric)) {
    return <span className="price-cell price-cell--empty">—</span>
  }

  return (
    <span className="price-cell" aria-label={t('customCells:priceAriaLabel', { value: String(numeric) })}>
      {formatter.format(numeric)}
    </span>
  )
}

export default PriceVNDCell

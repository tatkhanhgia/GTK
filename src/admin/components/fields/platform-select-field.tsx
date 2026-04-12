'use client'
import React, { useCallback, useMemo } from 'react'
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  ReactSelect,
  fieldBaseClass,
  useField,
} from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'
import { PLATFORM_ICONS } from './platform-brand-icons'
import { useAdminTranslation } from '../../i18n/use-admin-translation'

type PlatformOption = {
  label: string
  value: string
}

// react-select passes `data.value` into the Option / SingleValue render
// props. We look up the matching brand SVG and prepend it to the label.
// The icon inherits `currentColor`, so it flips correctly for focused /
// selected / dark-mode states without per-state CSS.
const renderOptionContent = (value: string, label: string) => {
  const Icon = PLATFORM_ICONS[value]
  return (
    <span className="platform-option">
      <span className="platform-option__icon" aria-hidden="true">
        {Icon ? <Icon /> : null}
      </span>
      <span className="platform-option__label">{label}</span>
    </span>
  )
}

const OptionComponent: React.FC<{
  innerProps: React.HTMLAttributes<HTMLDivElement>
  innerRef: React.Ref<HTMLDivElement>
  isFocused: boolean
  isSelected: boolean
  data: PlatformOption
}> = ({ innerProps, innerRef, isFocused, isSelected, data }) => {
  const classes = [
    'rs__option',
    isFocused ? 'rs__option--is-focused' : '',
    isSelected ? 'rs__option--is-selected' : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div ref={innerRef} {...innerProps} className={classes}>
      {renderOptionContent(data.value, data.label)}
    </div>
  )
}

// Always keep `rs__single-value` so our CSS grid-area rule matches.
// Append any extra classes react-select passes via `className` (the
// emotion class that may carry positioning styles).
const SingleValueComponent: React.FC<{
  className?: string
  innerProps: React.HTMLAttributes<HTMLDivElement>
  data: PlatformOption
}> = ({ className, innerProps, data }) => (
  <div
    className={['rs__single-value', className].filter(Boolean).join(' ')}
    {...innerProps}
  >
    {renderOptionContent(data.value, data.label)}
  </div>
)

export const PlatformSelectField: SelectFieldClientComponent = (props) => {
  const { field, path: pathFromProps, readOnly } = props
  const { label, required, admin } = field
  const path = pathFromProps ?? field.name

  const { value, setValue, showError, errorMessage } = useField<string>({ path })
  const { t, i18n } = useAdminTranslation()

  // Build react-select options from the Payload field config. Labels in
  // the Payload config may be strings or localized objects — prefers the
  // current admin UI language so the dropdown follows the language switcher.
  const options = useMemo<PlatformOption[]>(() => {
    const raw = (field as { options?: unknown }).options
    if (!Array.isArray(raw)) return []
    const lang = (i18n.language ?? 'vi') as 'vi' | 'en'
    return raw.map((opt): PlatformOption => {
      if (typeof opt === 'string') return { label: opt, value: opt }
      const o = opt as { label?: unknown; value?: string }
      const resolvedLabel =
        typeof o.label === 'string'
          ? o.label
          : o.label && typeof o.label === 'object'
            ? String(
                (o.label as Record<string, string>)[lang] ??
                  (o.label as Record<string, string>).vi ??
                  (o.label as Record<string, string>).en ??
                  o.value ??
                  '',
              )
            : (o.value ?? '')
      return { label: resolvedLabel, value: String(o.value ?? '') }
    })
  }, [field, i18n.language])

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  )

  const handleChange = useCallback(
    (opt: unknown) => {
      const next = (opt as PlatformOption | null)?.value ?? ''
      setValue(next)
    },
    [setValue],
  )

  return (
    <div
      className={[fieldBaseClass, 'field-type', 'select', showError ? 'error' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <FieldLabel label={label} required={required} path={path} />
      <div className="field-type__wrap">
        <FieldError showError={showError} message={errorMessage} path={path} />
        <ReactSelect
          disabled={readOnly}
          isClearable={false}
          isSearchable
          options={options}
          value={selected ?? undefined}
          onChange={handleChange}
          placeholder={t('customFields:platformPlaceholder')}
          noOptionsMessage={() => t('customFields:platformNoOptions')}
          components={{ Option: OptionComponent, SingleValue: SingleValueComponent }}
        />
        {admin?.description ? (
          <FieldDescription description={admin.description} path={path} />
        ) : null}
      </div>
    </div>
  )
}

export default PlatformSelectField

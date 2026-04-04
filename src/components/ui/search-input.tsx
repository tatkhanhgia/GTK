'use client'

import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  placeholder?: string
  onSearch?: (value: string) => void
  className?: string
}

export function SearchInput({ placeholder = 'Search...', onSearch, className }: SearchInputProps) {
  const [value, setValue] = useState('')

  const handleClear = () => {
    setValue('')
    onSearch?.('')
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        type="search"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          onSearch?.(e.target.value)
        }}
        placeholder={placeholder}
        className={cn(
          'w-full h-11 pl-10 pr-10 rounded-lg border border-border bg-background',
          'text-sm placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'transition-colors'
        )}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

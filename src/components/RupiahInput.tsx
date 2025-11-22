'use client'

import { useEffect, useState } from 'react'

interface RupiahInputProps {
  value: number
  onChange: (value: number) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

/**
 * Format number to Rupiah format with thousand separators
 * @param value - Number to format (e.g., 150000000)
 * @returns Formatted string (e.g., "150.000.000")
 */
function formatRupiahDisplay(value: number | string): string {
  const numStr = String(value).replace(/\D/g, '')
  if (!numStr) return ''
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Convert formatted Rupiah string to plain number
 * @param formattedStr - Formatted string (e.g., "150.000.000")
 * @returns Plain number (e.g., 150000000)
 */
function parseRupiah(formattedStr: string): number {
  const cleaned = formattedStr.replace(/\D/g, '')
  return cleaned ? Number(cleaned) : 0
}

export default function RupiahInput({
  value,
  onChange,
  placeholder = 'Contoh: 150000000',
  label,
  required = false,
  disabled = false,
  className = '',
}: RupiahInputProps) {
  const [displayValue, setDisplayValue] = useState<string>('')

  // Initialize display value when component mounts or value prop changes
  useEffect(() => {
    if (value && value > 0) {
      setDisplayValue(formatRupiahDisplay(value))
    } else {
      setDisplayValue('')
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Only allow digits
    const cleanedValue = inputValue.replace(/\D/g, '')

    // Format for display
    const formatted = formatRupiahDisplay(cleanedValue)
    setDisplayValue(formatted)

    // Parse to number and send to parent
    const numValue = parseRupiah(formatted)
    onChange(numValue)
  }

  const handleBlur = () => {
    // Ensure proper formatting on blur
    if (displayValue) {
      const numValue = parseRupiah(displayValue)
      setDisplayValue(formatRupiahDisplay(numValue))
      onChange(numValue)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for easy replacement
    e.target.select()
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-xs font-medium text-gray-200">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative group">
        {/* Prefix Rp */}
        <span className="absolute left-3 top-3 text-gray-300 text-sm font-medium pointer-events-none z-10">
          Rp
        </span>

        {/* Input field */}
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full
            pl-10
            pr-3
            py-2.5
            bg-white/5
            border
            border-white/20
            rounded-xl
            text-white
            placeholder-gray-400
            focus:outline-none
            focus:ring-2
            focus:ring-gold-500
            focus:border-gold-500
            focus:bg-white/10
            transition-all
            duration-200
            backdrop-blur
            text-sm
            font-medium
            tracking-wide
            ${disabled ? 'opacity-50 cursor-not-allowed bg-white/5' : 'hover:border-white/30'}
          `}
          aria-label={label || 'Rupiah input'}
        />

        {/* Visual indicator */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs hidden group-focus-within:block transition-all">
          {displayValue && `${parseRupiah(displayValue).toLocaleString('id-ID')} (raw)`}
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-400 mt-1">
        Hanya angka, format otomatis dengan pemisah ribuan
      </p>
    </div>
  )
}

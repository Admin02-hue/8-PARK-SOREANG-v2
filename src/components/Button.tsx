/**
 * Button Component
 * ================
 * Tombol reusable dengan berbagai variant
 */

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import clsx from 'clsx'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary:
          'bg-black text-white hover:bg-gray-900 active:bg-black focus-visible:ring-black',
        secondary:
          'bg-white/10 backdrop-blur text-white border border-white/20 hover:bg-white/20 active:bg-white/10 focus-visible:ring-white/50',
        gold: 'bg-gold-600 text-white hover:bg-gold-700 active:bg-gold-600 focus-visible:ring-gold-600 shadow-glow hover:shadow-lg',
        outline:
          'border-2 border-current text-current hover:bg-current/5 active:bg-current/10 focus-visible:ring-current',
        ghost:
          'text-current hover:bg-current/10 active:bg-current/20 focus-visible:ring-current',
        danger:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-600 focus-visible:ring-red-600',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'pointer-events-none',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  icon?: React.ReactNode
  children?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      isLoading,
      disabled,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={clsx(
          buttonVariants({ variant, size, fullWidth, loading: isLoading }),
          className
        )}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {!isLoading && icon && icon}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }

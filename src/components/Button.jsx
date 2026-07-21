import React from 'react'
import { cn } from '../lib/utils'

export default function Button({
  children,
  variant = 'default',
  size = 'default',
  className,
  ...props
}) {
  const baseStyles = 'font-medium transition-colors inline-flex items-center justify-center gap-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap'

  const variants = {
    default: 'bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90',
    outline: 'border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]',
    ghost: 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]',
    destructive: 'bg-[hsl(var(--destructive))] text-white hover:bg-[hsl(var(--destructive))]/90',
    secondary: 'bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--secondary))]/80',
    link: 'text-[hsl(var(--primary))] underline-offset-4 hover:underline'
  }

  const sizes = {
    default: 'h-9 px-4 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-10 px-6 text-base',
    icon: 'h-9 w-9 p-0'
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

import React from 'react'
import { cn } from '../lib/utils'

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--muted))]/50 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-[hsl(var(--muted-foreground))]" />
        </div>
      )}
      <h3 className="text-base font-semibold text-white mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  )
}

import React from 'react'
import { cn } from '../lib/utils'

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex items-start gap-4">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-[hsl(var(--primary))]" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-xl lg:text-2xl font-bold text-white tracking-tight truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}

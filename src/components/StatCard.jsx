import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn, fmtCurrency, fmtNumber, fmtPercent } from '../lib/utils'

const accentMap = {
  primary: 'from-[#E040A0]/15 to-[#9333EA]/5 text-[#E040A0] border-[#E040A0]/20',
  success: 'from-[#22C55E]/15 to-[#22C55E]/5 text-[#22C55E] border-[#22C55E]/20',
  danger: 'from-[#EF4444]/15 to-[#EF4444]/5 text-[#EF4444] border-[#EF4444]/20',
  warning: 'from-[#F59E0B]/15 to-[#F59E0B]/5 text-[#F59E0B] border-[#F59E0B]/20',
  blue: 'from-[#3B82F6]/15 to-[#3B82F6]/5 text-[#3B82F6] border-[#3B82F6]/20'
}

export default function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  accent = 'primary',
  format = 'currency',
  trend,
  className
}) {
  let formattedValue = value
  if (format === 'currency') formattedValue = fmtCurrency(value)
  else if (format === 'number') formattedValue = fmtNumber(value)
  else if (format === 'percent') formattedValue = fmtPercent(value)

  const trendColor = trend && trend > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'

  return (
    <div className={cn(
      'bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-4 lg:p-5 hover:border-[hsl(var(--border))]/80 relative overflow-hidden',
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <p className="text-xl lg:text-2xl font-bold text-white truncate">
              {formattedValue}
            </p>
            {trend !== undefined && (
              <div className={cn('flex items-center gap-0.5 text-xs font-medium shrink-0', trendColor)}>
                {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(trend).toFixed(1)}%
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            'w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 border',
            accentMap[accent]
          )}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  )
}

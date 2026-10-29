import React from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: {
    value: string | number
    label?: string
    isPositive?: boolean
  }
  description?: string
  className?: string
  iconColor?: string
  iconBg?: string
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  className,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
}) => {
  return (
    <Card className={cn('p-5 flex flex-col justify-between transition-all hover:shadow-md', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground">{value}</div>
        </div>
        <div className={cn('p-3 rounded-xl flex items-center justify-center shrink-0', iconBg, iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(trend || description) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/60 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded text-[11px]',
                trend.isPositive !== false
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              )}
            >
              {trend.isPositive !== false ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}
          <span className="text-muted-foreground truncate">{trend?.label || description}</span>
        </div>
      )}
    </Card>
  )
}


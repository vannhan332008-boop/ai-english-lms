import React from 'react'
import { cn } from '@/lib/utils'

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', text, className }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-4', className)}>
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            'rounded-full border-slate-200 dark:border-slate-800 border-t-indigo-600 animate-spin',
            sizeClasses[size]
          )}
        />
        <div className="absolute w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
      </div>
      {text && (
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 tracking-wide animate-pulse">
          {text}
        </p>
      )}
    </div>
  )
}

export default Loader


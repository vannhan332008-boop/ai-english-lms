import React, { useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToastContext, type ToastItem } from '@/context/toast-context-def'

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    ({ title, description, type = 'info', duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9)
      const newToast: ToastItem = { id, title, description, type, duration }

      setToasts((prev) => [...prev, newToast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const success = useCallback(
    (title: string, description?: string) => toast({ title, description, type: 'success' }),
    [toast]
  )

  const error = useCallback(
    (title: string, description?: string) => toast({ title, description, type: 'error' }),
    [toast]
  )

  const info = useCallback(
    (title: string, description?: string) => toast({ title, description, type: 'info' }),
    [toast]
  )

  const warning = useCallback(
    (title: string, description?: string) => toast({ title, description, type: 'warning' }),
    [toast]
  )

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-card text-card-foreground shadow-xl transition-all animate-in slide-in-from-bottom-5 duration-200',
              t.type === 'success' && 'border-emerald-500/30 dark:border-emerald-500/40',
              t.type === 'error' && 'border-destructive/40',
              t.type === 'warning' && 'border-amber-500/40',
              t.type === 'info' && 'border-primary/40'
            )}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
            {t.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />}

            <div className="flex-1 space-y-0.5">
              <h5 className="text-xs font-semibold text-foreground">{t.title}</h5>
              {t.description && <p className="text-[11px] text-muted-foreground leading-relaxed">{t.description}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

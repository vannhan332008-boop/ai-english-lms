import React from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-[50vh] w-full flex flex-col items-center justify-center p-8 transition-opacity duration-300">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-14 w-14 rounded-2xl bg-indigo-500/20 animate-ping" />
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <Sparkles className="h-6 w-6 animate-pulse" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
        <span>Đang tải nội dung...</span>
      </div>
    </div>
  )
}

export default PageLoader


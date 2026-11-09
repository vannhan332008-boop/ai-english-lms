import React, { useEffect, useState } from 'react'
import { Download, X, Smartphone, Sparkles } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if user dismissed recently
    const dismissedUntil = localStorage.getItem('ef_pwa_dismissed_until')
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return
    }

    let promptTimer: any = null

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after a small delay for better user experience
      promptTimer = setTimeout(() => {
        setIsOpen(true)
      }, 2500)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsOpen(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      if (promptTimer) clearTimeout(promptTimer)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback hint for browsers (iOS Safari, etc.)
      alert(
        'Để cài đặt trên thiết bị di động:\n• Safari (iOS): Nhấn nút Chia sẻ (Share) -> chọn "Thêm vào MH chính" (Add to Home Screen).\n• Chrome (Android): Mở menu ⋮ -> chọn "Cài đặt ứng dụng".'
      )
      setIsOpen(false)
      return
    }

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
      setIsOpen(false)
    } catch (err) {
      console.warn('Install prompt error:', err)
      setIsOpen(false)
    }
  }

  const handleDismiss = () => {
    setIsOpen(false)
    // Squelch for 3 days
    localStorage.setItem('ef_pwa_dismissed_until', (Date.now() + 3 * 24 * 60 * 60 * 1000).toString())
  }

  if (isInstalled || !isOpen) {
    return null
  }

  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 max-w-sm rounded-2xl bg-slate-900/95 border border-indigo-500/30 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 text-white"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20 text-white">
          <Smartphone className="h-6 w-6" />
        </div>

        <div className="flex-1 pr-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Trải nghiệm App mượt mà</span>
          </div>
          <h3 id="pwa-install-title" className="text-sm font-bold text-slate-100 mt-0.5">
            Cài đặt EnglishFlow LMS
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            Mở nhanh từ màn hình chính, học ngoại tuyến và nhận thông báo lớp học tức thì.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              Cài đặt ngay
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Để sau
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Đóng"
          aria-label="Đóng gợi ý cài đặt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default PwaInstallPrompt

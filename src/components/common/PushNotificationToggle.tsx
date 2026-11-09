import React, { useState, useEffect, useRef } from 'react'
import { Bell, BellOff, BellRing, Loader2, Check } from 'lucide-react'
import { notificationService, urlBase64ToUint8Array } from '../../services/notificationService'

interface PushNotificationToggleProps {
  className?: string
  compact?: boolean
}

export const PushNotificationToggle: React.FC<PushNotificationToggleProps> = ({
  className = '',
  compact = false,
}) => {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const messageTimerRef = useRef<any>(null)

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true)

      // Check current subscription
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => {
          setIsSubscribed(!!sub)
        })
        .catch((err) => {
          console.warn('[Push] Error checking subscription:', err)
        })
    }
  }, [])

  const handleToggle = async () => {
    if (!isSupported) {
      alert('Trình duyệt của bạn chưa hỗ trợ tính năng Web Push Notifications.')
      return
    }

    if (Notification.permission === 'denied') {
      alert(
        'Quyền thông báo hiện đang bị chặn (Denied) trên trình duyệt này. Vui lòng vào Cài đặt trình duyệt để cho phép EnglishFlow gửi thông báo.'
      )
      return
    }

    setIsLoading(true)
    setStatusMessage(null)

    try {
      const reg = await navigator.serviceWorker.ready

      if (isSubscribed) {
        // Unsubscribe
        const currentSub = await reg.pushManager.getSubscription()
        if (currentSub) {
          await currentSub.unsubscribe()
        }
        await notificationService.unsubscribePush()
        setIsSubscribed(false)
        setStatusMessage('Đã tắt nhận thông báo đẩy.')
      } else {
        // Request permission if default
        const currentPerm = await Notification.requestPermission()

        if (currentPerm !== 'granted') {
          setStatusMessage('Bạn chưa cấp quyền nhận thông báo.')
          setIsLoading(false)
          return
        }

        // Fetch VAPID key
        const vapidPublicKey = await notificationService.getVapidPublicKey()
        if (!vapidPublicKey) {
          throw new Error('Không lấy được VAPID public key từ hệ thống.')
        }

        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)
        const newSub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey as unknown as BufferSource,
        })

        await notificationService.subscribePush(newSub.toJSON())
        setIsSubscribed(true)
        setStatusMessage('Đã bật thông báo đẩy thành công!')
      }
    } catch (err: any) {
      console.error('[Push] Toggle error:', err)
      setStatusMessage(err.message || 'Lỗi thiết lập thông báo đẩy.')
    } finally {
      setIsLoading(false)
      messageTimerRef.current = setTimeout(() => setStatusMessage(null), 4000)
    }
  }

  if (!isSupported) {
    return null
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        title={isSubscribed ? 'Đang bật Web Push (Nhấn để tắt)' : 'Bật nhận thông báo Web Push trên máy'}
        className={`relative inline-flex items-center justify-center rounded-lg p-2 transition-all ${
          isSubscribed
            ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        } ${className}`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
        ) : isSubscribed ? (
          <BellRing className="h-4 w-4" />
        ) : (
          <BellOff className="h-4 w-4" />
        )}
      </button>
    )
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-slate-700/60 bg-slate-800/40">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isSubscribed
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {isSubscribed ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-200">Thông báo đẩy (Web Push)</h4>
            <p className="text-xs text-slate-400">
              {isSubscribed
                ? 'Đang nhận thông báo bài tập & lớp học trên thiết bị này'
                : 'Nhận thông báo bài nộp, điểm số và lịch học ngay cả khi đóng tab'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoading}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isSubscribed
              ? 'bg-slate-700 text-slate-200 hover:bg-rose-950/40 hover:text-rose-300 hover:border-rose-800/60 border border-slate-600'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/30'
          }`}
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {!isLoading && isSubscribed && <Check className="h-3.5 w-3.5" />}
          <span>{isSubscribed ? 'Đang bật' : 'Bật ngay'}</span>
        </button>
      </div>

      {statusMessage && (
        <div className="text-xs text-indigo-400 flex items-center gap-1 px-1">
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  )
}

export default PushNotificationToggle

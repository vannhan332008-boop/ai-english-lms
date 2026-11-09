import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Trash2, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  showDetails: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary] Caught render crash:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleClearCacheAndReload = () => {
    try {
      localStorage.removeItem('ef_active_role')
      sessionStorage.clear()
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name))
        })
      }
    } catch {
      // Ignored
    }
    window.location.href = '/'
  }

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }))
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const isDev = import.meta.env.DEV

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            {/* Warning Icon with Glow */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 shadow-lg shadow-amber-500/10">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Đã có sự cố bất ngờ xảy ra
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
              Rất tiếc, giao diện ứng dụng gặp lỗi khi xử lý dữ liệu. Toàn bộ tiến trình học tập và tài khoản của bạn trên máy chủ vẫn được bảo toàn an toàn.
            </p>

            {/* Quick Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Thử tải lại trang
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95"
              >
                <Home className="w-3.5 h-3.5" />
                Về trang chủ
              </button>
            </div>

            {/* Clear cache option */}
            <div className="mt-4">
              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Xóa bộ nhớ đệm trình duyệt & làm mới
              </button>
            </div>

            {/* Developer Error Diagnostics (Development Mode) */}
            {isDev && this.state.error && (
              <div className="mt-6 text-left border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={this.toggleDetails}
                  className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  <span>Chi tiết lỗi kỹ thuật (Chế độ Dev)</span>
                  {this.state.showDetails ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {this.state.showDetails && (
                  <div className="mt-3 p-3 rounded-xl bg-black/60 border border-slate-800 font-mono text-[11px] text-rose-300 max-h-56 overflow-auto whitespace-pre-wrap leading-relaxed">
                    <div className="font-bold text-rose-400 mb-1">{this.state.error.toString()}</div>
                    {this.state.errorInfo?.componentStack}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

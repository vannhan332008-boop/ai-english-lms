import React, { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from 'lucide-react'
import { formatDuration } from '@/utils/formatters'
import { cn } from '@/lib/utils'

export interface VideoPlayerProps {
  src?: string
  videoUrl?: string
  title?: string
  poster?: string
  onComplete?: () => void
  onEnded?: () => void
  className?: string
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  videoUrl,
  title,
  poster,
  onComplete,
  onEnded,
  className,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [controlsTimeout, setControlsTimeout] = useState<any>(null)

  const defaultVideoSrc =
    videoUrl || src || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play().catch(() => {})
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    setCurrentTime(videoRef.current.currentTime)

    if (
      videoRef.current.duration &&
      videoRef.current.currentTime >= videoRef.current.duration - 0.5
    ) {
      onComplete?.()
      onEnded?.()
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleRateChange = () => {
    const rates = [1, 1.25, 1.5, 2]
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length]
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate
      setPlaybackRate(nextRate)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      containerRef.current.requestFullscreen().catch(() => {})
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeout) clearTimeout(controlsTimeout)
    const timeout = setTimeout(() => {
      if (isPlaying) setShowControls(false)
    }, 2500)
    setControlsTimeout(timeout)
  }

  useEffect(() => {
    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout)
    }
  }, [controlsTimeout])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className={cn(
        'group relative aspect-video w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-2xl select-none',
        className
      )}
    >
      <video
        ref={videoRef}
        src={defaultVideoSrc}
        poster={poster || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200'}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
        playsInline
      />

      {/* Center Giant Play Button when Paused */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-slate-950/30 backdrop-blur-[2px] cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl shadow-indigo-500/50 hover:scale-110 active:scale-95 transition-all">
            <Play className="w-7 h-7 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* Top Banner overlay */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 flex items-center justify-between text-white',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <h4 className="text-xs font-bold tracking-wide truncate max-w-md">
            {title || 'Bài giảng tương tác trực tuyến'}
          </h4>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
          HD 1080p
        </span>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 space-y-2',
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Progress Bar Slider */}
        <div className="relative flex items-center group/scrubber">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all"
          />
        </div>

        {/* Action Buttons Row */}
        <div className="flex items-center justify-between text-white text-xs font-semibold">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Âm lượng"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <span className="font-mono text-[11px] text-white/80">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRateChange}
              className="px-2 py-1 rounded-md text-[11px] font-mono bg-white/10 hover:bg-white/20 transition-colors"
            >
              {playbackRate}x
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Toàn màn hình"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer

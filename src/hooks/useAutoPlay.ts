import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { ArcData } from '../utils/globe'

export interface AutoPlayState {
  isPlaying: boolean
  currentIndex: number
  currentArc: ArcData | null
  visibleArcs: ArcData[]
  total: number
  speed: number
  progress: number
  currentYear: number | null
  togglePlay: () => void
  setSpeed: (speed: number) => void
  reset: () => void
  seekTo: (index: number) => void
}

export function useAutoPlay(arcs: ArcData[]): AutoPlayState {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [speed, setSpeed] = useState(3)
  const prevPadRef = useRef<string>('')

  const sortedArcs = useMemo(
    () => [...arcs].sort((a, b) => a.launch.date_unix - b.launch.date_unix),
    [arcs]
  )

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1
        if (next >= sortedArcs.length) {
          setIsPlaying(false)
          return sortedArcs.length - 1
        }
        return next
      })
    }, 1000 / speed)

    return () => clearInterval(interval)
  }, [isPlaying, speed, sortedArcs.length])

  useEffect(() => {
    setCurrentIndex(-1)
    setIsPlaying(false)
    prevPadRef.current = ''
  }, [arcs])

  const currentArc = currentIndex >= 0 ? sortedArcs[currentIndex] ?? null : null

  const visibleArcs = useMemo(() => {
    if (currentIndex < 0) return sortedArcs
    return sortedArcs.slice(0, currentIndex + 1)
  }, [sortedArcs, currentIndex])

  const currentYear = currentArc
    ? new Date(currentArc.launch.date_utc).getFullYear()
    : null

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      if (!prev && currentIndex >= sortedArcs.length - 1) {
        setCurrentIndex(0)
      } else if (!prev && currentIndex < 0) {
        setCurrentIndex(0)
      }
      return !prev
    })
  }, [currentIndex, sortedArcs.length])

  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentIndex(-1)
    prevPadRef.current = ''
  }, [])

  const seekTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(-1, Math.min(index, sortedArcs.length - 1)))
  }, [sortedArcs.length])

  const progress = sortedArcs.length > 0
    ? Math.max(0, (currentIndex + 1) / sortedArcs.length)
    : 0

  return {
    isPlaying,
    currentIndex,
    currentArc,
    visibleArcs,
    total: sortedArcs.length,
    speed,
    progress,
    currentYear,
    togglePlay,
    setSpeed,
    reset,
    seekTo,
  }
}

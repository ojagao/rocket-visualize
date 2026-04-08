import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { useSpaceXData } from './hooks/useSpaceXData'
import { useAutoPlay } from './hooks/useAutoPlay'
import { LaunchGlobe } from './components/LaunchGlobe'
import { LaunchPanel } from './components/LaunchPanel'
import { Timeline } from './components/Timeline'
import { StatsBar } from './components/StatsBar'
import { NowPlayingHud } from './components/NowPlayingHud'
import { LoadingScreen } from './components/LoadingScreen'
import type { ArcData, PointData } from './utils/globe'

export default function App() {
  const data = useSpaceXData()
  const autoPlay = useAutoPlay(data.filteredArcData)
  const [selectedArc, setSelectedArc] = useState<ArcData | null>(null)
  const [fadeIn, setFadeIn] = useState(false)
  const prevPadRef = useRef<string>('')

  useEffect(() => {
    if (!data.loading) {
      const timer = setTimeout(() => setFadeIn(true), 100)
      return () => clearTimeout(timer)
    }
  }, [data.loading])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        autoPlay.togglePlay()
      }
      if (e.code === 'Escape') {
        if (selectedArc) setSelectedArc(null)
        else if (autoPlay.isPlaying) autoPlay.togglePlay()
      }
      if (e.code === 'KeyR' && !e.metaKey && !e.ctrlKey) {
        autoPlay.reset()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [autoPlay, selectedArc])

  const focusPoint = useMemo(() => {
    if (!autoPlay.isPlaying || !autoPlay.currentArc) return null
    const pad = autoPlay.currentArc.launchpadName
    if (pad === prevPadRef.current) return null
    prevPadRef.current = pad
    return {
      lat: autoPlay.currentArc.startLat,
      lng: autoPlay.currentArc.startLng,
    }
  }, [autoPlay.isPlaying, autoPlay.currentArc])

  const displayArcs = autoPlay.currentIndex >= 0
    ? autoPlay.visibleArcs
    : data.filteredArcData

  const handleArcClick = useCallback((arc: ArcData) => {
    setSelectedArc(arc)
  }, [])

  const handlePointClick = useCallback(
    (point: PointData) => {
      const firstLaunch = data.filteredArcData.find(
        (a) => a.launchpadName === point.name
      )
      if (firstLaunch) setSelectedArc(firstLaunch)
    },
    [data.filteredArcData]
  )

  const handleClosePanel = useCallback(() => {
    setSelectedArc(null)
  }, [])

  if (data.loading) return <LoadingScreen />

  if (data.error) {
    return (
      <div className="error-screen">
        <h1>Error</h1>
        <p>{data.error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  return (
    <div className={`app ${fadeIn ? 'app-visible' : ''}`} onClick={handleClosePanel}>
      <div className="globe-container">
        <LaunchGlobe
          arcData={displayArcs}
          pointData={data.pointData}
          ringData={data.ringData}
          onArcClick={handleArcClick}
          onPointClick={handlePointClick}
          focusPoint={focusPoint}
          highlightArcId={
            autoPlay.isPlaying ? autoPlay.currentArc?.id ?? null : null
          }
        />
      </div>

      <div className="vignette" />

      <header className="header">
        <h1 className="header-title">
          SPACE<span className="header-accent">X</span> LAUNCH VISUALIZER
        </h1>
        <p className="header-subtitle">
          Interactive 3D visualization of{' '}
          {data.launches.filter((l) => !l.upcoming).length} missions
        </p>
      </header>

      <StatsBar
        arcData={displayArcs}
        rockets={data.rockets}
        selectedRockets={data.selectedRockets}
        onToggleRocket={data.toggleRocket}
      />

      {autoPlay.isPlaying && (
        <NowPlayingHud
          arc={autoPlay.currentArc}
          index={autoPlay.currentIndex}
          total={autoPlay.total}
        />
      )}

      <Timeline
        yearRange={data.yearRange}
        selectedYears={data.selectedYears}
        onYearChange={data.setSelectedYears}
        launches={data.launches}
        isPlaying={autoPlay.isPlaying}
        onTogglePlay={autoPlay.togglePlay}
        onReset={autoPlay.reset}
        speed={autoPlay.speed}
        onSpeedChange={autoPlay.setSpeed}
        progress={autoPlay.progress}
        currentYear={autoPlay.currentYear}
      />

      <LaunchPanel arc={selectedArc} onClose={handleClosePanel} />

      <div className="shortcut-hint">
        <kbd>Space</kbd> Play &nbsp; <kbd>Esc</kbd> Close &nbsp; <kbd>R</kbd>{' '}
        Reset
      </div>
    </div>
  )
}

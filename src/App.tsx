import { useState, useCallback } from 'react'
import { useSpaceXData } from './hooks/useSpaceXData'
import { LaunchGlobe } from './components/LaunchGlobe'
import { LaunchPanel } from './components/LaunchPanel'
import { Timeline } from './components/Timeline'
import { StatsBar } from './components/StatsBar'
import { LoadingScreen } from './components/LoadingScreen'
import type { ArcData, PointData } from './utils/globe'

export default function App() {
  const data = useSpaceXData()
  const [selectedArc, setSelectedArc] = useState<ArcData | null>(null)

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
    <div className="app" onClick={handleClosePanel}>
      <div className="globe-container">
        <LaunchGlobe
          arcData={data.filteredArcData}
          pointData={data.pointData}
          ringData={data.ringData}
          onArcClick={handleArcClick}
          onPointClick={handlePointClick}
        />
      </div>

      <header className="header">
        <h1 className="header-title">
          SPACE<span className="header-accent">X</span> LAUNCH VISUALIZER
        </h1>
        <p className="header-subtitle">
          Interactive 3D visualization of {data.launches.filter((l) => !l.upcoming).length} launches
        </p>
      </header>

      <StatsBar
        arcData={data.filteredArcData}
        rockets={data.rockets}
        selectedRockets={data.selectedRockets}
        onToggleRocket={data.toggleRocket}
      />

      <Timeline
        yearRange={data.yearRange}
        selectedYears={data.selectedYears}
        onYearChange={data.setSelectedYears}
        launches={data.launches}
      />

      <LaunchPanel arc={selectedArc} onClose={handleClosePanel} />
    </div>
  )
}

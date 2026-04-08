import { useRef, useEffect, useCallback, useState } from 'react'
import GlobeGL from 'react-globe.gl'
import type { ArcData, PointData, RingData } from '../utils/globe'

interface LaunchGlobeProps {
  arcData: ArcData[]
  pointData: PointData[]
  ringData: RingData[]
  onArcClick: (arc: ArcData) => void
  onPointClick: (point: PointData) => void
}

const GLOBE_IMAGE = '//unpkg.com/three-globe/example/img/earth-night.jpg'
const BACKGROUND_IMAGE = '//unpkg.com/three-globe/example/img/night-sky.png'
const BUMP_IMAGE = '//unpkg.com/three-globe/example/img/earth-topology.png'

export function LaunchGlobe({
  arcData,
  pointData,
  ringData,
  onArcClick,
  onPointClick,
}: LaunchGlobeProps) {
  const globeRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    globe.controls().autoRotate = true
    globe.controls().autoRotateSpeed = 0.4
    globe.controls().enableDamping = true
    globe.controls().dampingFactor = 0.1

    globe.pointOfView({ lat: 28.5, lng: -80.6, altitude: 2.5 }, 1000)
  }, [])

  const handleArcClick = useCallback(
    (arc: object) => onArcClick(arc as ArcData),
    [onArcClick]
  )

  const handlePointClick = useCallback(
    (point: object) => onPointClick(point as PointData),
    [onPointClick]
  )

  const arcLabel = useCallback((d: object) => {
    const arc = d as ArcData
    const dateStr = new Date(arc.launch.date_utc).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    const status = arc.launch.success === true
      ? '<span style="color:#00ff88">SUCCESS</span>'
      : arc.launch.success === false
        ? '<span style="color:#ff4444">FAILURE</span>'
        : '<span style="color:#888">PENDING</span>'

    return `
      <div style="
        background: rgba(10,10,30,0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 10px 14px;
        font-family: 'Inter', sans-serif;
        color: white;
        font-size: 13px;
        line-height: 1.5;
        min-width: 180px;
      ">
        <div style="font-weight:600; font-size:14px; margin-bottom:4px;">${arc.launch.name}</div>
        <div style="color:#aaa;">${dateStr}</div>
        <div style="margin-top:4px;">${arc.rocketName} ${status}</div>
      </div>
    `
  }, [])

  const pointLabel = useCallback((d: object) => {
    const point = d as PointData
    return `
      <div style="
        background: rgba(10,10,30,0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 8px;
        padding: 8px 12px;
        font-family: 'Inter', sans-serif;
        color: white;
        font-size: 13px;
      ">
        <div style="font-weight:600;">${point.name}</div>
        <div style="color:#aaa; font-size:12px;">${point.fullName}</div>
      </div>
    `
  }, [])

  return (
    <GlobeGL
      ref={globeRef}
      width={dimensions.width}
      height={dimensions.height}
      globeImageUrl={GLOBE_IMAGE}
      bumpImageUrl={BUMP_IMAGE}
      backgroundImageUrl={BACKGROUND_IMAGE}
      atmosphereColor="#4a9eff"
      atmosphereAltitude={0.2}
      animateIn={true}
      arcsData={arcData}
      arcStartLat="startLat"
      arcStartLng="startLng"
      arcEndLat="endLat"
      arcEndLng="endLng"
      arcColor="color"
      arcAltitude="altitude"
      arcStroke="stroke"
      arcDashLength={0.6}
      arcDashGap={0.3}
      arcDashAnimateTime={2000}
      arcLabel={arcLabel}
      onArcClick={handleArcClick}
      pointsData={pointData}
      pointLat="lat"
      pointLng="lng"
      pointColor="color"
      pointAltitude={0.01}
      pointRadius="size"
      pointLabel={pointLabel}
      onPointClick={handlePointClick}
      ringsData={ringData}
      ringLat="lat"
      ringLng="lng"
      ringColor="color"
      ringMaxRadius="maxRadius"
      ringPropagationSpeed="propagationSpeed"
      ringRepeatPeriod="repeatPeriod"
    />
  )
}

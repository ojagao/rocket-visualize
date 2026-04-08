import { useRef, useEffect, useCallback, useState } from 'react'
import GlobeGL from 'react-globe.gl'
import type { ArcData, PointData, RingData } from '../utils/globe'

interface LaunchGlobeProps {
  arcData: ArcData[]
  pointData: PointData[]
  ringData: RingData[]
  onArcClick: (arc: ArcData) => void
  onPointClick: (point: PointData) => void
  focusPoint?: { lat: number; lng: number } | null
  highlightArcId?: string | null
}

const GLOBE_IMAGE = '//unpkg.com/three-globe/example/img/earth-night.jpg'
const BACKGROUND_IMAGE = '//unpkg.com/three-globe/example/img/night-sky.png'
const BUMP_IMAGE = '//unpkg.com/three-globe/example/img/earth-topology.png'
const CLOUDS_IMAGE = '//unpkg.com/three-globe/example/img/earth-water.png'

export function LaunchGlobe({
  arcData,
  pointData,
  ringData,
  onArcClick,
  onPointClick,
  focusPoint,
  highlightArcId,
}: LaunchGlobeProps) {
  const globeRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

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

    const controls = globe.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.3
    controls.enableDamping = true
    controls.dampingFactor = 0.1
    controls.minDistance = 150
    controls.maxDistance = 600

    globe.pointOfView({ lat: 28.5, lng: -80.6, altitude: 2.2 }, 2000)

    const scene = globe.scene()
    if (scene) {
      scene.fog = null
    }

    const renderer = globe.renderer()
    if (renderer) {
      renderer.toneMapping = 1 // LinearToneMapping
      renderer.toneMappingExposure = 1.2
    }
  }, [])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe || !focusPoint) return

    const controls = globe.controls()
    controls.autoRotate = false

    globe.pointOfView(
      { lat: focusPoint.lat, lng: focusPoint.lng, altitude: 1.8 },
      800
    )

    const timer = setTimeout(() => {
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.15
    }, 3000)

    return () => clearTimeout(timer)
  }, [focusPoint])

  const handleArcClick = useCallback(
    (arc: object) => onArcClick(arc as ArcData),
    [onArcClick]
  )

  const handlePointClick = useCallback(
    (point: object) => onPointClick(point as PointData),
    [onPointClick]
  )

  const arcColor = useCallback(
    (d: object) => {
      const arc = d as ArcData
      if (highlightArcId && arc.id === highlightArcId) {
        return ['#ffffff', '#ffffff']
      }
      if (highlightArcId && arc.id !== highlightArcId) {
        return [arc.color[0] + '44', arc.color[1] + '44']
      }
      return arc.color
    },
    [highlightArcId]
  )

  const arcStroke = useCallback(
    (d: object) => {
      const arc = d as ArcData
      if (highlightArcId && arc.id === highlightArcId) return 1.2
      if (highlightArcId) return 0.2
      return arc.stroke
    },
    [highlightArcId]
  )

  const arcDashAnimateTime = useCallback(
    (d: object) => {
      const arc = d as ArcData
      if (highlightArcId && arc.id === highlightArcId) return 800
      return 3000
    },
    [highlightArcId]
  )

  const arcLabel = useCallback(
    (d: object) => {
      const arc = d as ArcData
      const dateStr = new Date(arc.launch.date_utc).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      const statusIcon =
        arc.launch.success === true
          ? '<span style="color:#00ff88;font-size:16px">&#10003;</span>'
          : arc.launch.success === false
            ? '<span style="color:#ff4444;font-size:16px">&#10007;</span>'
            : '<span style="color:#888">&#8212;</span>'

      return `
      <div style="
        background: rgba(8,8,24,0.92);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(0,212,255,0.2);
        border-radius: 12px;
        padding: 12px 16px;
        font-family: 'Inter', sans-serif;
        color: white;
        font-size: 13px;
        line-height: 1.6;
        min-width: 200px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(0,212,255,0.1);
      ">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          ${statusIcon}
          <span style="font-weight:700;font-size:15px;font-family:'Orbitron',sans-serif;letter-spacing:1px;">${arc.launch.name}</span>
        </div>
        <div style="color:#aaa;font-size:12px;">${dateStr}</div>
        <div style="margin-top:6px;display:flex;align-items:center;gap:6px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${arc.color[0]}"></span>
          <span style="font-size:12px;">${arc.rocketName}</span>
          <span style="color:#555;margin-left:auto;font-size:11px;">Flight #${arc.launch.flight_number}</span>
        </div>
      </div>
    `
    },
    []
  )

  const pointLabel = useCallback((d: object) => {
    const point = d as PointData
    return `
      <div style="
        background: rgba(8,8,24,0.92);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(0,255,136,0.2);
        border-radius: 10px;
        padding: 10px 14px;
        font-family: 'Inter', sans-serif;
        color: white;
        font-size: 13px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      ">
        <div style="font-weight:700;font-family:'Orbitron',sans-serif;font-size:13px;letter-spacing:1px;">${point.name}</div>
        <div style="color:#aaa;font-size:11px;margin-top:4px;">${point.fullName}</div>
        <div style="color:#00ff88;font-size:11px;margin-top:6px;">${point.launchpad.launch_attempts} launches &bull; ${point.launchpad.launch_successes} successes</div>
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
      showAtmosphere={true}
      atmosphereColor="#3a7bd5"
      atmosphereAltitude={0.25}
      globeCloudsImageUrl={CLOUDS_IMAGE}
      globeCloudsAltitude={0.005}
      globeCloudsOpacity={0.3}
      animateIn={true}
      arcsData={arcData}
      arcStartLat="startLat"
      arcStartLng="startLng"
      arcEndLat="endLat"
      arcEndLng="endLng"
      arcColor={arcColor}
      arcAltitude="altitude"
      arcStroke={arcStroke}
      arcDashLength={0.5}
      arcDashGap={0.2}
      arcDashAnimateTime={arcDashAnimateTime}
      arcLabel={arcLabel}
      onArcClick={handleArcClick}
      arcsTransitionDuration={400}
      pointsData={pointData}
      pointLat="lat"
      pointLng="lng"
      pointColor="color"
      pointAltitude={0.015}
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

import { useMemo, useEffect, useRef, useState } from 'react'
import type { ArcData } from '../utils/globe'
import type { Rocket } from '../api/spacex'
import { ROCKET_COLOR_MAP } from '../utils/globe'

interface StatsBarProps {
  arcData: ArcData[]
  rockets: Rocket[]
  selectedRockets: Set<string>
  onToggleRocket: (rocketId: string) => void
}

function AnimatedNumber({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const start = prevRef.current
    const diff = value - start
    if (diff === 0) return

    const startTime = performance.now()

    function animate(time: number) {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(start + diff * eased)
      setDisplay(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        prevRef.current = value
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration])

  return <>{display}</>
}

export function StatsBar({
  arcData,
  rockets,
  selectedRockets,
  onToggleRocket,
}: StatsBarProps) {
  const stats = useMemo(() => {
    const total = arcData.length
    const successful = arcData.filter((a) => a.launch.success === true).length
    const failed = arcData.filter((a) => a.launch.success === false).length
    const rate = total > 0 ? Math.round((successful / total) * 1000) / 10 : 0

    const byRocket: Record<string, number> = {}
    arcData.forEach((a) => {
      byRocket[a.rocketName] = (byRocket[a.rocketName] ?? 0) + 1
    })

    return { total, successful, failed, rate, byRocket }
  }, [arcData])

  return (
    <div className="stats-bar">
      <div className="stats-numbers">
        <div className="stat">
          <span className="stat-value">
            <AnimatedNumber value={stats.total} />
          </span>
          <span className="stat-label">LAUNCHES</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-value stat-success">
            <AnimatedNumber value={stats.successful} />
          </span>
          <span className="stat-label">SUCCESS</span>
        </div>
        <div className="stat">
          <span className="stat-value stat-failure">
            <AnimatedNumber value={stats.failed} />
          </span>
          <span className="stat-label">FAILED</span>
        </div>
        <div className="stat-divider" />
        <div className="stat">
          <span className="stat-value">
            {stats.rate.toFixed(1)}<span className="stat-unit">%</span>
          </span>
          <span className="stat-label">RATE</span>
        </div>
      </div>

      <div className="stats-rockets">
        {rockets.map((rocket) => {
          const color = ROCKET_COLOR_MAP[rocket.name] ?? '#00d4ff'
          const count = stats.byRocket[rocket.name] ?? 0
          const isActive = selectedRockets.has(rocket.id)
          return (
            <button
              key={rocket.id}
              className={`rocket-filter ${isActive ? 'active' : ''}`}
              style={
                {
                  '--rocket-color': color,
                  borderColor: isActive ? color : 'rgba(255,255,255,0.1)',
                  color: isActive ? color : '#555',
                } as React.CSSProperties
              }
              onClick={() => onToggleRocket(rocket.id)}
            >
              <span
                className="rocket-dot"
                style={{ background: isActive ? color : '#333' }}
              />
              {rocket.name}
              <span className="rocket-count">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

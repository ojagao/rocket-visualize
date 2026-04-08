import { useMemo } from 'react'
import type { ArcData } from '../utils/globe'
import type { Rocket } from '../api/spacex'
import { ROCKET_COLOR_MAP } from '../utils/globe'

interface StatsBarProps {
  arcData: ArcData[]
  rockets: Rocket[]
  selectedRockets: Set<string>
  onToggleRocket: (rocketId: string) => void
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
    const rate = total > 0 ? ((successful / total) * 100).toFixed(1) : '0'

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
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">LAUNCHES</span>
        </div>
        <div className="stat">
          <span className="stat-value stat-success">{stats.successful}</span>
          <span className="stat-label">SUCCESS</span>
        </div>
        <div className="stat">
          <span className="stat-value stat-failure">{stats.failed}</span>
          <span className="stat-label">FAILED</span>
        </div>
        <div className="stat">
          <span className="stat-value">{stats.rate}%</span>
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
              style={{
                '--rocket-color': color,
                borderColor: isActive ? color : 'rgba(255,255,255,0.15)',
                color: isActive ? color : '#666',
              } as React.CSSProperties}
              onClick={() => onToggleRocket(rocket.id)}
            >
              <span className="rocket-dot" style={{ background: isActive ? color : '#444' }} />
              {rocket.name}
              <span className="rocket-count">{count}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { useCallback, useMemo } from 'react'
import type { Launch } from '../api/spacex'

interface TimelineProps {
  yearRange: [number, number]
  selectedYears: [number, number]
  onYearChange: (range: [number, number]) => void
  launches: Launch[]
  isPlaying: boolean
  onTogglePlay: () => void
  onReset: () => void
  speed: number
  onSpeedChange: (speed: number) => void
  progress: number
  currentYear: number | null
}

const SPEED_OPTIONS = [1, 3, 6, 12]

export function Timeline({
  yearRange,
  selectedYears,
  onYearChange,
  launches,
  isPlaying,
  onTogglePlay,
  onReset,
  speed,
  onSpeedChange,
  progress,
  currentYear,
}: TimelineProps) {
  const [minYear, maxYear] = yearRange

  const yearStats = useMemo(() => {
    const stats: Record<number, { success: number; failure: number; other: number }> = {}
    for (let y = minYear; y <= maxYear; y++) stats[y] = { success: 0, failure: 0, other: 0 }
    launches
      .filter((l) => !l.upcoming)
      .forEach((l) => {
        const year = new Date(l.date_utc).getFullYear()
        const s = stats[year]
        if (!s) return
        if (l.success === true) s.success++
        else if (l.success === false) s.failure++
        else s.other++
      })
    return stats
  }, [launches, minYear, maxYear])

  const maxCount = useMemo(() => {
    return Math.max(
      1,
      ...Object.values(yearStats).map((s) => s.success + s.failure + s.other)
    )
  }, [yearStats])

  const years = useMemo(() => {
    const arr: number[] = []
    for (let y = minYear; y <= maxYear; y++) arr.push(y)
    return arr
  }, [minYear, maxYear])

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10)
      onYearChange([Math.min(val, selectedYears[1]), selectedYears[1]])
    },
    [onYearChange, selectedYears]
  )

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10)
      onYearChange([selectedYears[0], Math.max(val, selectedYears[0])])
    },
    [onYearChange, selectedYears]
  )

  const nextSpeed = useCallback(() => {
    const idx = SPEED_OPTIONS.indexOf(speed)
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]
    onSpeedChange(next)
  }, [speed, onSpeedChange])

  return (
    <div className="timeline">
      {progress > 0 && (
        <div className="timeline-progress" style={{ width: `${progress * 100}%` }} />
      )}

      <div className="timeline-header">
        <div className="timeline-controls">
          <button
            className="timeline-btn timeline-play-btn"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="1" y="1" width="4" height="12" rx="1" />
                <rect x="9" y="1" width="4" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M2 1.5v11l10-5.5z" />
              </svg>
            )}
          </button>
          <button className="timeline-btn" onClick={onReset} title="Reset">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="10" height="10" rx="2" />
            </svg>
          </button>
          <button className="timeline-btn timeline-speed-btn" onClick={nextSpeed} title="Speed">
            {speed}x
          </button>
        </div>

        <span className="timeline-label">
          {currentYear ? (
            <span className="timeline-current-year">{currentYear}</span>
          ) : (
            'TIMELINE'
          )}
        </span>

        <span className="timeline-range">
          {selectedYears[0]} — {selectedYears[1]}
        </span>
      </div>

      <div className="timeline-bars">
        {years.map((year) => {
          const s = yearStats[year] ?? { success: 0, failure: 0, other: 0 }
          const total = s.success + s.failure + s.other
          const successH = (s.success / maxCount) * 100
          const failureH = (s.failure / maxCount) * 100
          const otherH = (s.other / maxCount) * 100
          const isActive = year >= selectedYears[0] && year <= selectedYears[1]
          const isCurrent = currentYear === year

          return (
            <div key={year} className={`timeline-bar-wrapper ${isCurrent ? 'current' : ''}`}>
              <div className={`timeline-bar-stack ${isActive ? '' : 'inactive'}`}>
                {s.other > 0 && (
                  <div
                    className="bar-segment bar-other"
                    style={{ height: `${Math.max(1, otherH)}%` }}
                  />
                )}
                {s.failure > 0 && (
                  <div
                    className="bar-segment bar-failure"
                    style={{ height: `${Math.max(1, failureH)}%` }}
                  />
                )}
                <div
                  className="bar-segment bar-success"
                  style={{ height: `${Math.max(total > 0 ? 2 : 1, successH)}%` }}
                />
              </div>
              <span className="timeline-year-label">
                {year % 2 === 0 ? `'${String(year).slice(2)}` : ''}
              </span>
            </div>
          )
        })}
      </div>

      <div className="timeline-sliders">
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={selectedYears[0]}
          onChange={handleMinChange}
          className="timeline-slider"
          disabled={isPlaying}
        />
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={selectedYears[1]}
          onChange={handleMaxChange}
          className="timeline-slider"
          disabled={isPlaying}
        />
      </div>
    </div>
  )
}

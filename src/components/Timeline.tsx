import { useCallback, useMemo } from 'react'
import type { Launch } from '../api/spacex'

interface TimelineProps {
  yearRange: [number, number]
  selectedYears: [number, number]
  onYearChange: (range: [number, number]) => void
  launches: Launch[]
}

export function Timeline({
  yearRange,
  selectedYears,
  onYearChange,
  launches,
}: TimelineProps) {
  const [minYear, maxYear] = yearRange

  const launchCountByYear = useMemo(() => {
    const counts: Record<number, number> = {}
    for (let y = minYear; y <= maxYear; y++) counts[y] = 0
    launches
      .filter((l) => !l.upcoming)
      .forEach((l) => {
        const year = new Date(l.date_utc).getFullYear()
        if (counts[year] !== undefined) counts[year]++
      })
    return counts
  }, [launches, minYear, maxYear])

  const maxCount = useMemo(
    () => Math.max(1, ...Object.values(launchCountByYear)),
    [launchCountByYear]
  )

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

  return (
    <div className="timeline">
      <div className="timeline-header">
        <span className="timeline-label">TIMELINE</span>
        <span className="timeline-range">
          {selectedYears[0]} — {selectedYears[1]}
        </span>
      </div>

      <div className="timeline-bars">
        {years.map((year) => {
          const count = launchCountByYear[year] ?? 0
          const height = (count / maxCount) * 100
          const isActive = year >= selectedYears[0] && year <= selectedYears[1]
          return (
            <div key={year} className="timeline-bar-wrapper">
              <div
                className={`timeline-bar ${isActive ? 'active' : 'inactive'}`}
                style={{ height: `${Math.max(2, height)}%` }}
                title={`${year}: ${count} launches`}
              />
              {year % 2 === 0 && (
                <span className="timeline-year-label">{String(year).slice(2)}</span>
              )}
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
        />
        <input
          type="range"
          min={minYear}
          max={maxYear}
          value={selectedYears[1]}
          onChange={handleMaxChange}
          className="timeline-slider"
        />
      </div>
    </div>
  )
}

import type { ArcData } from '../utils/globe'
import { ROCKET_COLOR_MAP } from '../utils/globe'

interface NowPlayingHudProps {
  arc: ArcData | null
  index: number
  total: number
}

export function NowPlayingHud({ arc, index, total }: NowPlayingHudProps) {
  if (!arc) return null

  const date = new Date(arc.launch.date_utc)
  const dateStr = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const rocketColor = ROCKET_COLOR_MAP[arc.rocketName] ?? '#00d4ff'
  const isSuccess = arc.launch.success === true
  const isFailed = arc.launch.success === false

  return (
    <div className="now-playing" key={arc.id}>
      <div className="np-indicator">
        <span className="np-pulse" />
        <span className="np-live">LIVE REPLAY</span>
        <span className="np-count">
          {index + 1} / {total}
        </span>
      </div>
      <div className="np-main">
        {arc.launch.links.patch.small && (
          <img
            src={arc.launch.links.patch.small}
            alt=""
            className="np-patch"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        <div className="np-info">
          <div className="np-name">{arc.launch.name}</div>
          <div className="np-meta">
            <span className="np-date">{dateStr}</span>
            <span className="np-dot" style={{ background: rocketColor }} />
            <span style={{ color: rocketColor }}>{arc.rocketName}</span>
            {isSuccess && <span className="np-status np-success">OK</span>}
            {isFailed && <span className="np-status np-fail">FAIL</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

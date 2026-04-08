import type { ArcData } from '../utils/globe'
import { ROCKET_COLOR_MAP } from '../utils/globe'

interface LaunchPanelProps {
  arc: ArcData | null
  onClose: () => void
}

export function LaunchPanel({ arc, onClose }: LaunchPanelProps) {
  if (!arc) return null

  const { launch, rocketName, launchpadName } = arc
  const date = new Date(launch.date_utc)
  const dateStr = date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeStr = date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const isSuccess = launch.success === true
  const isFailed = launch.success === false
  const rocketColor = ROCKET_COLOR_MAP[rocketName] ?? '#00d4ff'

  return (
    <div className="launch-panel" onClick={(e) => e.stopPropagation()}>
      <button className="panel-close" onClick={onClose}>
        &times;
      </button>

      {launch.links.patch.small && (
        <div className="panel-patch">
          <img
            src={launch.links.patch.small}
            alt={`${launch.name} mission patch`}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}

      <h2 className="panel-title">{launch.name}</h2>

      <div className="panel-status">
        {isSuccess && <span className="badge badge-success">SUCCESS</span>}
        {isFailed && <span className="badge badge-failure">FAILURE</span>}
        {launch.success === null && <span className="badge badge-pending">N/A</span>}
        <span className="badge" style={{ borderColor: rocketColor, color: rocketColor }}>
          {rocketName}
        </span>
      </div>

      <div className="panel-meta">
        <div className="meta-row">
          <span className="meta-label">Flight #</span>
          <span className="meta-value">{launch.flight_number}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Date</span>
          <span className="meta-value">{dateStr} {timeStr} UTC</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Launch Site</span>
          <span className="meta-value">{launchpadName}</span>
        </div>
      </div>

      {launch.details && (
        <p className="panel-details">{launch.details}</p>
      )}

      {isFailed && launch.failures.length > 0 && (
        <div className="panel-failure">
          <strong>Failure:</strong>{' '}
          {launch.failures.map((f) => f.reason).join(', ')}
        </div>
      )}

      <div className="panel-links">
        {launch.links.webcast && (
          <a
            href={launch.links.webcast}
            target="_blank"
            rel="noopener noreferrer"
            className="panel-link"
          >
            YouTube
          </a>
        )}
        {launch.links.wikipedia && (
          <a
            href={launch.links.wikipedia}
            target="_blank"
            rel="noopener noreferrer"
            className="panel-link"
          >
            Wikipedia
          </a>
        )}
      </div>
    </div>
  )
}

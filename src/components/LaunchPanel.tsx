import { useState } from 'react'
import type { ArcData } from '../utils/globe'
import { ROCKET_COLOR_MAP } from '../utils/globe'

interface LaunchPanelProps {
  arc: ArcData | null
  onClose: () => void
}

export function LaunchPanel({ arc, onClose }: LaunchPanelProps) {
  const [imgIdx, setImgIdx] = useState(0)

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
  const flickrImages = launch.links.flickr.original

  return (
    <div className="launch-panel" onClick={(e) => e.stopPropagation()}>
      <button className="panel-close" onClick={onClose} aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>

      {flickrImages.length > 0 ? (
        <div className="panel-gallery">
          <img
            src={flickrImages[imgIdx % flickrImages.length]}
            alt={`${launch.name} photo`}
            className="panel-gallery-img"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          {flickrImages.length > 1 && (
            <div className="panel-gallery-dots">
              {flickrImages.map((_, i) => (
                <button
                  key={i}
                  className={`gallery-dot ${i === imgIdx % flickrImages.length ? 'active' : ''}`}
                  onClick={() => setImgIdx(i)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        launch.links.patch.small && (
          <div className="panel-patch">
            <img
              src={launch.links.patch.small}
              alt={`${launch.name} mission patch`}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
          </div>
        )
      )}

      <div className="panel-header-row">
        <span className="panel-flight-num">#{launch.flight_number}</span>
        <h2 className="panel-title">{launch.name}</h2>
      </div>

      <div className="panel-status">
        {isSuccess && <span className="badge badge-success">SUCCESS</span>}
        {isFailed && <span className="badge badge-failure">FAILURE</span>}
        {launch.success === null && (
          <span className="badge badge-pending">N/A</span>
        )}
        <span
          className="badge badge-rocket"
          style={{ borderColor: rocketColor, color: rocketColor }}
        >
          {rocketName}
        </span>
      </div>

      <div className="panel-meta">
        <div className="meta-row">
          <span className="meta-label">Date</span>
          <span className="meta-value">
            {dateStr} {timeStr}
          </span>
        </div>
        <div className="meta-row">
          <span className="meta-label">Site</span>
          <span className="meta-value">{launchpadName}</span>
        </div>
      </div>

      {launch.details && <p className="panel-details">{launch.details}</p>}

      {isFailed && launch.failures.length > 0 && (
        <div className="panel-failure">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="7" cy="7" r="6" />
            <path d="M7 4v3M7 9h.01" />
          </svg>
          <span>{launch.failures.map((f) => f.reason).join(', ')}</span>
        </div>
      )}

      <div className="panel-links">
        {launch.links.webcast && (
          <a
            href={launch.links.webcast}
            target="_blank"
            rel="noopener noreferrer"
            className="panel-link panel-link-yt"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.7 31.7 0 0 0 0 12a31.7 31.7 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.7 31.7 0 0 0 24 12a31.7 31.7 0 0 0-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
            </svg>
            Watch
          </a>
        )}
        {launch.links.wikipedia && (
          <a
            href={launch.links.wikipedia}
            target="_blank"
            rel="noopener noreferrer"
            className="panel-link"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.09 13.12c-.15-.3-.87-1.9-2.16-4.8l-.03-.07a26 26 0 0 0-.6-1.2c-.3-.53-.72-1.05-1.27-1.05-.36 0-.6.15-.63.45v.12l.3.73 2.4 5.6c.2.42.36.63.5.63.15 0 .33-.22.53-.65l2.19-4.98.01-.02c.34-.72.51-1.2.51-1.42 0-.3-.17-.46-.52-.46-.2 0-.4.12-.58.37a5 5 0 0 0-.42.82l-.23.52z" />
              <path d="M21.5 2H2.5A.5.5 0 0 0 2 2.5v19a.5.5 0 0 0 .5.5h19a.5.5 0 0 0 .5-.5v-19a.5.5 0 0 0-.5-.5zM12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
            </svg>
            Wiki
          </a>
        )}
      </div>
    </div>
  )
}

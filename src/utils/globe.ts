import type { Launch, Launchpad, Rocket } from '../api/spacex'

export interface ArcData {
  id: string
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: [string, string]
  altitude: number
  stroke: number
  launch: Launch
  rocketName: string
  launchpadName: string
}

export interface PointData {
  id: string
  lat: number
  lng: number
  name: string
  fullName: string
  size: number
  color: string
  launchpad: Launchpad
}

export interface RingData {
  lat: number
  lng: number
  maxRadius: number
  propagationSpeed: number
  repeatPeriod: number
  color: string
}

const ROCKET_COLORS: Record<string, [string, string]> = {
  '5e9d0d95eda69955f709d1eb': ['#ff8c00', '#ff4500'],   // Falcon 1 - orange
  '5e9d0d95eda69973a809d1ec': ['#00d4ff', '#0088ff'],   // Falcon 9 - cyan
  '5e9d0d95eda69974db09d1ed': ['#a855f7', '#7c3aed'],   // Falcon Heavy - purple
  '5e9d0d96eda699382d09d1ee': ['#fbbf24', '#f59e0b'],   // Starship - gold
}

const FAILURE_COLORS: [string, string] = ['#ff4444', '#cc0000']

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

function calculateDestination(
  lat: number,
  lng: number,
  flightNumber: number
): { lat: number; lng: number } {
  const rand1 = seededRandom(flightNumber)
  const rand2 = seededRandom(flightNumber + 1000)

  const angle = rand1 * Math.PI * 2
  const distance = 15 + rand2 * 25

  const endLat = Math.max(-80, Math.min(80, lat + Math.sin(angle) * distance * 0.5))
  const endLng = lng + Math.cos(angle) * distance + 10

  return { lat: endLat, lng: endLng }
}

export function buildArcData(
  launches: Launch[],
  launchpads: Launchpad[],
  rockets: Rocket[]
): ArcData[] {
  const padMap = new Map(launchpads.map((p) => [p.id, p]))
  const rocketMap = new Map(rockets.map((r) => [r.id, r]))

  return launches
    .filter((l) => !l.upcoming)
    .map((launch) => {
      const pad = padMap.get(launch.launchpad)
      const rocket = rocketMap.get(launch.rocket)
      if (!pad) return null

      const dest = calculateDestination(pad.latitude, pad.longitude, launch.flight_number)
      const isFailure = launch.success === false
      const colors = isFailure
        ? FAILURE_COLORS
        : ROCKET_COLORS[launch.rocket] ?? ['#00d4ff', '#0088ff']

      const baseAltitude = rocket?.name === 'Falcon Heavy' ? 0.6 : rocket?.name === 'Starship' ? 0.8 : 0.3
      const altitude = baseAltitude + seededRandom(launch.flight_number + 500) * 0.3

      return {
        id: launch.id,
        startLat: pad.latitude,
        startLng: pad.longitude,
        endLat: dest.lat,
        endLng: dest.lng,
        color: colors,
        altitude,
        stroke: isFailure ? 0.3 : 0.5,
        launch,
        rocketName: rocket?.name ?? 'Unknown',
        launchpadName: pad.name,
      }
    })
    .filter((d): d is ArcData => d !== null)
}

export function buildPointData(launchpads: Launchpad[]): PointData[] {
  return launchpads.map((pad) => ({
    id: pad.id,
    lat: pad.latitude,
    lng: pad.longitude,
    name: pad.name,
    fullName: pad.full_name,
    size: Math.max(0.4, Math.min(1.2, pad.launch_attempts / 40)),
    color: pad.status === 'active' ? '#00ff88' : '#666666',
    launchpad: pad,
  }))
}

export function buildRingData(launchpads: Launchpad[]): RingData[] {
  return launchpads
    .filter((pad) => pad.status === 'active')
    .map((pad) => ({
      lat: pad.latitude,
      lng: pad.longitude,
      maxRadius: 3,
      propagationSpeed: 2,
      repeatPeriod: 1200,
      color: '#00ff8844',
    }))
}

export function getYearRange(launches: Launch[]): [number, number] {
  const years = launches
    .filter((l) => !l.upcoming)
    .map((l) => new Date(l.date_utc).getFullYear())
  return [Math.min(...years), Math.max(...years)]
}

export function getRocketColor(rocketId: string): string {
  return ROCKET_COLORS[rocketId]?.[0] ?? '#00d4ff'
}

export const ROCKET_COLOR_MAP: Record<string, string> = {
  'Falcon 1': '#ff8c00',
  'Falcon 9': '#00d4ff',
  'Falcon Heavy': '#a855f7',
  'Starship': '#fbbf24',
}

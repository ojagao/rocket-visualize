const BASE_URL = 'https://api.spacexdata.com/v4'

export interface Launch {
  id: string
  name: string
  date_utc: string
  date_unix: number
  success: boolean | null
  failures: { time: number; altitude: number | null; reason: string }[]
  rocket: string
  launchpad: string
  details: string | null
  links: {
    patch: { small: string | null; large: string | null }
    webcast: string | null
    flickr: { small: string[]; original: string[] }
    wikipedia: string | null
  }
  flight_number: number
  upcoming: boolean
}

export interface Launchpad {
  id: string
  name: string
  full_name: string
  locality: string
  region: string
  latitude: number
  longitude: number
  launch_attempts: number
  launch_successes: number
  status: string
  launches: string[]
}

export interface Rocket {
  id: string
  name: string
  type: string
  description: string
  active: boolean
  stages: number
  cost_per_launch: number
  success_rate_pct: number
  first_flight: string
  flickr_images: string[]
  height: { meters: number; feet: number }
  diameter: { meters: number; feet: number }
  mass: { kg: number; lb: number }
}

export async function fetchLaunches(): Promise<Launch[]> {
  const res = await fetch(`${BASE_URL}/launches`)
  if (!res.ok) throw new Error(`Failed to fetch launches: ${res.status}`)
  return res.json()
}

export async function fetchLaunchpads(): Promise<Launchpad[]> {
  const res = await fetch(`${BASE_URL}/launchpads`)
  if (!res.ok) throw new Error(`Failed to fetch launchpads: ${res.status}`)
  return res.json()
}

export async function fetchRockets(): Promise<Rocket[]> {
  const res = await fetch(`${BASE_URL}/rockets`)
  if (!res.ok) throw new Error(`Failed to fetch rockets: ${res.status}`)
  return res.json()
}

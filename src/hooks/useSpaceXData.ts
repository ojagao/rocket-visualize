import { useState, useEffect, useMemo } from 'react'
import type { Launch, Launchpad, Rocket } from '../api/spacex'
import { fetchLaunches, fetchLaunchpads, fetchRockets } from '../api/spacex'
import { buildArcData, buildPointData, buildRingData, getYearRange } from '../utils/globe'
import type { ArcData } from '../utils/globe'

interface SpaceXData {
  launches: Launch[]
  launchpads: Launchpad[]
  rockets: Rocket[]
  arcData: ArcData[]
  filteredArcData: ArcData[]
  pointData: ReturnType<typeof buildPointData>
  ringData: ReturnType<typeof buildRingData>
  yearRange: [number, number]
  selectedYears: [number, number]
  setSelectedYears: (range: [number, number]) => void
  selectedRockets: Set<string>
  toggleRocket: (rocketId: string) => void
  loading: boolean
  error: string | null
}

export function useSpaceXData(): SpaceXData {
  const [launches, setLaunches] = useState<Launch[]>([])
  const [launchpads, setLaunchpads] = useState<Launchpad[]>([])
  const [rockets, setRockets] = useState<Rocket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYears, setSelectedYears] = useState<[number, number]>([2006, 2025])
  const [selectedRockets, setSelectedRockets] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      try {
        const [l, p, r] = await Promise.all([
          fetchLaunches(),
          fetchLaunchpads(),
          fetchRockets(),
        ])
        setLaunches(l)
        setLaunchpads(p)
        setRockets(r)

        const range = getYearRange(l)
        setSelectedYears(range)
        setSelectedRockets(new Set(r.map((rocket) => rocket.id)))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const yearRange = useMemo(() => {
    if (launches.length === 0) return [2006, 2025] as [number, number]
    return getYearRange(launches)
  }, [launches])

  const arcData = useMemo(
    () => buildArcData(launches, launchpads, rockets),
    [launches, launchpads, rockets]
  )

  const filteredArcData = useMemo(() => {
    return arcData.filter((arc) => {
      const year = new Date(arc.launch.date_utc).getFullYear()
      const inYearRange = year >= selectedYears[0] && year <= selectedYears[1]
      const rocketSelected = selectedRockets.has(arc.launch.rocket)
      return inYearRange && rocketSelected
    })
  }, [arcData, selectedYears, selectedRockets])

  const pointData = useMemo(() => buildPointData(launchpads), [launchpads])
  const ringData = useMemo(() => buildRingData(launchpads), [launchpads])

  const toggleRocket = (rocketId: string) => {
    setSelectedRockets((prev) => {
      const next = new Set(prev)
      if (next.has(rocketId)) {
        next.delete(rocketId)
      } else {
        next.add(rocketId)
      }
      return next
    })
  }

  return {
    launches,
    launchpads,
    rockets,
    arcData,
    filteredArcData,
    pointData,
    ringData,
    yearRange,
    selectedYears,
    setSelectedYears,
    selectedRockets,
    toggleRocket,
    loading,
    error,
  }
}

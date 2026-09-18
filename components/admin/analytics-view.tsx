'use client'

import React, { useState, useMemo } from 'react'
import {
  Clock,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { AttendanceRecord, Student, HubSettingData, STANDARD_TRACKS } from './types'

interface AnalyticsViewProps {
  records: AttendanceRecord[]
  students: Student[]
  setting?: HubSettingData
}

function extractHourFromRecord(record: AttendanceRecord): number | null {
  if (record.checkInTime) {
    const match = record.checkInTime.match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i)
    if (match) {
      let hour = parseInt(match[1], 10)
      const ampm = match[3]?.toUpperCase()
      if (ampm === 'PM' && hour < 12) hour += 12
      if (ampm === 'AM' && hour === 12) hour = 0
      return hour
    }
  }
  if (record.timestamp) {
    const d = new Date(record.timestamp)
    if (!isNaN(d.getTime())) return d.getHours()
  }
  return null
}

function formatHourRange(startHour: number): string {
  const formatH = (h: number) => {
    const period = h >= 12 ? 'PM' : 'AM'
    const displayH = h % 12 === 0 ? 12 : h % 12
    return `${displayH < 10 ? '0' : ''}${displayH}:00 ${period}`
  }
  return `${formatH(startHour)} - ${formatH(startHour + 1)}`
}

export function AnalyticsView({ records, students, setting }: AnalyticsViewProps) {
  const [filterMode, setFilterMode] = useState<'today' | 'all'>('today')

  // Compute today's date in Lagos format (YYYY-MM-DD)
  const todayLagosDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date())
    } catch {
      return new Date().toISOString().slice(0, 10)
    }
  }, [])

  // Filter records based on selected time window
  const activeRecords = useMemo(() => {
    if (filterMode === 'today') {
      const todayMatches = records.filter((r) => r.date === todayLagosDate)
      // If no records have exact date match, check for today in timestamp
      if (todayMatches.length === 0) {
        const todayAlt = records.filter((r) => r.timestamp?.startsWith(todayLagosDate))
        if (todayAlt.length > 0) return todayAlt
      }
      return todayMatches
    }
    return records
  }, [records, filterMode, todayLagosDate])

  // Operational hours configuration
  const openHour = setting?.openHour ?? 9
  const closeHour = setting?.closeHour ?? 18

  // Generate dynamic hourly buckets based on operating hours (with minimum span)
  const hourlyData = useMemo(() => {
    const startHour = Math.max(7, openHour - 1)
    const endHour = Math.max(startHour + 4, closeHour)

    const buckets: { hour: string; startH: number; count: number; status: string }[] = []

    for (let h = startHour; h < endHour; h++) {
      const rangeLabel = formatHourRange(h)
      const count = activeRecords.filter((r) => {
        const rHour = extractHourFromRecord(r)
        return rHour === h
      }).length

      buckets.push({
        hour: rangeLabel,
        startH: h,
        count,
        status: '',
      })
    }

    // Find the bucket with the highest traffic
    const maxCount = Math.max(0, ...buckets.map((b) => b.count))

    return buckets.map((b) => {
      let status = 'Standard window'
      if (b.startH < openHour) {
        status = 'Early arrivals'
      } else if (maxCount > 0 && b.count === maxCount) {
        status = 'Peak check-in window'
      } else if (b.startH === openHour) {
        status = 'Opening check-in window'
      } else if (b.startH >= openHour + 1 && b.startH <= openHour + 2) {
        status = 'Late arrivals'
      } else if (b.startH >= 12) {
        status = 'Afternoon log'
      }

      return {
        ...b,
        status,
      }
    })
  }, [activeRecords, openHour, closeHour])

  const peak = Math.max(1, ...hourlyData.map((item) => item.count))

  // Compute track turnout dynamically with deduplicated unique attendees
  const trackData = useMemo(() => {
    // Gather all distinct tracks from students, standard tracks, and active records
    const allTracksSet = new Set<string>()
    students.forEach((s) => {
      if (s.track && s.track.trim()) allTracksSet.add(s.track.trim())
    })
    STANDARD_TRACKS.forEach((t) => allTracksSet.add(t))
    activeRecords.forEach((r) => {
      if (r.track && r.track.trim()) allTracksSet.add(r.track.trim())
    })

    const results: {
      track: string
      enrolled: number
      attended: number
      uniqueAttendees: number
      rateNumber: number
      rate: string
      count: string
    }[] = []

    allTracksSet.forEach((trackName) => {
      const enrolledStudents = students.filter(
        (s) => s.track?.trim().toLowerCase() === trackName.toLowerCase()
      )
      const enrolled = enrolledStudents.length

      const trackRecords = activeRecords.filter(
        (r) => r.track?.trim().toLowerCase() === trackName.toLowerCase()
      )
      const attended = trackRecords.length

      // Count distinct individuals who checked in
      const uniqueAttendeeIdentifiers = new Set(
        trackRecords.map((r) => (r.identifier || r.name).toLowerCase())
      )
      const uniqueAttendees = uniqueAttendeeIdentifiers.size

      // If no registered students and no check-ins, skip to avoid empty noise
      if (enrolled === 0 && attended === 0) return

      let rateNumber = 0
      if (enrolled > 0) {
        rateNumber = Math.min(100, Math.round((uniqueAttendees / enrolled) * 100))
      } else if (attended > 0) {
        rateNumber = 100
      }

      results.push({
        track: trackName,
        enrolled,
        attended,
        uniqueAttendees,
        rateNumber,
        rate: `${rateNumber}%`,
        count: `${uniqueAttendees} checked in / ${enrolled} registered`,
      })
    })

    // Sort by highest turnout rate and attendee count
    return results.sort((a, b) => b.rateNumber - a.rateNumber || b.uniqueAttendees - a.uniqueAttendees)
  }, [students, activeRecords])

  return (
    <div className="space-y-4">
      {/* Time Window Selector Bar */}
      <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-purple-600" />
          <span>Analytics Time Window:</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setFilterMode('today')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterMode === 'today'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today ({activeRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All-Time ({records.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Hourly Distribution Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">
                Hourly Arrival Distribution
              </h3>
              <p className="text-xs text-slate-500">
                {filterMode === 'today' ? "Today's traffic pattern" : "Cumulative traffic pattern"} across operational window
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-3.5 pt-1 max-h-[480px] overflow-y-auto pr-1">
            {hourlyData.map((item) => (
              <div key={item.hour} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-semibold">{item.hour}</span>
                    <span className={`text-[10px] ${item.status.includes('Peak') ? 'text-purple-600 font-bold' : 'text-slate-400'}`}>
                      ({item.status})
                    </span>
                  </div>
                  <span className="text-purple-700 font-bold">{item.count} arrivals</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.count ? Math.max(6, Math.round((item.count / peak) * 100)) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Tracks Participation Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">
                Track Attendance & Turnout
              </h3>
              <p className="text-xs text-slate-500">
                {filterMode === 'today' ? "Real-time today's turnout" : 'Overall attendance rates'} across learning tracks
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-3 pt-1 max-h-[480px] overflow-y-auto pr-1">
            {trackData.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">No participant or check-in data yet.</p>
            ) : (
              trackData.map((track) => {
                let badgeStyle = 'text-slate-600 bg-slate-50 border-slate-200'
                if (track.rateNumber === 100) {
                  badgeStyle = 'text-emerald-700 bg-emerald-50 border-emerald-200'
                } else if (track.rateNumber >= 50) {
                  badgeStyle = 'text-purple-700 bg-purple-50 border-purple-200'
                } else if (track.rateNumber > 0) {
                  badgeStyle = 'text-indigo-700 bg-indigo-50 border-indigo-200'
                }

                return (
                  <div
                    key={track.track}
                    className="p-3.5 bg-slate-50/80 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 transition-colors flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{track.track}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{track.count}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border shadow-2xs ${badgeStyle}`}>
                      {track.rate} Turnout
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


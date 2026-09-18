'use client'

import React from 'react'
import {
  Clock,
  BookOpen,
} from 'lucide-react'
import { AttendanceRecord, Student } from './types'

export function AnalyticsView({ records, students }: { records: AttendanceRecord[]; students: Student[] }) {
  const buckets = ['08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM']
  const hourlyData = buckets.map((hour, index) => ({ hour, status: index === 0 ? 'Early arrivals' : index === 1 ? 'Peak check-in window' : index === 2 ? 'Late arrivals' : 'Exception log', count: records.filter((record) => { const value = new Date(`1970-01-01 ${record.checkInTime}`).getHours(); return value === index + 8 }).length }))
  const peak = Math.max(1, ...hourlyData.map((item) => item.count))
  const trackData = Object.entries(students.reduce<Record<string, { enrolled: number; attended: number }>>((all, student) => { const item = all[student.track] ?? { enrolled: 0, attended: 0 }; item.enrolled++; item.attended = records.filter((record) => record.track === student.track).length; all[student.track] = item; return all }, {})).map(([track, data]) => ({ track, rate: `${data.enrolled ? Math.min(100, Math.round(data.attended / data.enrolled * 100)) : 0}%`, count: `${data.attended} check-ins / ${data.enrolled} registered` }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Hourly Distribution Card */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">
                Hourly Arrival Distribution
              </h3>
              <p className="text-xs text-slate-500">Check-in traffic pattern throughout the operational window</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {hourlyData.map((item) => (
              <div key={item.hour} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-semibold">{item.hour}</span>
                    <span className="text-[10px] text-slate-400">({item.status})</span>
                  </div>
                  <span className="text-purple-700 font-bold">{item.count} arrivals</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(item.count / peak * 100)}%` }}
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
              <p className="text-xs text-slate-500">Real-time attendance rates across Blue House learning tracks</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {trackData.length === 0 ? <p className="py-6 text-center text-xs text-slate-400">No participant data yet.</p> : trackData.map((track) => (
              <div
                key={track.track}
                className="p-3.5 bg-slate-50/80 hover:bg-purple-50/50 rounded-xl border border-slate-200/80 transition-colors flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{track.track}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{track.count}</p>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-2xs">
                  {track.rate} Turnout
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

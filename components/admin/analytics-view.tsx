'use client'

import React from 'react'
import {
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  Users,
  CheckCircle,
} from 'lucide-react'

export function AnalyticsView() {
  const hourlyData = [
    { hour: '08:00 AM - 09:00 AM', count: 14, percent: 40, status: 'Early Arrivals' },
    { hour: '09:00 AM - 10:00 AM', count: 28, percent: 85, status: 'Peak Check-in Window' },
    { hour: '10:00 AM - 11:00 AM', count: 8, percent: 25, status: 'Late Arrivals' },
    { hour: '11:00 AM - 12:00 PM', count: 4, percent: 12, status: 'Exception Log' },
  ]

  const trackData = [
    {
      track: 'Full-Stack Web Development',
      rate: '94%',
      count: '28 Students',
      color: 'from-purple-500 to-indigo-500',
    },
    {
      track: 'Data Science & Artificial Intelligence',
      rate: '89%',
      count: '22 Students',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      track: 'UI/UX & Product Design',
      rate: '96%',
      count: '18 Students',
      color: 'from-pink-500 to-rose-500',
    },
    {
      track: 'Cybersecurity & Cloud Infrastructure',
      rate: '88%',
      count: '16 Students',
      color: 'from-emerald-500 to-teal-500',
    },
  ]

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
                    style={{ width: `${item.percent}%` }}
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
            {trackData.map((track) => (
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

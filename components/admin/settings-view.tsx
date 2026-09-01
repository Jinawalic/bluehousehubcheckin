'use client'

import React from 'react'
import { MapPin, Sliders, CheckCircle, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface SettingsViewProps {
  geofenceRadius: string
  setGeofenceRadius: (radius: string) => void
}

export function SettingsView({ geofenceRadius, setGeofenceRadius }: SettingsViewProps) {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Geofence parameters saved', {
      description: `Active tolerance radius set to ${geofenceRadius} meters.`,
    })
  }

  return (
    <div className="bg-white p-5 sm:p-7 lg:p-8 rounded-2xl border border-slate-200/80 shadow-xs max-w-3xl space-y-6">
      <div>
        <h2 className="font-serif font-bold text-xl text-slate-900 leading-tight">
          Hub Geofence & Operational Parameters
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure physical geolocation verification anchor and check-in window tolerances for Blue House Hub.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* GPS Anchor Coordinates */}
        <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-slate-900">
            <MapPin className="w-4 h-4 text-purple-600" />
            <span>Blue House Hub Primary GPS Anchor</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono">
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">
                Latitude Coordinate
              </span>
              <span className="font-bold text-slate-900 text-sm">9.88452647721506</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono">
              <span className="text-slate-400 block text-[10px] uppercase font-sans font-semibold">
                Longitude Coordinate
              </span>
              <span className="font-bold text-slate-900 text-sm">8.876546119960212</span>
            </div>
          </div>
        </div>

        {/* Radius Range Slider */}
        <div className="space-y-3 p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-900">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              <span>Allowable Verification Radius</span>
            </div>
            <span className="text-purple-700 font-bold bg-white px-2.5 py-0.5 rounded-lg border border-purple-200 text-sm">
              {geofenceRadius} meters
            </span>
          </div>

          <input
            type="range"
            min="20"
            max="500"
            step="10"
            value={geofenceRadius}
            onChange={(e) => setGeofenceRadius(e.target.value)}
            className="w-full accent-purple-600 cursor-pointer h-2 bg-purple-200 rounded-lg"
          />

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Participants attempting check-in further than <strong>{geofenceRadius}m</strong> from the Hub center will receive a geolocation proximity alert.
          </p>
        </div>

        {/* Operating Window Status */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
              Daily Attendance Window
            </h4>
            <p className="text-[11px] text-slate-500">
              09:00 AM – 06:00 PM (Lagos West Africa Time / GMT+1)
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            Active Window
          </span>
        </div>

        {/* Save Button */}
        <div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            Save Geofence Parameters
          </button>
        </div>
      </form>
    </div>
  )
}

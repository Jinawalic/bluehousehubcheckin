'use client'

import React, { useState, useEffect } from 'react'
import { MapPin, Sliders, Clock, Navigation, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { HubSettingData, DEFAULT_HUB_SETTINGS } from './types'

interface SettingsViewProps {
  setting: HubSettingData
  onSave: (updated: Partial<HubSettingData>) => Promise<boolean>
}

const HOURS_OPTIONS = [
  { value: 6, label: '06:00 AM' },
  { value: 7, label: '07:00 AM' },
  { value: 8, label: '08:00 AM' },
  { value: 9, label: '09:00 AM' },
  { value: 10, label: '10:00 AM' },
  { value: 11, label: '11:00 AM' },
  { value: 12, label: '12:00 PM' },
  { value: 13, label: '01:00 PM' },
  { value: 14, label: '02:00 PM' },
  { value: 15, label: '03:00 PM' },
  { value: 16, label: '04:00 PM' },
  { value: 17, label: '05:00 PM' },
  { value: 18, label: '06:00 PM' },
  { value: 19, label: '07:00 PM' },
  { value: 20, label: '08:00 PM' },
  { value: 21, label: '09:00 PM' },
]

export function SettingsView({ setting, onSave }: SettingsViewProps) {
  const [latitude, setLatitude] = useState(String(setting?.latitude ?? DEFAULT_HUB_SETTINGS.latitude))
  const [longitude, setLongitude] = useState(String(setting?.longitude ?? DEFAULT_HUB_SETTINGS.longitude))
  const [geofenceRadius, setGeofenceRadius] = useState(String(setting?.geofenceRadius ?? DEFAULT_HUB_SETTINGS.geofenceRadius))
  const [openHour, setOpenHour] = useState<number>(setting?.openHour ?? DEFAULT_HUB_SETTINGS.openHour)
  const [closeHour, setCloseHour] = useState<number>(setting?.closeHour ?? DEFAULT_HUB_SETTINGS.closeHour)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentLagosHour, setCurrentLagosHour] = useState<number>(9)
  const [currentLagosTimeStr, setCurrentLagosTimeStr] = useState<string>('')

  useEffect(() => {
    if (setting) {
      setLatitude(String(setting.latitude ?? DEFAULT_HUB_SETTINGS.latitude))
      setLongitude(String(setting.longitude ?? DEFAULT_HUB_SETTINGS.longitude))
      setGeofenceRadius(String(setting.geofenceRadius ?? DEFAULT_HUB_SETTINGS.geofenceRadius))
      setOpenHour(setting.openHour ?? DEFAULT_HUB_SETTINGS.openHour)
      setCloseHour(setting.closeHour ?? DEFAULT_HUB_SETTINGS.closeHour)
    }
  }, [setting])

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date()
        const parts = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Africa/Lagos',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).formatToParts(now)
        const hourPart = parts.find((p) => p.type === 'hour')?.value ?? '9'
        setCurrentLagosHour(parseInt(hourPart, 10))

        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: 'Africa/Lagos',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(now)
        setCurrentLagosTimeStr(formatted)
      } catch {
        setCurrentLagosHour(new Date().getHours())
      }
    }
    updateTime()
    const timer = setInterval(updateTime, 10000)
    return () => clearInterval(timer)
  }, [])

  const isWindowActive = currentLagosHour >= openHour && currentLagosHour < closeHour

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setIsDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false)
        setLatitude(pos.coords.latitude.toFixed(14))
        setLongitude(pos.coords.longitude.toFixed(14))
        toast.success('Coordinates detected from current device location')
      },
      (err) => {
        setIsDetectingLocation(false)
        toast.error(`Unable to retrieve GPS: ${err.message}`)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleResetDefaults = () => {
    setLatitude(String(DEFAULT_HUB_SETTINGS.latitude))
    setLongitude(String(DEFAULT_HUB_SETTINGS.longitude))
    setGeofenceRadius(String(DEFAULT_HUB_SETTINGS.geofenceRadius))
    setOpenHour(DEFAULT_HUB_SETTINGS.openHour)
    setCloseHour(DEFAULT_HUB_SETTINGS.closeHour)
    toast.info('Reset fields to standard hub defaults (remember to save)')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const latNum = parseFloat(latitude)
    const lngNum = parseFloat(longitude)
    const radiusNum = parseInt(geofenceRadius, 10)

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      toast.error('Please enter a valid Latitude (-90 to 90)')
      return
    }
    if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
      toast.error('Please enter a valid Longitude (-180 to 180)')
      return
    }
    if (isNaN(radiusNum) || radiusNum < 10 || radiusNum > 1000) {
      toast.error('Radius must be between 10 and 1000 meters')
      return
    }
    if (openHour >= closeHour) {
      toast.error('Opening hour must be before closing hour')
      return
    }

    setIsSaving(true)
    const success = await onSave({
      latitude: latNum,
      longitude: lngNum,
      geofenceRadius: radiusNum,
      openHour,
      closeHour,
    })
    setIsSaving(false)
    if (success) {
      toast.success('Hub parameters updated successfully')
    }
  }

  const openLabel = HOURS_OPTIONS.find((h) => h.value === openHour)?.label ?? `${openHour}:00`
  const closeLabel = HOURS_OPTIONS.find((h) => h.value === closeHour)?.label ?? `${closeHour}:00`

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm text-slate-900">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span>Blue House Hub Primary GPS Anchor</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isDetectingLocation}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <Navigation className={`w-3 h-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                <span>{isDetectingLocation ? 'Detecting...' : 'Detect Device GPS'}</span>
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                title="Reset to default coordinates"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 px-2 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <label htmlFor="hub-lat-input" className="text-slate-400 block text-[10px] uppercase font-sans font-semibold mb-1">
                Latitude Coordinate
              </label>
              <input
                id="hub-lat-input"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
                className="w-full font-mono font-bold text-slate-900 text-sm bg-transparent outline-none border-b border-transparent focus:border-purple-500 transition-colors"
                placeholder="9.884526..."
              />
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <label htmlFor="hub-lng-input" className="text-slate-400 block text-[10px] uppercase font-sans font-semibold mb-1">
                Longitude Coordinate
              </label>
              <input
                id="hub-lng-input"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
                className="w-full font-mono font-bold text-slate-900 text-sm bg-transparent outline-none border-b border-transparent focus:border-purple-500 transition-colors"
                placeholder="8.876546..."
              />
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
        <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Daily Attendance Window
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {openLabel} – {closeLabel} (Lagos West Africa Time / GMT+1)
                {currentLagosTimeStr && <span className="ml-1 text-slate-400">· Current time: {currentLagosTimeStr}</span>}
              </p>
            </div>

            <div>
              {isWindowActive ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Window
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Closed / Inactive
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-600">Window Opening Time</label>
              <select
                value={openHour}
                onChange={(e) => setOpenHour(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-white text-xs font-medium text-slate-900 rounded-xl border border-slate-200 outline-none cursor-pointer hover:border-purple-300 transition-colors"
              >
                {HOURS_OPTIONS.filter((h) => h.value < closeHour).map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-600">Window Closing Time</label>
              <select
                value={closeHour}
                onChange={(e) => setCloseHour(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-white text-xs font-medium text-slate-900 rounded-xl border border-slate-200 outline-none cursor-pointer hover:border-purple-300 transition-colors"
              >
                {HOURS_OPTIONS.filter((h) => h.value > openHour).map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Saving Parameters...' : 'Save Geofence Parameters'}
          </button>
        </div>
      </form>
    </div>
  )
}

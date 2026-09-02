'use client'

import { useState } from 'react'
import { School, UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'

export type StudentRegistrationType = 'private' | 'intern'

export const HUB_TRACKS = [
  'Back End Development',
  'Cybersecurity',
  'Data Analysis',
  'Data Science',
  'Digital Marketing',
  'Front End Development',
  'Graphics Design',
  'Product Design',
  'Project Management',
  'Social Media Management',
  'Software Engineering',
  'UI/UX Design',
  'Web Development',
] as const

export interface StudentRegistrationFormValues {
  name: string
  email: string
  phone: string
  studentType: StudentRegistrationType
  school: string
  track: string
  months: number
}

interface StudentRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (values: StudentRegistrationFormValues) => void
}

const initialForm: StudentRegistrationFormValues = {
  name: '',
  email: '',
  phone: '',
  studentType: 'private',
  school: '',
  track: HUB_TRACKS[0],
  months: 3,
}

export function StudentRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
}: StudentRegistrationModalProps) {
  const [form, setForm] = useState<StudentRegistrationFormValues>(initialForm)

  if (!isOpen) return null

  const handleTypeChange = (newType: StudentRegistrationType) => {
    setForm((prev) => ({
      ...prev,
      studentType: newType,
      months: newType === 'private' ? 3 : prev.months,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const { name, email, phone, studentType, school, track, months } = form

    if (!name.trim() || !email.trim() || !phone.trim() || !school.trim() || !track.trim()) {
      toast.error('Please fill in all student registration fields.')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email.trim())) {
      toast.error('Please enter a valid email address.')
      return
    }

    const payload: StudentRegistrationFormValues = {
      ...form,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      school: school.trim(),
      track: track.trim(),
      months: studentType === 'private' ? 3 : months,
    }

    onSubmit(payload)
    setForm(initialForm)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-slate-900 leading-tight">New student registration</h2>
              <p className="text-slate-500 text-xs">Create a student profile for check-in access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-800 font-medium text-xs sm:text-sm mb-1.5">
              Student name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Jane Doe"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 font-medium text-xs sm:text-sm mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="student@email.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-slate-800 font-medium text-xs sm:text-sm mb-1.5">
                Phone number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. +234 812 345 6789"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-medium text-xs sm:text-sm mb-2">
              Student type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['private', 'intern'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`py-2.5 px-3 text-sm font-semibold rounded-xl border transition ${
                    form.studentType === type
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {type === 'private' ? 'Private' : 'Intern'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-medium text-xs sm:text-sm mb-1.5">
              School / institution
            </label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={form.school}
                onChange={(e) => setForm((prev) => ({ ...prev, school: e.target.value }))}
                placeholder="Enter student school"
                required
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-medium text-xs sm:text-sm mb-2">
              Course / track
            </label>
            <select
              value={form.track}
              onChange={(e) => setForm((prev) => ({ ...prev, track: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400"
            >
              {HUB_TRACKS.map((track) => (
                <option key={track} value={track}>
                  {track}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-800 font-medium text-xs sm:text-sm mb-2">
              Number of months
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[3, 6].map((value) => {
                const disabled = form.studentType === 'private'
                const active = form.studentType === 'private' ? value === 3 : form.months === value

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={disabled}
                    onClick={() => setForm((prev) => ({ ...prev, months: value }))}
                    className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition ${
                      active
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : disabled
                          ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {value} months
                  </button>
                )
              })}
            </div>
            {form.studentType === 'private' && (
              <p className="mt-2 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-md inline-block">
                Private students are automatically set to 3 months.
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium shadow-sm hover:opacity-95 transition"
            >
              Register student
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

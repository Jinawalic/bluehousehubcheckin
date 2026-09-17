'use client'

import React, { useState, useRef } from 'react'
import {
  UserPlus,
  Upload,
  FileSpreadsheet,
  X,
  Plus,
  Download,
  AlertCircle,
  CheckCircle2,
  FileText,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Student, Role } from './types'

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onAddStudent: (student: Student) => void
  onAddBulkStudents: (students: Student[]) => void
}

const TRACK_OPTIONS = [
  'Full-Stack Web Development',
  'Data Science & Artificial Intelligence',
  'UI/UX & Product Design',
  'Cybersecurity & Network Defense',
  'Cloud Infrastructure & DevOps',
  'Mobile App Development',
  'Administration / Faculty',
]

export function AddStudentModal({
  isOpen,
  onClose,
  onAddStudent,
  onAddBulkStudents,
}: AddStudentModalProps) {
  const [mode, setMode] = useState<'manual' | 'bulk'>('manual')

  // Manual Form State
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [identifier, setIdentifier] = useState('')
  const [track, setTrack] = useState(TRACK_OPTIONS[0])
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Bulk CSV Upload State
  const [bulkRole, setBulkRole] = useState<Role>('student')
  const [parsedRows, setParsedRows] = useState<Partial<Student>[]>([])
  const [csvFileName, setCsvFileName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole)
    if (newRole === 'student') setIdentifier('')
    else if (newRole === 'mentor') setIdentifier('BHS/')
    else if (newRole === 'corper') setIdentifier('PL/')
  }

  // Handle Manual Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !identifier.trim()) {
      toast.error('Please enter student name and ID.')
      return
    }

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      name: name.trim(),
      role,
      identifier: identifier.trim().toUpperCase(),
      track: track.trim() || 'General Tech',
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      registeredAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'active',
    }

    onAddStudent(newStudent)
    toast.success(`Registered ${newStudent.name} successfully`)
    // Reset
    setName('')
    setIdentifier(role === 'student' ? '' : role === 'mentor' ? 'BHS/' : 'PL/')
    setEmail('')
    setPhone('')
    onClose()
  }

  // Parse CSV content
  const parseCSVText = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0)
    if (lines.length === 0) {
      toast.error('CSV file appears empty.')
      return
    }

    // Determine if first row is header
    const firstLine = lines[0].toLowerCase()
    const hasHeader = firstLine.includes('name') || firstLine.includes('identifier') || firstLine.includes('id')
    const dataLines = hasHeader ? lines.slice(1) : lines

    const parsed: Partial<Student>[] = []

    dataLines.forEach((line, index) => {
      // Split by comma or semicolon
      const parts = line.split(/[,;\t]/).map((item) => item.replace(/^["']|["']$/g, '').trim())
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const studentName = parts[0]
        const studentId = parts[1].toUpperCase()
        const studentRole = (parts[2]?.toLowerCase() === 'mentor' || parts[2]?.toLowerCase() === 'staff'
          ? 'mentor'
          : parts[2]?.toLowerCase() === 'corper'
            ? 'corper'
            : bulkRole) as Role
        const studentTrack = parts[3] || 'Full-Stack Web Dev'
        const studentEmail = parts[4] || ''

        parsed.push({
          name: studentName,
          identifier: studentId,
          role: studentRole,
          track: studentTrack,
          email: studentEmail,
        })
      }
    })

    if (parsed.length === 0) {
      toast.error('Could not parse any valid rows. Please check format.')
      return
    }

    setParsedRows(parsed)
    toast.success(`Parsed ${parsed.length} participant records from CSV`)
  }

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCsvFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        parseCSVText(content)
      }
      reader.readAsText(file)
    }
  }

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text'))) {
      setCsvFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        parseCSVText(content)
      }
      reader.readAsText(file)
    } else {
      toast.error('Please upload a valid .csv file')
    }
  }

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const template = 'Full Name,Identifier,Role,Track,Email\nJohn Doe,24/101,student,Full-Stack Web Development,john@bluehouse.tech\nJane Smith,BHS/24/008,mentor,Data Science & AI,jane@bluehouse.tech\nPeter Obi,PL/24A/2030,corper,Cybersecurity,peter@bluehouse.tech'
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'bluehouse_participants_template.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Sample template downloaded')
  }

  // Confirm Bulk Import
  const handleConfirmBulk = () => {
    if (parsedRows.length === 0) {
      toast.error('No records to import.')
      return
    }

    const newStudents: Student[] = parsedRows.map((r, i) => ({
      id: `std-${Date.now()}-${i}`,
      name: r.name || 'Participant',
      role: r.role || bulkRole,
      identifier: r.identifier || `${bulkRole === 'student' ? 'BHH' : bulkRole === 'mentor' ? 'BHS' : 'PL'}/24/${100 + i}`,
      track: r.track || 'Full-Stack Web Dev',
      email: r.email,
      registeredAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'active',
    }))

    onAddBulkStudents(newStudents)
    toast.success(`Successfully added ${newStudents.length} participants`)
    setParsedRows([])
    setCsvFileName('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-slate-900 leading-tight">
                Add Participants
              </h2>
              <p className="text-slate-500 text-xs">Register new students, staff mentors, or NYSC corpers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl mb-5 shrink-0">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'manual'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('bulk')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === 'bulk'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk CSV Upload</span>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-1">
          {mode === 'manual' ? (
            /* MANUAL FORM */
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Role Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Select Role</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      role === 'student'
                        ? 'bg-blue-50 border-blue-300 text-blue-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('mentor')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      role === 'mentor'
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Staff / Mentor (BHS/)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('corper')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      role === 'corper'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    NYSC Corper (PL/)
                  </button>
                </div>
              </div>

              {/* Full Name & Identifier */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel Adekunle"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">ID / Identifier *</label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="24/..."
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm font-mono text-slate-900 rounded-xl border border-slate-200 focus:border-purple-500 outline-none uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Track / Cohort</label>
                  <select
                    value={track}
                    onChange={(e) => setTrack(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 focus:bg-white text-xs font-medium text-slate-900 rounded-xl border border-slate-200 outline-none cursor-pointer"
                  >
                    {TRACK_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="samuel@bluehouse.tech"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-xs text-slate-900 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  Register Participant
                </button>
              </div>
            </form>
          ) : (
            /* BULK CSV MODE */
            <div className="space-y-4">
              {/* Default Role Select */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Default Role for Unspecified Rows
                </label>
                <select
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value as Role)}
                  className="w-full px-3 py-2 bg-slate-50 text-xs font-medium text-slate-900 rounded-xl border border-slate-200 outline-none cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="mentor">Staff / Mentor (BHS/)</option>
                  <option value="corper">NYSC Corper (PL/)</option>
                </select>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-slate-300 hover:border-purple-400 bg-slate-50/50 hover:bg-purple-50/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,text/csv"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {csvFileName ? csvFileName : 'Click or drag .csv file here'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Supports columns: Name, Identifier, Role, Track, Email
                  </p>
                </div>
              </div>

              {/* Template Download Link */}
              <div className="flex items-center justify-between text-xs bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
                <span className="text-slate-600">Need the correct column format?</span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center gap-1 font-semibold text-purple-700 hover:text-purple-900 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample CSV</span>
                </button>
              </div>

              {/* Parsed Rows Preview */}
              {parsedRows.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{parsedRows.length} records ready to import</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setParsedRows([])}
                      className="text-rose-600 hover:text-rose-800 text-[11px] flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>

                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                    {parsedRows.map((row, idx) => (
                      <div key={idx} className="p-2 flex items-center justify-between bg-slate-50/50">
                        <div>
                          <span className="font-semibold text-slate-900">{row.name}</span>
                          <span className="text-slate-400 ml-2 font-mono text-[11px]">{row.identifier}</span>
                        </div>
                        <span className="text-[10px] font-medium bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full capitalize">
                          {row.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bulk Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={parsedRows.length === 0}
                  onClick={handleConfirmBulk}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  Import {parsedRows.length > 0 ? `(${parsedRows.length})` : ''} Records
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

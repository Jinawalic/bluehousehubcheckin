'use client'

import React, { useState } from 'react'
import {
  AlertCircle,
  Check,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  GraduationCap,
  Briefcase,
} from 'lucide-react'
import { AbsenceRequest } from './types'

interface AbsenceReportsProps {
  absences: AbsenceRequest[]
  onAbsenceAction: (id: string, action: 'approved' | 'rejected') => void
}

export function AbsenceReports({ absences, onAbsenceAction }: AbsenceReportsProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const filteredAbsences = absences.filter((req) => (filter === 'all' ? true : req.status === filter))

  return (
    <div className="space-y-4">
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        {/* Header & Status Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-serif font-bold text-lg text-slate-900 leading-tight">
              Absence Notices & Requests
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Review and act on absence excuses reported in advance by participants
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filter === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="grid gap-3 sm:gap-4">
          {filteredAbsences.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No absence records found for this filter.</p>
            </div>
          ) : (
            filteredAbsences.map((req) => (
              <div
                key={req.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      {req.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{req.name}</h3>
                        <span className="text-xs font-mono bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-medium">
                          {req.identifier}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{req.submittedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        req.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                      {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {req.status === 'pending' && <Clock className="w-3 h-3" />}
                      <span>{req.status}</span>
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-700">
                  <span className="font-semibold text-slate-900 block mb-0.5">Reported Reason:</span>
                  {req.reason}
                </div>

                {req.status === 'pending' && (
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => onAbsenceAction(req.id, 'rejected')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline Excuse</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAbsenceAction(req.id, 'approved')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Excuse</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

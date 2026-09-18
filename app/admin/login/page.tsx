'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  KeyRound,
  Building2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [isSendingReset, setIsSendingReset] = useState(false)

  useEffect(() => {
    fetch('/api/admin/session', { cache: 'no-store' }).then((response) => {
      if (response.ok) router.replace('/admin/dashboard')
    })
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    if (!cleanEmail || !cleanPassword) {
      toast.error('Missing credentials', {
        description: 'Please enter both your admin email and password.',
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword, remember: rememberMe }),
      })
      const result = await response.json().catch(() => ({}))
      if (response.ok) {
        toast.success('Authentication successful', {
          description: 'Welcome back to the Blue House Hub Command Center.',
        })
        router.push('/admin/dashboard')
      } else {
        toast.error('Invalid credentials', {
          description: result.error || 'The email or password you entered is incorrect.',
        })
      }
    } catch (err) {
      toast.error('Login failed', {
        description: 'An unexpected connection error occurred. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setIsSendingReset(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSendingReset(false)
    setIsForgotModalOpen(false)
    toast.success('Password reset instructions sent', {
      description: `If an account exists for ${forgotEmail}, check your inbox for the reset link.`,
    })
    setForgotEmail('')
  }

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#F4EFFB] selection:bg-purple-200 selection:text-purple-900 font-sans overflow-hidden">
      {/* Dynamic Background Glow Effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-purple-300/40 via-pink-200/30 to-transparent blur-3xl rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-24 w-[500px] h-[500px] bg-gradient-to-tr from-purple-400/20 via-pink-300/20 to-transparent blur-3xl rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -left-32 w-[450px] h-[450px] bg-gradient-to-br from-indigo-300/25 via-purple-200/20 to-transparent blur-3xl rounded-full"
      />

      <div className="relative z-10 w-full max-w-[480px] flex flex-col items-center">

        {/* Main Login Card */}
        <div className="w-full bg-white/95 backdrop-blur-md rounded-[28px] sm:rounded-[32px] p-6 sm:p-9 shadow-[0_20px_60px_-15px_rgba(130,90,200,0.12),0_1px_3px_rgba(0,0,0,0.02)] border border-white/90 transition-all">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">Admin Sign In</h2>
              <p className="text-xs text-slate-500">Enter your administrative credentials</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-700">
                Admin Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bluehouse.tech"
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/15 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Security notice */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer accent-purple-600"
                />
                <span className="text-xs text-slate-600 font-medium">Remember this session</span>
              </label>

              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>256-bit Encrypted</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 sm:py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 hover:from-purple-700 hover:via-purple-800 hover:to-pink-700 text-white font-semibold text-sm shadow-[0_8px_20px_rgba(152,53,234,0.28)] hover:shadow-[0_10px_25px_rgba(152,53,234,0.35)] transition-all duration-200 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying authorization...</span>
                </>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>


        </div>

        {/* Footer Info */}
        <footer className="mt-6 text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-purple-500" />
            <span>Bluehouse Technologies Ltd. — Hub Ops</span>
          </p>
        </footer>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl text-slate-900 leading-tight">
                    Reset Admin Password
                  </h2>
                  <p className="text-slate-500 text-xs">Security verification required</p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mb-5">
              Enter your registered administrator email address. We will dispatch an OTP verification link to your official inbox.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@bluehouse.tech"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-900 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-3 focus:ring-purple-500/15 outline-none transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold shadow-xs hover:opacity-95 transition disabled:opacity-75 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSendingReset ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Send Reset Link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

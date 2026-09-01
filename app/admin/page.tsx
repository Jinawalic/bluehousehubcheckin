'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminRootPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if admin is logged in
    const isAuth = typeof window !== 'undefined' && localStorage.getItem('hub_admin_auth') === 'true'
    if (isAuth) {
      router.replace('/admin/dashboard')
    } else {
      router.replace('/admin/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4EFFB]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 text-sm font-medium">Redirecting to Admin Portal...</p>
      </div>
    </div>
  )
}

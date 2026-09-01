'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const Toaster = dynamic(
  () => import('sonner').then((module) => module.Toaster),
  {
    ssr: false,
  }
)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  )
}

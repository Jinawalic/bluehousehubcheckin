import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import { PwaRegistration } from './pwa-registration'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hub Attendance — Daily Check-in',
  description:
    'Daily geolocation-verified attendance check-in for Bluehouse technologies',
  applicationName: 'Hub Attendance',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Hub Attendance',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Hub Attendance — Daily Check-in',
    description:
      'Daily geolocation-verified attendance check-in for Bluehouse technologies',
    url: 'https://hub-checkin.bluehouse.tech',
    siteName: 'Hub Attendance',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hub Attendance — Daily Check-in',
    description:
      'Daily geolocation-verified attendance check-in for Bluehouse technologies',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#243e9e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <PwaRegistration />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

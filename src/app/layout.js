import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const siteDescription = 'A clean place for your saved guitar songs'

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'SwarVerse',
  description: siteDescription,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/brand/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/brand/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/brand/apple-touch-icon.png',
    other: [{ rel: 'mask-icon', url: '/brand/safari-pinned-tab.svg', color: '#9333ea' }],
  },
  openGraph: {
    title: 'SwarVerse',
    description: siteDescription,
    type: 'website',
    images: [
      {
        url: '/brand/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SwarVerse',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SwarVerse',
    description: siteDescription,
    images: ['/brand/og-image.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}

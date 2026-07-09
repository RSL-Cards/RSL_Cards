import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'

const outfit = Outfit({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RSL Cards - Dealer Dashboard',
  description: 'The operating system for sports card dealers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased bg-gray-50 text-gray-900 selection:bg-indigo-500 selection:text-white`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}

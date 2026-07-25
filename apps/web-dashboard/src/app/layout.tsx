import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/QueryProvider'
import { GlobalSSEProvider } from '@/components/layout/GlobalSSEProvider'
import { GoogleOAuthProvider } from '@react-oauth/google'

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
      <body className={`${outfit.className} antialiased bg-black text-white selection:bg-[#E8001C] selection:text-white`}>
        <QueryProvider>
          <GlobalSSEProvider>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
              {children}
            </GoogleOAuthProvider>
          </GlobalSSEProvider>
        </QueryProvider>
      </body>
    </html>
  )
}

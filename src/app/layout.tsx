import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Medical Booking App',
  description: 'A comprehensive medical booking and check-in application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ReactQueryProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ReactQueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

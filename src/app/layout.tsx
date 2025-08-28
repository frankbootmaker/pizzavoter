import type { Metadata } from 'next'
import { ToastProvider } from './components/Toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pizza Voting App',
  description: 'Vote for your favorite pizza!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}

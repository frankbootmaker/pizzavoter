import type { Metadata } from 'next'

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
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  )
}

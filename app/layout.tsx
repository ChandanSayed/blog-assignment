import { Header } from '@/app/components/Header'
import { Footer } from '@/app/components/Footer'
import StoreProvider from './providers/StoreProvider'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <StoreProvider>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  )
}

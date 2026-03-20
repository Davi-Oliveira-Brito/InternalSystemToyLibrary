import { Toaster } from 'sonner'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <Toaster
          theme="dark"
          position="top-center"
          richColors
          toastOptions={{
            style: {
              background: '#303440',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#ffffff',
            },
          }}
        />
      </body>
    </html>
  )
}
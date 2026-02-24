import type { Metadata } from "next"
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "sonner"
import { CartProvider } from "@/lib/cart-store"
import { AuthProvider } from "@/lib/auth-store"
import { OrderProvider } from "@/lib/order-store"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: {
    default: "Eid Collection - Premium Punjabi Fashion",
    template: "%s | Eid Collection",
  },
  description:
    "Discover premium Eid fashion for the whole family. Shop shalwar kameez, kurtas, Anarkali suits, kids outfits and accessories. Celebrate Eid in style with our exclusive Punjabi collection.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={_playfair.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
              {children}
              <Toaster position="top-right" richColors />
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

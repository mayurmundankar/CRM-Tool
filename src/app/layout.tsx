import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Atelier BIM • Interior Design & Revit Automation CRM",
  description: "Next.js & Supabase CRM for luxury interior design studios. Features automated Revit lighting/plumbing sheet generation, Groq LLM integration, WhatsApp alerts, and client approval portal.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-500">
        {children}
      </body>
    </html>
  )
}

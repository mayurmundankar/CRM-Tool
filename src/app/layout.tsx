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
  title: "FlowMS • Interior Design CRM",
  description: "FlowMS is a studio CRM for interior design teams. Pipeline, inquiries, Revit deliverables, client approvals, invoices, and a project-aware studio chat.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('crm_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `.dark input[type="date"]::-webkit-calendar-picker-indicator,.dark input[type="datetime-local"]::-webkit-calendar-picker-indicator,.dark input[type="time"]::-webkit-calendar-picker-indicator{cursor:pointer;filter:invert(1);opacity:.9}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-foreground/10">
        {children}
      </body>
    </html>
  )
}

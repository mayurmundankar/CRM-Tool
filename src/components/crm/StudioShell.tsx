"use client"

import * as React from "react"
import Link from "next/link"
import {
  BarChart3,
  Columns3,
  Eye,
  Inbox,
  Layers,
  MessageCircle,
  MessageSquare,
  Plus,
  Receipt,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { isSupabaseConfigured } from "@/lib/supabase"
import { ThemeToggle } from "@/components/crm/ThemeToggle"
import { cn } from "@/lib/utils"

const NAV = [
  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  { id: 'inquiries', label: 'Inquiries', icon: Inbox },
  { id: 'pipeline', label: 'Pipeline', icon: Columns3 },
  { id: 'deliverables', label: 'Deliverables', icon: Layers },
  { id: 'ai-studio', label: 'Spec studio', icon: Sparkles },
  { id: 'chat', label: 'Studio Chat', icon: MessageSquare },
  { id: 'whatsapp', label: 'Messages', icon: MessageCircle },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'portal', label: 'Client portal', icon: Eye },
]

const TITLES: Record<string, string> = {
  analysis: 'Analysis',
  inquiries: 'Inquiries',
  pipeline: 'Pipeline',
  deliverables: 'Deliverables',
  'ai-studio': 'Spec studio',
  chat: 'Studio Chat',
  whatsapp: 'Messages',
  invoices: 'Invoices',
  portal: 'Client portal',
}

interface StudioShellProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  clientCount: number
  openInquiryCount: number
  onOpenNewClient: () => void
  children: React.ReactNode
}

export function StudioShell({
  activeTab,
  setActiveTab,
  clientCount,
  openInquiryCount,
  onOpenNewClient,
  children,
}: StudioShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border md:flex">
        <div className="px-5 py-5">
          <Link href="/" className="block">
            <p className="text-sm font-medium tracking-tight">FlowMS</p>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = activeTab === item.id
            const count = item.id === 'pipeline' ? clientCount : item.id === 'inquiries' ? openInquiryCount : 0
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex h-8 items-center gap-2 rounded-md px-2 text-left text-sm',
                  active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="flex-1">{item.label}</span>
                {count > 0 && <span className="text-[11px] tabular-nums text-muted-foreground">{count}</span>}
              </button>
            )
          })}
        </nav>
        <div className="space-y-2 border-t border-border p-3">
          <p className="px-2 text-[11px] text-muted-foreground">
            {isSupabaseConfigured ? 'Supabase connected' : 'Saved in this browser'}
          </p>
          <ThemeToggle className="h-8 w-8" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-md sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{TITLES[activeTab] || 'Studio'}</p>
          </div>
          <Button type="button" size="sm" onClick={onOpenNewClient} className="h-8 gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add client
          </Button>
        </header>

        <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 md:hidden">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'whitespace-nowrap rounded-md px-2.5 py-1 text-xs',
                activeTab === item.id ? 'bg-secondary text-foreground' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </button>
          ))}
          <ThemeToggle className="ml-auto h-7 w-7 shrink-0" />
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  )
}

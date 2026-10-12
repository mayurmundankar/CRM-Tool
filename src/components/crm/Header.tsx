"use client"

import * as React from "react"
import { Building2, Sparkles, Moon, Sun, Plus, Database, Cpu, Check, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { isSupabaseConfigured } from "@/lib/supabase"
import { getStoredGroqKey, setStoredGroqKey } from "@/lib/groq-client"

interface HeaderProps {
  onOpenNewClient: () => void
  activeTab: string
  setActiveTab: (tab: string) => void
  clientCount: number
  totalPipelineValue: number
  totalHoursSaved: number
}

export function Header({
  onOpenNewClient,
  activeTab,
  setActiveTab,
  clientCount,
  totalPipelineValue,
  totalHoursSaved
}: HeaderProps) {
  const [isDark, setIsDark] = React.useState(true)
  const [isGroqModalOpen, setIsGroqModalOpen] = React.useState(false)
  const [groqKeyInput, setGroqKeyInput] = React.useState('')
  const [keySaved, setKeySaved] = React.useState(false)

  // Initialize theme from localStorage or default to dark
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('crm_theme')
      const shouldUseDark = savedTheme ? savedTheme === 'dark' : true
      setIsDark(shouldUseDark)
      if (shouldUseDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }

      setGroqKeyInput(getStoredGroqKey())
    }
  }, [])

  const toggleTheme = () => {
    const nextDark = !isDark
    setIsDark(nextDark)
    if (typeof window !== 'undefined') {
      localStorage.setItem('crm_theme', nextDark ? 'dark' : 'light')
      if (nextDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const handleSaveGroqKey = (e: React.FormEvent) => {
    e.preventDefault()
    setStoredGroqKey(groqKeyInput)
    setKeySaved(true)
    setTimeout(() => {
      setKeySaved(false)
      setIsGroqModalOpen(false)
    }, 1200)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val)
  }

  const hasGroqKey = Boolean(groqKeyInput || process.env.NEXT_PUBLIC_GROQ_API_KEY)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-md">
      {/* Top Navbar Row */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand & Studio Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 text-white shadow-sm shadow-amber-500/20">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight font-serif text-foreground">
                ATELIER <span className="text-amber-500 font-sans font-semibold">BIM</span>
              </span>
              <span className="text-[11px] font-medium text-muted-foreground hidden sm:inline">
                • Interior Design CRM
              </span>
            </div>
          </div>
        </div>

        {/* Center / Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { id: 'pipeline', label: 'Pipeline', badge: clientCount > 0 ? `${clientCount}` : undefined },
            // { id: 'deliverables', label: 'BIM Sheets' },
            { id: 'ai-studio', label: 'AI Spec Studio', isAi: true },
            { id: 'whatsapp', label: 'WhatsApp Hub' },
            { id: 'invoices', label: 'Invoices' },
            { id: 'portal', label: 'Client Portal', isPortal: true },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              } ${item.isAi && activeTab !== item.id ? 'text-amber-600 dark:text-amber-400' : ''}`}
            >
              {item.isAi && <Sparkles className="h-3 w-3" />}
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    activeTab === item.id
                      ? 'bg-black/20 text-white'
                      : 'bg-muted-foreground/15 text-muted-foreground'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Supabase Status Pill */}
          <div
            className="hidden lg:flex items-center gap-1.5 text-[11px] rounded-full border border-border/80 bg-muted/40 px-2.5 py-1 text-muted-foreground"
            title={isSupabaseConfigured ? "Connected to live Supabase database" : "Running locally"}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isSupabaseConfigured ? 'Supabase' : 'Offline'}</span>
          </div>

          {/* Groq LLM Key Trigger */}
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGroqModalOpen(true)}
            className="h-8 px-2.5 text-xs gap-1.5 border-border/80 hover:border-amber-500/40"
            title="Configure Groq API Key for high-speed LLM features"
          >
            <Cpu className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden xl:inline">Groq AI</span>
            <span className={`h-1.5 w-1.5 rounded-full ${hasGroqKey ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
          </Button> */}

          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </Button>

          {/* + Add Client Button */}
          <Button
            onClick={onOpenNewClient}
            size="sm"
            className="h-8 gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-xs shadow-amber-500/20 text-xs px-3"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Client</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden border-t border-border/40 px-3 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1">
        {[
          { id: 'pipeline', label: 'Pipeline' },
          // { id: 'deliverables', label: 'BIM Sheets' },
          { id: 'ai-studio', label: 'AI Spec' },
          { id: 'whatsapp', label: 'WhatsApp' },
          { id: 'invoices', label: 'Invoices' },
          { id: 'portal', label: 'Client Portal' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium transition-all ${
              activeTab === item.id
                ? 'bg-primary text-primary-foreground font-semibold'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Groq API Configuration Modal */}
      <Dialog open={isGroqModalOpen} onOpenChange={setIsGroqModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-serif">Groq LLM Configuration</DialogTitle>
                <DialogDescription className="text-xs">
                  Power lightning-fast architectural specifications, lux calculations, and WhatsApp drafts with Groq Llama 3.3.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveGroqKey} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" /> Groq API Key
              </label>
              <Input
                type="password"
                placeholder="gsk_..."
                value={groqKeyInput}
                onChange={(e) => setGroqKeyInput(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Get your free API key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-amber-500 underline">console.groq.com</a> or set <code className="bg-muted px-1 py-0.5 rounded text-[10px]">GROQ_API_KEY</code> in <code className="bg-muted px-1 py-0.5 rounded text-[10px]">.env.local</code>.
              </p>
            </div>

            <div className="rounded-lg border border-border/80 bg-muted/30 p-2.5 text-xs text-muted-foreground space-y-1">
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <span>Model: Llama 3.3 70B Versatile</span>
              </div>
              <p className="text-[11px]">
                Ultra-low latency generation for interior lighting schedules, plumbing rough-in elevations, and client communication.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsGroqModalOpen(false)}>
                Close
              </Button>
              <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs gap-1.5">
                {keySaved ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-black" />
                    Saved!
                  </>
                ) : (
                  'Save Groq Key'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  )
}

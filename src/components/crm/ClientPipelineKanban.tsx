"use client"

import * as React from "react"
import { Client, PipelineStage, PropertyType } from "@/types/crm"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Search,
  Filter,
  ArrowRight,
  MessageCircle,
  Building2,
  DollarSign,
  Ruler,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Clock,
  Sparkles,
  LayoutGrid,
  List
} from "lucide-react"

interface ClientPipelineKanbanProps {
  clients: Client[]
  onStageChange: (clientId: string, stage: PipelineStage) => void
  onSelectClientForPortal: (client: Client) => void
  onSendWhatsAppQuick: (client: Client) => void
}

const STAGES: { id: PipelineStage; label: string; color: string; desc: string }[] = [
  { id: 'Lead Inbound', label: 'Inbound Leads', color: 'border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/40', desc: 'Initial inquiry & intake' },
  { id: 'Consultation & Discovery', label: 'Consultation', color: 'border-blue-200 bg-blue-50/70 dark:border-blue-900/40 dark:bg-blue-950/20', desc: 'Site visit & brief' },
  { id: 'Concept & Moodboard', label: 'Concept & Moodboard', color: 'border-purple-200 bg-purple-50/70 dark:border-purple-900/40 dark:bg-purple-950/20', desc: 'Aesthetic direction' },
  { id: 'Schematic Planning', label: 'Schematic Planning', color: 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/40 dark:bg-indigo-950/20', desc: 'Space & partition plans' },
  { id: 'Revit BIM & Tech Drawings', label: 'Revit BIM & Drawings', color: 'border-amber-300/80 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/25', desc: 'Automated lighting & plumbing' },
  { id: 'Procurement & Specs', label: 'Procurement', color: 'border-cyan-200 bg-cyan-50/70 dark:border-cyan-900/40 dark:bg-cyan-950/20', desc: 'FF&E & material ordering' },
  { id: 'Execution & Site Build', label: 'Site Execution', color: 'border-orange-200 bg-orange-50/70 dark:border-orange-900/40 dark:bg-orange-950/20', desc: 'Contractor millwork build' },
  { id: 'Handover & Reveal', label: 'Handover & Reveal', color: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-950/20', desc: 'Final styling & signoff' },
]

export function ClientPipelineKanban({
  clients,
  onStageChange,
  onSelectClientForPortal,
  onSendWhatsAppQuick,
}: ClientPipelineKanbanProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedPropertyFilter, setSelectedPropertyFilter] = React.useState<string>('ALL')
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban')
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesProperty =
      selectedPropertyFilter === 'ALL' || c.property_type === selectedPropertyFilter

    return matchesSearch && matchesProperty
  })

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val)
  }

  const getStyleBadgeVariant = (style: string) => {
    switch (style) {
      case 'Warm Minimalist': return 'gold'
      case 'Contemporary Japandi': return 'emerald'
      case 'Biophilic Luxury': return 'emerald'
      case 'Art Deco Modern': return 'purple'
      default: return 'secondary'
    }
  }

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' })
    }
  }

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' })
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] space-y-3">
      {/* Search, Filter & Quick Scroll Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-xl border border-border/70 bg-card p-2.5 shadow-xs shrink-0">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search clients, addresses, companies..."
              className="pl-8.5 bg-background h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
              value={selectedPropertyFilter}
              onChange={(e) => setSelectedPropertyFilter(e.target.value)}
            >
              <option value="ALL">All Properties</option>
              <option value="Luxury Villa">Luxury Villa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Commercial Office">Commercial</option>
              <option value="Boutique Retail">Boutique Retail</option>
              <option value="Modern Apartment">Modern Apartment</option>
              <option value="Hospitality & Lounge">Hospitality</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {/* Quick horizontal scroll navigation buttons */}
          {viewMode === 'kanban' && (
            <div className="flex items-center gap-1 border-r border-border/60 pr-2 mr-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handleScrollLeft}
                className="h-7 w-7 rounded-md"
                title="Scroll Left"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleScrollRight}
                className="h-7 w-7 rounded-md"
                title="Scroll Right"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="h-7 px-2 text-xs gap-1"
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Pipeline</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-7 px-2 text-xs gap-1"
            >
              <List className="h-3 w-3" />
              <span>Table</span>
            </Button>
          </div>

          <span className="text-[11px] text-muted-foreground whitespace-nowrap pl-1">
            {filteredClients.length} of {clients.length} clients
          </span>
        </div>
      </div>

      {/* Kanban Board with Pinpoint In-Viewport Horizontal Scrollbar */}
      {viewMode === 'kanban' && (
        <div
          ref={scrollContainerRef}
          className="flex-1 flex gap-3.5 overflow-x-auto overflow-y-hidden pb-2 pt-0.5 items-stretch scroll-smooth"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'hsl(var(--muted-foreground) / 0.4) transparent',
          }}
        >
          {STAGES.map((stage) => {
            const stageClients = filteredClients.filter((c) => c.stage === stage.id)
            const stageTotalValue = stageClients.reduce((acc, c) => acc + c.budget, 0)

            return (
              <div
                key={stage.id}
                className={`flex-shrink-0 w-80 rounded-xl border ${stage.color} p-3 flex flex-col h-full shadow-xs transition-colors`}
              >
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/50 mb-2.5 shrink-0">
                  <div>
                    <h3 className="text-xs font-bold tracking-tight flex items-center gap-1.5 text-foreground">
                      {stage.label}
                      <span className="rounded-full bg-background px-1.5 py-0.2 text-[10px] font-bold border border-border">
                        {stageClients.length}
                      </span>
                    </h3>
                    <p className="text-[10px] text-muted-foreground">{stage.desc}</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(stageTotalValue)}
                  </span>
                </div>

                {/* Cards Container (Scrolls vertically inside each stage column) */}
                <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
                  {stageClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground border border-dashed border-border/60 rounded-lg">
                      <span>No active clients in this stage</span>
                    </div>
                  ) : (
                    stageClients.map((client) => (
                      <Card
                        key={client.id}
                        className="p-3 hover:shadow-md hover:border-amber-500/50 transition-all bg-card group relative"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7 ring-1 ring-amber-500/30">
                              <AvatarImage src={client.avatar_url} />
                              <AvatarFallback>{client.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-xs font-semibold leading-tight group-hover:text-amber-500 transition-colors text-foreground">
                                {client.name}
                              </h4>
                              {client.company && (
                                <p className="text-[10px] text-muted-foreground truncate max-w-[130px]">
                                  {client.company}
                                </p>
                              )}
                            </div>
                          </div>

                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {client.property_type}
                          </Badge>
                        </div>

                        {/* Aesthetic & Location */}
                        <div className="space-y-1 my-2 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px]">Style:</span>
                            <Badge variant={getStyleBadgeVariant(client.style_preference)} className="text-[10px] py-0">
                              {client.style_preference}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1 text-[10px]">
                              <DollarSign className="h-3 w-3 text-emerald-500" />
                              Budget:
                            </span>
                            <span className="font-semibold text-foreground">
                              {formatCurrency(client.budget)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1 text-[10px]">
                              <Ruler className="h-3 w-3 text-amber-500" />
                              Scale:
                            </span>
                            <span>{client.square_footage.toLocaleString()} sq ft</span>
                          </div>

                          <div className="flex items-center gap-1 text-[10px] truncate text-muted-foreground pt-0.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{client.address}</span>
                          </div>
                        </div>

                        {/* Quick Notes if any */}
                        {client.notes && (
                          <p className="text-[10px] italic bg-muted/50 p-1.5 rounded text-muted-foreground mb-2.5 line-clamp-2">
                            &quot;{client.notes}&quot;
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center justify-between gap-1 pt-2 border-t border-border/50">
                          {/* Quick stage selector */}
                          <select
                            className="h-6 text-[10px] rounded border border-border bg-background px-1 text-muted-foreground hover:text-foreground focus:outline-none"
                            value={client.stage}
                            onChange={(e) => onStageChange(client.id, e.target.value as PipelineStage)}
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                              title="Send WhatsApp update"
                              onClick={() => onSendWhatsAppQuick(client)}
                            >
                              <MessageCircle className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-amber-500 hover:bg-amber-500/10"
                              title="Open Client Project Portal"
                              onClick={() => onSelectClientForPortal(client)}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Table / Directory View */}
      {viewMode === 'list' && (
        <Card className="flex-1 overflow-hidden">
          <div className="overflow-x-auto h-full">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border sticky top-0">
                <tr>
                  <th className="p-3">Client & Company</th>
                  <th className="p-3">Property & Style</th>
                  <th className="p-3">Current Stage</th>
                  <th className="p-3">Budget & Scale</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={client.avatar_url} />
                          <AvatarFallback>{client.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-xs text-foreground">{client.name}</div>
                          <div className="text-[11px] text-muted-foreground">{client.company || client.city}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col gap-0.5 items-start">
                        <span className="font-medium text-xs">{client.property_type}</span>
                        <Badge variant={getStyleBadgeVariant(client.style_preference)} className="text-[10px] py-0">
                          {client.style_preference}
                        </Badge>
                      </div>
                    </td>

                    <td className="p-3">
                      <select
                        className="h-7 text-xs rounded border border-border bg-background px-2"
                        value={client.stage}
                        onChange={(e) => onStageChange(client.id, e.target.value as PipelineStage)}
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>{s.label}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">{formatCurrency(client.budget)}</div>
                      <div className="text-[10px] text-muted-foreground">{client.square_footage.toLocaleString()} sq ft</div>
                    </td>

                    <td className="p-3 text-xs text-muted-foreground">
                      <div>{client.phone}</div>
                      <div>{client.email}</div>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 text-emerald-600 dark:text-emerald-400"
                          onClick={() => onSendWhatsAppQuick(client)}
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => onSelectClientForPortal(client)}
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Portal</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

"use client"

import * as React from "react"
import { Client, PipelineStage } from "@/types/crm"
import { BUDGET_BANDS, DESIGN_STYLES, LEAD_SOURCES, PIPELINE_STAGES, PROPERTY_TYPES, matchesBudget } from "@/lib/studio"
import { formatCurrency } from "@/lib/format"
import { FilterSelect, SearchField } from "@/components/crm/filters"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageCircle,
  DollarSign,
  Ruler,
  MapPin,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  List
} from "lucide-react"

interface ClientPipelineKanbanProps {
  clients: Client[]
  onStageChange: (clientId: string, stage: PipelineStage) => void
  onOpenClient: (client: Client) => void
  onSelectClientForPortal: (client: Client) => void
  onSendWhatsAppQuick: (client: Client) => void
}

export function ClientPipelineKanban({
  clients,
  onStageChange,
  onOpenClient,
  onSelectClientForPortal,
  onSendWhatsAppQuick,
}: ClientPipelineKanbanProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedPropertyFilter, setSelectedPropertyFilter] = React.useState('ALL')
  const [selectedStyle, setSelectedStyle] = React.useState('ALL')
  const [selectedSource, setSelectedSource] = React.useState('ALL')
  const [selectedStage, setSelectedStage] = React.useState('ALL')
  const [selectedBudget, setSelectedBudget] = React.useState('ALL')
  const [viewMode, setViewMode] = React.useState<'kanban' | 'list'>('kanban')
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  const filteredClients = clients.filter((c) => {
    const query = searchQuery.toLowerCase()
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.company && c.company.toLowerCase().includes(query)) ||
      c.address.toLowerCase().includes(query)

    return (
      matchesSearch &&
      (selectedPropertyFilter === 'ALL' || c.property_type === selectedPropertyFilter) &&
      (selectedStyle === 'ALL' || c.style_preference === selectedStyle) &&
      (selectedSource === 'ALL' || c.lead_source === selectedSource) &&
      (selectedStage === 'ALL' || c.stage === selectedStage) &&
      matchesBudget(c.budget, selectedBudget)
    )
  })

  const visibleStages = PIPELINE_STAGES.filter((stage) => selectedStage === 'ALL' || stage.id === selectedStage)

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
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex flex-wrap items-center gap-2">
          <SearchField value={searchQuery} onChange={setSearchQuery} placeholder="Search clients" />
          <FilterSelect
            label="Stage"
            value={selectedStage}
            onChange={setSelectedStage}
            options={[{ value: 'ALL', label: 'All stages' }, ...PIPELINE_STAGES.map((stage) => ({ value: stage.id, label: stage.label }))]}
          />
          <FilterSelect
            label="Property"
            value={selectedPropertyFilter}
            onChange={setSelectedPropertyFilter}
            options={[{ value: 'ALL', label: 'All properties' }, ...PROPERTY_TYPES.map((item) => ({ value: item, label: item }))]}
          />
          <FilterSelect
            label="Style"
            value={selectedStyle}
            onChange={setSelectedStyle}
            options={[{ value: 'ALL', label: 'All styles' }, ...DESIGN_STYLES.map((item) => ({ value: item, label: item }))]}
          />
          <FilterSelect
            label="Source"
            value={selectedSource}
            onChange={setSelectedSource}
            options={[{ value: 'ALL', label: 'All sources' }, ...LEAD_SOURCES.map((item) => ({ value: item, label: item }))]}
          />
          <FilterSelect label="Budget" value={selectedBudget} onChange={setSelectedBudget} options={BUDGET_BANDS} />
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
          {visibleStages.map((stage) => {
            const stageClients = filteredClients.filter((c) => c.stage === stage.id)
            const stageTotalValue = stageClients.reduce((acc, c) => acc + c.budget, 0)

            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-72 rounded-lg border border-border bg-muted/40 p-3 flex flex-col h-full"
              >
                <div className="flex items-center justify-between pb-2 border-b border-border/70 mb-2.5 shrink-0">
                  <div>
                    <h3 className="text-xs font-medium tracking-tight flex items-center gap-1.5 text-foreground">
                      {stage.label}
                      <span className="text-[10px] text-muted-foreground">{stageClients.length}</span>
                    </h3>
                    <p className="text-[10px] text-muted-foreground">{stage.description}</p>
                  </div>
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {formatCurrency(stageTotalValue)}
                  </span>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                  {stageClients.length === 0 ? (
                    <p className="px-1 py-6 text-center text-xs text-muted-foreground">None in this stage</p>
                  ) : (
                    stageClients.map((client) => (
                      <Card
                        key={client.id}
                        onClick={() => onOpenClient(client)}
                        className="cursor-pointer p-3 hover:border-foreground/20 bg-card"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarImage src={client.avatar_url} />
                              <AvatarFallback>{client.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="text-xs font-medium leading-tight text-foreground">
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
                              <Ruler className="h-3 w-3" />
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
                            onClick={(event) => event.stopPropagation()}
                            onChange={(e) => onStageChange(client.id, e.target.value as PipelineStage)}
                          >
                            {PIPELINE_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                              title="Send WhatsApp update"
                              onClick={(event) => {
                                event.stopPropagation()
                                onSendWhatsAppQuick(client)
                              }}
                            >
                              <MessageCircle className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              title="Open Client Project Portal"
                              onClick={(event) => {
                                event.stopPropagation()
                                onSelectClientForPortal(client)
                              }}
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
                  <tr key={client.id} className="cursor-pointer hover:bg-muted/40" onClick={() => onOpenClient(client)}>
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
                        onClick={(event) => event.stopPropagation()}
                        onChange={(e) => onStageChange(client.id, e.target.value as PipelineStage)}
                      >
                        {PIPELINE_STAGES.map((s) => (
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
                          onClick={(event) => {
                            event.stopPropagation()
                            onSendWhatsAppQuick(client)
                          }}
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>WhatsApp</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={(event) => {
                            event.stopPropagation()
                            onSelectClientForPortal(client)
                          }}
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

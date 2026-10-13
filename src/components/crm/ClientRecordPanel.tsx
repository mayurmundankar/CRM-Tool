"use client"

import * as React from "react"
import { Client, CommunicationLog, Invoice, PipelineStage, Project, ProjectDeliverable } from "@/types/crm"
import { formatCurrency, formatDate } from "@/lib/format"
import { PIPELINE_STAGES } from "@/lib/studio"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface ClientRecordPanelProps {
  client: Client
  project?: Project
  deliverables: ProjectDeliverable[]
  invoices: Invoice[]
  logs: CommunicationLog[]
  onClose: () => void
  onStageChange: (clientId: string, stage: PipelineStage) => void
  onSaveNotes: (clientId: string, notes: string) => void
  onOpenPortal: (client: Client) => void
  onOpenMessages: (client: Client) => void
}

export function ClientRecordPanel({
  client,
  project,
  deliverables,
  invoices,
  logs,
  onClose,
  onStageChange,
  onSaveNotes,
  onOpenPortal,
  onOpenMessages,
}: ClientRecordPanelProps) {
  const [notes, setNotes] = React.useState(client.notes || '')

  React.useEffect(() => {
    setNotes(client.notes || '')
  }, [client.id, client.notes])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-foreground/20" aria-label="Close client record" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-background">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{client.property_type}</p>
            <h2 className="mt-1 text-lg font-medium tracking-tight">{client.name}</h2>
            <p className="text-sm text-muted-foreground">{client.company || client.city}</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Budget</p>
              <p className="mt-1 font-medium tabular-nums">{formatCurrency(client.budget)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Scale</p>
              <p className="mt-1">{client.square_footage ? `${client.square_footage.toLocaleString()} sq ft` : '—'}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Style</p>
              <p className="mt-1">{client.style_preference}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Source</p>
              <p className="mt-1">{client.lead_source}</p>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wide text-muted-foreground" htmlFor="client-stage">
              Stage
            </label>
            <select
              id="client-stage"
              value={client.stage}
              onChange={(event) => onStageChange(client.id, event.target.value as PipelineStage)}
              className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {PIPELINE_STAGES.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => onOpenPortal(client)}>
              Portal
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => onOpenMessages(client)}>
              Message
            </Button>
          </div>

          <div>
            <p className="text-sm font-medium">Notes</p>
            <Textarea className="mt-2" rows={4} value={notes} onChange={(event) => setNotes(event.target.value)} />
            <Button
              type="button"
              size="sm"
              className="mt-2"
              variant="secondary"
              onClick={() => onSaveNotes(client.id, notes)}
            >
              Save notes
            </Button>
          </div>

          <section>
            <p className="text-sm font-medium">Deliverables</p>
            {deliverables.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No sheets on {project?.name || 'this project'} yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {deliverables.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span>
                      {item.sheet_number} · {item.title}
                    </span>
                    <Badge variant="secondary">{item.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <p className="text-sm font-medium">Invoices</p>
            {invoices.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No invoices yet.</p>
            ) : (
              <ul className="mt-2 divide-y divide-border border-y border-border">
                {invoices.map((invoice) => (
                  <li key={invoice.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span>
                      {invoice.invoice_number}
                      <span className="block text-xs text-muted-foreground">{invoice.description}</span>
                    </span>
                    <span className="text-right">
                      <span className="block tabular-nums">{formatCurrency(invoice.amount)}</span>
                      <span className="text-xs text-muted-foreground">{invoice.status}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <p className="text-sm font-medium">Activity</p>
            {logs.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {logs.map((log) => (
                  <li key={log.id}>
                    <p className="text-sm leading-relaxed">{log.message}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {log.channel} · {formatDate(log.sent_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-xs text-muted-foreground">
            {client.email} · {client.phone}
            {client.address ? ` · ${client.address}` : ''}
          </p>
        </div>
      </aside>
    </div>
  )
}

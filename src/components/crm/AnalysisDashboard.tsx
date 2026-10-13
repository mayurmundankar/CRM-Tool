"use client"

import { Client, Inquiry, Invoice, Project, ProjectDeliverable, StudioTask } from "@/types/crm"
import { formatCurrency } from "@/lib/format"
import { PIPELINE_STAGES } from "@/lib/studio"
import { buildTodayItems, factualBriefing, TodayItem } from "@/lib/today"
import { generateWithGroq } from "@/lib/groq-client"
import { PageHeading } from "@/components/crm/PageHeading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import * as React from "react"

interface AnalysisDashboardProps {
  clients: Client[]
  inquiries: Inquiry[]
  invoices: Invoice[]
  deliverables: ProjectDeliverable[]
  projects?: Project[]
  tasks?: StudioTask[]
  onOpenSection: (section: string) => void
  onOpenInsight?: (item: TodayItem) => void
  onCompleteTask?: (id: string) => void
  onAddTask?: (title: string) => void
}

export function AnalysisDashboard({
  clients,
  inquiries,
  invoices,
  deliverables,
  projects = [],
  tasks = [],
  onOpenSection,
  onOpenInsight,
  onCompleteTask,
  onAddTask,
}: AnalysisDashboardProps) {
  const pipelineValue = clients.reduce((sum, client) => sum + (client.budget || 0), 0)
  const openInquiries = inquiries.filter((inquiry) => inquiry.status === 'New' || inquiry.status === 'Qualified')
  const outstanding = invoices
    .filter((invoice) => invoice.status === 'Pending' || invoice.status === 'Overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const hoursSaved = deliverables.reduce((sum, item) => sum + (item.time_saved_min || 0), 0) / 60
  const collected = invoices.filter((invoice) => invoice.status === 'Paid').reduce((sum, invoice) => sum + invoice.amount, 0)

  const stageRows = PIPELINE_STAGES.map((stage) => {
    const stageClients = clients.filter((client) => client.stage === stage.id)
    return {
      ...stage,
      count: stageClients.length,
      value: stageClients.reduce((sum, client) => sum + client.budget, 0),
    }
  })
  const maxCount = Math.max(...stageRows.map((row) => row.count), 1)

  const invoiceRows = (['Paid', 'Pending', 'Overdue'] as const).map((status) => {
    const rows = invoices.filter((invoice) => invoice.status === status)
    return {
      status,
      count: rows.length,
      amount: rows.reduce((sum, invoice) => sum + invoice.amount, 0),
    }
  })

  const kpis = [
    { label: 'Pipeline value', value: formatCurrency(pipelineValue), detail: `${clients.length} clients`, section: 'pipeline' },
    { label: 'Open inquiries', value: String(openInquiries.length), detail: `${inquiries.length} total`, section: 'inquiries' },
    { label: 'Outstanding', value: formatCurrency(outstanding), detail: `${formatCurrency(collected)} collected`, section: 'invoices' },
    { label: 'Hours saved', value: hoursSaved.toFixed(1), detail: 'From automated sheets', section: 'deliverables' },
  ]

  const todayItems = React.useMemo(
    () => buildTodayItems({ clients, projects, deliverables, invoices, inquiries, tasks }),
    [clients, projects, deliverables, invoices, inquiries, tasks]
  )
  const recordBriefing = factualBriefing(todayItems)
  const [briefing, setBriefing] = React.useState(recordBriefing)
  const [taskTitle, setTaskTitle] = React.useState('')

  React.useEffect(() => {
    setBriefing(recordBriefing)
    let cancelled = false
    const facts = todayItems.map((item) => `- ${item.title}. ${item.reason}`).join('\n') || '- none'
    void generateWithGroq({
      task: 'chat',
      systemPrompt: 'You write a one or two sentence daily briefing for an interior design studio. Use only the facts given. Do not invent names, amounts, or dates. Do not use markdown.',
      prompt: `Rewrite this briefing in the same facts, as a short spoken note:\n${recordBriefing}\n\nItems:\n${facts}`,
    }).then((result) => {
      if (!cancelled && result.content) setBriefing(result.content.trim())
    })
    return () => {
      cancelled = true
    }
  }, [recordBriefing, todayItems])

  return (
    <div>
      <PageHeading
        eyebrow="Studio"
        title="What needs attention today"
        description="A briefing from the records in this studio, then the pipeline, inquiries, fees, and hours saved."
      />

      <section className="mb-6 rounded-lg border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Today</p>
          <p className="mt-2 text-sm leading-relaxed">{briefing}</p>
        </div>
        {todayItems.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">No overdue work, pending approvals, or unpaid invoices.</p>
        ) : (
          <ul className="divide-y divide-border">
            {todayItems.map((item) => {
              const taskId = item.id.startsWith('task-') ? item.id.slice(5) : ''
              return (
                <li key={item.id} className="flex items-start justify-between gap-3 px-5 py-3">
                  <button
                    type="button"
                    onClick={() => (onOpenInsight ? onOpenInsight(item) : onOpenSection(item.section))}
                    className="min-w-0 text-left"
                  >
                    <p className="text-sm">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p>
                  </button>
                  {taskId && onCompleteTask && (
                    <Button type="button" variant="outline" size="sm" className="h-7 shrink-0 text-xs" onClick={() => onCompleteTask(taskId)}>
                      Done
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        )}
        {onAddTask && (
          <form
            className="flex gap-2 border-t border-border px-5 py-3"
            onSubmit={(event) => {
              event.preventDefault()
              if (!taskTitle.trim()) return
              onAddTask(taskTitle.trim())
              setTaskTitle('')
            }}
          >
            <input
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Add a follow-up for tomorrow"
              className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm"
            />
            <Button type="submit" size="sm" variant="outline" className="h-8 text-xs" disabled={!taskTitle.trim()}>
              Add task
            </Button>
          </form>
        )}
      </section>

      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => onOpenSection(kpi.section)}
            className="bg-card px-4 py-4 text-left hover:bg-muted/60"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{kpi.label}</p>
            <p className="mt-2 text-2xl font-medium tracking-tight tabular-nums">{kpi.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{kpi.detail}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="rounded-lg border border-border bg-card p-5 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium">Pipeline by stage</h2>
            <button type="button" onClick={() => onOpenSection('pipeline')} className="text-xs text-muted-foreground hover:text-foreground">
              Open pipeline
            </button>
          </div>
          <div className="space-y-3">
            {stageRows.map((row) => (
              <div key={row.id} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-3">
                <p className="truncate text-xs text-muted-foreground">{row.label}</p>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground/80"
                    style={{ width: `${row.count === 0 ? 0 : Math.max((row.count / maxCount) * 100, 8)}%` }}
                  />
                </div>
                <p className="text-right text-xs tabular-nums text-muted-foreground">
                  {row.count} · {formatCurrency(row.value)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium">Invoices</h2>
            <button type="button" onClick={() => onOpenSection('invoices')} className="text-xs text-muted-foreground hover:text-foreground">
              Open invoices
            </button>
          </div>
          <div className="space-y-4">
            {invoiceRows.map((row) => (
              <div key={row.status} className="flex items-center justify-between gap-3">
                <div>
                  <Badge variant={row.status === 'Overdue' ? 'destructive' : row.status === 'Paid' ? 'emerald' : 'secondary'}>
                    {row.status}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">{row.count === 1 ? '1 invoice' : `${row.count} invoices`}</p>
                </div>
                <p className="text-sm font-medium tabular-nums">{formatCurrency(row.amount)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-medium">Recent inquiries</h2>
          <button type="button" onClick={() => onOpenSection('inquiries')} className="text-xs text-muted-foreground hover:text-foreground">
            Open inbox
          </button>
        </div>
        {inquiries.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">No inquiries yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {inquiries.slice(0, 4).map((inquiry) => (
              <li key={inquiry.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm">{inquiry.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {inquiry.property_type} · {inquiry.lead_source}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm tabular-nums">{formatCurrency(inquiry.budget)}</p>
                  <p className="text-xs text-muted-foreground">{inquiry.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

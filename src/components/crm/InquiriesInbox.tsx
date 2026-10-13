"use client"

import * as React from "react"
import { Inquiry, InquiryStatus, LeadSource, PropertyType } from "@/types/crm"
import { formatCurrency, formatDate } from "@/lib/format"
import { LEAD_SOURCES, PROPERTY_TYPES } from "@/lib/studio"
import { PageHeading } from "@/components/crm/PageHeading"
import { FilterSelect, SearchField } from "@/components/crm/filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const STATUSES: InquiryStatus[] = ['New', 'Qualified', 'Converted', 'Archived']

interface InquiriesInboxProps {
  inquiries: Inquiry[]
  onCreate: (input: Omit<Inquiry, 'id' | 'created_at' | 'status'>) => Promise<void>
  onStatusChange: (id: string, status: InquiryStatus) => Promise<void>
  onConvert: (inquiry: Inquiry) => Promise<void>
}

export function InquiriesInbox({ inquiries, onCreate, onStatusChange, onConvert }: InquiriesInboxProps) {
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState('ALL')
  const [source, setSource] = React.useState('ALL')
  const [open, setOpen] = React.useState(false)
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    phone: '',
    property_type: 'Penthouse' as PropertyType,
    budget: 150000,
    lead_source: 'Website' as LeadSource,
    message: '',
  })

  const filtered = inquiries.filter((inquiry) => {
    const query = search.toLowerCase()
    const matchesSearch =
      !query ||
      inquiry.name.toLowerCase().includes(query) ||
      inquiry.email.toLowerCase().includes(query) ||
      inquiry.message.toLowerCase().includes(query)
    const matchesStatus = status === 'ALL' || inquiry.status === status
    const matchesSource = source === 'ALL' || inquiry.lead_source === source
    return matchesSearch && matchesStatus && matchesSource
  })

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.name || !form.email) return
    await onCreate(form)
    setOpen(false)
    setForm({
      name: '',
      email: '',
      phone: '',
      property_type: 'Penthouse',
      budget: 150000,
      lead_source: 'Website',
      message: '',
    })
  }

  return (
    <div>
      <PageHeading
        eyebrow="Inbox"
        title="Client inquiries"
        description="Briefs that are not clients yet. Qualify them, then convert a fit into a lead on the pipeline."
        action={
          <Button type="button" size="sm" onClick={() => setOpen(true)}>
            New inquiry
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchField value={search} onChange={setSearch} placeholder="Search name, email, or brief" />
        <FilterSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[{ value: 'ALL', label: 'All statuses' }, ...STATUSES.map((item) => ({ value: item, label: item }))]}
        />
        <FilterSelect
          label="Source"
          value={source}
          onChange={setSource}
          options={[{ value: 'ALL', label: 'All sources' }, ...LEAD_SOURCES.map((item) => ({ value: item, label: item }))]}
        />
        <span className="text-xs text-muted-foreground">{filtered.length} shown</span>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">No inquiries match this view.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Inquiry</th>
                <th className="px-4 py-2.5 font-medium">Property</th>
                <th className="px-4 py-2.5 font-medium">Budget</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filtered.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium">{inquiry.name}</p>
                    <p className="text-xs text-muted-foreground">{inquiry.email}</p>
                    <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{inquiry.message}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {inquiry.lead_source} · {formatDate(inquiry.created_at)}
                    </p>
                  </td>
                  <td className="px-4 py-3 align-top text-xs">{inquiry.property_type}</td>
                  <td className="px-4 py-3 align-top text-sm tabular-nums">{formatCurrency(inquiry.budget)}</td>
                  <td className="px-4 py-3 align-top">
                    <select
                      aria-label={`Status for ${inquiry.name}`}
                      value={inquiry.status}
                      onChange={(event) => onStatusChange(inquiry.id, event.target.value as InquiryStatus)}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      {STATUSES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right align-top">
                    {inquiry.status === 'Converted' ? (
                      <Badge variant="secondary">Client</Badge>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={inquiry.status === 'Archived' || busyId === inquiry.id}
                        onClick={async () => {
                          setBusyId(inquiry.id)
                          await onConvert(inquiry)
                          setBusyId(null)
                        }}
                      >
                        Convert
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New inquiry</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              <Input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              <Input placeholder="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              <Input
                type="number"
                placeholder="Budget"
                value={form.budget}
                onChange={(event) => setForm({ ...form, budget: Number(event.target.value) })}
              />
              <select
                aria-label="Property type"
                value={form.property_type}
                onChange={(event) => setForm({ ...form, property_type: event.target.value as PropertyType })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {PROPERTY_TYPES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <select
                aria-label="Lead source"
                value={form.lead_source}
                onChange={(event) => setForm({ ...form, lead_source: event.target.value as LeadSource })}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {LEAD_SOURCES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
            <Textarea
              rows={3}
              placeholder="What are they asking for?"
              value={form.message}
              onChange={(event) => setForm({ ...form, message: event.target.value })}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Save inquiry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

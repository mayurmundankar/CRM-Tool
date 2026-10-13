"use client"

import * as React from "react"
import { Client, Invoice, Project } from "@/types/crm"
import { formatCurrency, formatDate } from "@/lib/format"
import { PageHeading } from "@/components/crm/PageHeading"
import { FilterSelect, SearchField } from "@/components/crm/filters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface InvoicesTrackerProps {
  invoices: Invoice[]
  clients: Client[]
  projects: Project[]
  onCreate: (input: Omit<Invoice, 'id' | 'invoice_number' | 'issue_date'>) => Promise<void>
  onStatusChange: (invoice: Invoice, status: Invoice['status']) => Promise<void>
}

export function InvoicesTracker({ invoices, clients, projects, onCreate, onStatusChange }: InvoicesTrackerProps) {
  const [search, setSearch] = React.useState('')
  const [status, setStatus] = React.useState('ALL')
  const [open, setOpen] = React.useState(false)
  const [clientId, setClientId] = React.useState(clients[0]?.id || '')
  const [description, setDescription] = React.useState('')
  const [amount, setAmount] = React.useState(12000)
  const [dueDate, setDueDate] = React.useState('')

  const totalBilled = invoices.reduce((acc, invoice) => acc + invoice.amount, 0)
  const totalPaid = invoices.filter((invoice) => invoice.status === 'Paid').reduce((acc, invoice) => acc + invoice.amount, 0)
  const totalPending = invoices
    .filter((invoice) => invoice.status === 'Pending' || invoice.status === 'Overdue')
    .reduce((acc, invoice) => acc + invoice.amount, 0)

  const filtered = invoices.filter((invoice) => {
    const query = search.toLowerCase()
    const matchesSearch =
      !query ||
      invoice.client_name.toLowerCase().includes(query) ||
      invoice.invoice_number.toLowerCase().includes(query) ||
      invoice.description.toLowerCase().includes(query)
    return matchesSearch && (status === 'ALL' || invoice.status === status)
  })

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const client = clients.find((item) => item.id === clientId)
    if (!client || !description) return
    const project = projects.find((item) => item.client_id === client.id)
    await onCreate({
      project_id: project?.id || '',
      client_id: client.id,
      client_name: client.name,
      description,
      amount: Number(amount) || 0,
      status: 'Pending',
      due_date: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    })
    setDescription('')
    setOpen(false)
  }

  return (
    <div>
      <PageHeading
        eyebrow="Fees"
        title="Invoices"
        description="Retainers and milestone fees. Mark a row paid or overdue and it stays on the client record."
        action={
          <Button type="button" size="sm" onClick={() => setOpen(true)} disabled={clients.length === 0}>
            New invoice
          </Button>
        }
      />

      <div className="mb-6 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
        {[
          { label: 'Invoiced', value: formatCurrency(totalBilled) },
          { label: 'Collected', value: formatCurrency(totalPaid) },
          { label: 'Outstanding', value: formatCurrency(totalPending) },
        ].map((item) => (
          <div key={item.label} className="bg-card px-4 py-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-medium tracking-tight tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchField value={search} onChange={setSearch} placeholder="Search client or invoice" />
        <FilterSelect
          label="Invoice status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'ALL', label: 'All statuses' },
            { value: 'Paid', label: 'Paid' },
            { value: 'Pending', label: 'Pending' },
            { value: 'Overdue', label: 'Overdue' },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-sm text-muted-foreground">No invoices in this view.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Invoice</th>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">Description</th>
                <th className="px-4 py-2.5 font-medium">Amount</th>
                <th className="px-4 py-2.5 font-medium">Due</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filtered.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-4 py-3 font-mono text-xs">{invoice.invoice_number}</td>
                  <td className="px-4 py-3">{invoice.client_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{invoice.description}</td>
                  <td className="px-4 py-3 tabular-nums">{formatCurrency(invoice.amount)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(invoice.due_date)}</td>
                  <td className="px-4 py-3">
                    <select
                      aria-label={`Status for ${invoice.invoice_number}`}
                      value={invoice.status}
                      onChange={(event) => onStatusChange(invoice, event.target.value as Invoice['status'])}
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                    <Badge
                      variant={invoice.status === 'Paid' ? 'emerald' : invoice.status === 'Overdue' ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      {invoice.status}
                    </Badge>
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
            <DialogTitle>New invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <select
              aria-label="Client"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <Input placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" aria-label="Amount" value={amount} onChange={(event) => setAmount(Number(event.target.value))} />
              <Input type="date" aria-label="Due date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">Issue invoice</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

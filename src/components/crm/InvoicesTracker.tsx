"use client"

import * as React from "react"
import { Invoice } from "@/types/crm"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, CheckCircle2, Clock, AlertTriangle, FileText, Download } from "lucide-react"

interface InvoicesTrackerProps {
  invoices: Invoice[]
}

export function InvoicesTracker({ invoices }: InvoicesTrackerProps) {
  const totalBilled = invoices.reduce((acc, i) => acc + i.amount, 0)
  const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.amount, 0)
  const totalPending = invoices.filter(i => i.status === 'Pending').reduce((acc, i) => acc + i.amount, 0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/60 pb-5">
        <div className="flex items-center gap-2">
          <Badge variant="gold" className="gap-1 text-xs">
            <DollarSign className="h-3 w-3" /> Financials & Milestone Billing
          </Badge>
          <span className="text-xs text-muted-foreground">Interior Architecture Contracts & Fee Schedules</span>
        </div>
        <h2 className="text-2xl font-bold font-serif tracking-tight text-foreground mt-1">
          Project Invoices & Fee Tracking
        </h2>
        <p className="text-sm text-muted-foreground">
          Track stage retainers, automated Revit documentation milestone fees, and contractor procurement invoices.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-border/80 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Invoiced</span>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold mt-1 text-foreground font-serif">
            {formatCurrency(totalBilled)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Across all interior design projects</p>
        </Card>

        <Card className="p-4 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Total Collected</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400 font-serif">
            {formatCurrency(totalPaid)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Settled milestones</p>
        </Card>

        <Card className="p-4 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending Milestone Balance</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400 font-serif">
            {formatCurrency(totalPending)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Awaiting client release</p>
        </Card>
      </div>

      {/* Invoices List */}
      <Card className="border-border/80 overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-foreground" /> Active Invoices & Retainers
          </CardTitle>
          <CardDescription>
            Milestone billing linked to Revit BIM package signoffs.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No invoices issued yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-xs uppercase text-muted-foreground border-b border-border">
                  <tr>
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Client & Project</th>
                    <th className="p-3.5">Phase Description</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Due Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-mono text-xs font-semibold">{inv.invoice_number}</td>
                      <td className="p-3.5">
                        <div className="font-medium">{inv.client_name}</div>
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground max-w-xs truncate">
                        {inv.description}
                      </td>
                      <td className="p-3.5 font-semibold text-foreground">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground">
                        {new Date(inv.due_date).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={inv.status === 'Paid' ? 'emerald' : inv.status === 'Overdue' ? 'destructive' : 'gold'}
                          className="text-[10px]"
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                          <Download className="h-3 w-3" />
                          PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

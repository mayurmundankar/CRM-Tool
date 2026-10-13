"use client"

import Link from "next/link"
import { ThemeToggle } from "@/components/crm/ThemeToggle"
import { Button } from "@/components/ui/button"

const features = [
  {
    title: 'Inquiries',
    body: 'Hold a brief before it becomes a client. Qualify it, archive it, or convert it onto the pipeline.',
  },
  {
    title: 'Pipeline',
    body: 'Eight studio stages, from inbound lead to handover. Filter by property, style, source, and budget.',
  },
  {
    title: 'Analysis',
    body: 'See pipeline value, open inquiries, outstanding fees, and hours saved on sheets without a separate report.',
  },
  {
    title: 'Deliverables',
    body: 'Track lighting, plumbing, elevations, and material schedules, with a status the client can approve.',
  },
  {
    title: 'Client portal',
    body: 'Give a client one view of progress and sheets. Approval and change requests stay on the project.',
  },
  {
    title: 'Messages',
    body: 'Draft WhatsApp updates and keep a log. This is a studio record, not a live WhatsApp connection.',
  },
  {
    title: 'Spec studio',
    body: 'Turn a room brief into lighting, plumbing, and millwork notes you can paste into a Revit schedule.',
  },
  {
    title: 'Studio Chat',
    body: 'Ask about any client or project. The answer is drawn from the records already in the studio.',
  },
  {
    title: 'Invoices',
    body: 'Issue a retainer or milestone fee and mark it paid or overdue. The balance shows on the client record.',
  },
  {
    title: 'Client record',
    body: 'Open a client for notes, stage, sheets, invoices, and the activity on that project.',
  },
]

const steps = [
  { n: '01', title: 'Inquiry', body: 'A brief arrives with a property, a budget, and a source.' },
  { n: '02', title: 'Client', body: 'Convert the fit. A project opens in Lead Inbound.' },
  { n: '03', title: 'Drawings', body: 'Move the stage as concept becomes a BIM set.' },
  { n: '04', title: 'Approval', body: 'The client reviews sheets in the portal.' },
  { n: '05', title: 'Invoice', body: 'Bill the milestone against the same client.' },
]

export function MarketingHome() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <div>
          <p className="text-sm font-medium tracking-tight">FlowMS</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/studio">Open studio</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 pb-20">
        <section className="border-b border-border py-16 sm:py-24">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Interior design CRM
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight text-foreground sm:text-5xl sm:leading-[1.1]">
            One studio record from the first brief to the last invoice.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            FlowMS is for interior studios that issue Revit drawings. It keeps the inquiry, the client, the sheets, the approval, and the fee in the same place.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Button asChild>
              <Link href="/studio">Open the studio</Link>
            </Button>
            <a href="#why" className="text-sm text-muted-foreground hover:text-foreground">
              Why use it
            </a>
          </div>
        </section>

        <section id="why" className="grid gap-10 border-b border-border py-16 sm:grid-cols-12">
          <div className="sm:col-span-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Why use it</p>
            <h2 className="mt-3 text-2xl font-medium tracking-tight">The work already has a sequence. The tool should follow it.</h2>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:col-span-8">
            <p>
              A lead is not a drawing, and a drawing is not an invoice, but they belong to the same client. Most of the mess in a small studio is that those records live in different inboxes.
            </p>
            <p>
              FlowMS keeps that path in one workspace: inbound brief, consultation, concept, schematic, BIM, procurement, site, handover. Filters narrow the board. Analysis shows what is open, what is unpaid, and how much drafting time the sheets have already saved.
            </p>
            <p>
              It is built for a design studio, not a generic sales team. Property type, style, square footage, sheet numbers, and client sign-off are part of the record.
            </p>
          </div>
        </section>

        <section className="border-b border-border py-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">What is inside</p>
          <h2 className="mt-3 max-w-xl text-2xl font-medium tracking-tight">The tools the studio actually opens.</h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {features.map((feature) => (
              <article key={feature.title} className="bg-card p-5">
                <h3 className="text-sm font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="py-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">How a project moves</p>
          <h2 className="mt-3 text-2xl font-medium tracking-tight">Inquiry, client, drawings, approval, invoice.</h2>
          <ol className="mt-8 divide-y divide-border border-y border-border">
            {steps.map((step) => (
              <li key={step.n} className="grid gap-2 py-4 sm:grid-cols-[4rem_10rem_1fr] sm:items-baseline">
                <span className="text-xs tabular-nums text-muted-foreground">{step.n}</span>
                <span className="text-sm font-medium">{step.title}</span>
                <span className="text-sm text-muted-foreground">{step.body}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10">
            <Button asChild>
              <Link href="/studio">Start in the studio</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 text-xs text-muted-foreground">
          <span>FlowMS</span>
          <span>Interior studio CRM</span>
        </div>
      </footer>
    </div>
  )
}

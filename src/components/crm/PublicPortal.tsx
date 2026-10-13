"use client"

import * as React from "react"
import { Client, Project, ProjectDeliverable } from "@/types/crm"
import { ClientPortalView } from "@/components/crm/ClientPortalView"
import { SheetComment, SheetRevision } from "@/lib/sheet-notes"

interface PublicPortalProps {
  client: Client
  project: Project | null
  deliverables: ProjectDeliverable[]
  comments: SheetComment[]
  revisions: SheetRevision[]
  signature: string
}

export function PublicPortal({ client, project, deliverables, comments, revisions, signature }: PublicPortalProps) {
  const [sheets, setSheets] = React.useState(deliverables)
  const [sheetComments, setSheetComments] = React.useState(comments)
  const [sheetRevisions, setSheetRevisions] = React.useState(revisions)
  const [notice, setNotice] = React.useState<string | null>(null)

  const fallbackProject: Project = project || {
    id: 'unlinked',
    client_id: client.id,
    client_name: client.name,
    name: `${client.name} project`,
    property_type: client.property_type,
    stage: client.stage,
    progress_pct: 0,
    target_date: '',
    total_budget: client.budget,
    spent_budget: 0,
    revit_version: 'Revit 2026.1 (LOD 350)',
    deliverables_count: sheets.length,
    created_at: client.created_at,
  }

  const act = async (action: 'approve' | 'changes' | 'comment', deliverableId: string, note: string) => {
    setNotice(null)
    const res = await fetch('/api/portal-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id, signature, deliverableId, action, note }),
    })
    const data = await res.json()
    if (!res.ok) {
      setNotice(data.error || 'That could not be saved.')
      return
    }
    const sheet = sheets.find((item) => item.id === deliverableId)
    if (action === 'comment') {
      setSheetComments((current) => [
        { id: crypto.randomUUID(), deliverableId, body: note, createdAt: new Date().toISOString() },
        ...current,
      ])
      return
    }
    const status = action === 'approve' ? 'Approved' : 'Changes Requested'
    setSheets((current) => current.map((item) => (item.id === deliverableId ? { ...item, status, client_feedback: note || item.client_feedback } : item)))
    if (sheet) {
      setSheetRevisions((current) => [
        {
          id: crypto.randomUUID(),
          deliverableId,
          version: sheet.version,
          status,
          note: `Revision ${sheet.version} of ${sheet.sheet_number} marked ${status}.`,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ])
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {notice && <p className="mb-4 text-sm text-destructive">{notice}</p>}
      <ClientPortalView
        mode="client"
        client={client}
        project={fallbackProject}
        deliverables={sheets}
        comments={sheetComments}
        revisions={sheetRevisions}
        onApproveDeliverable={(id, feedback) => void act('approve', id, feedback || '')}
        onRequestChanges={(id, feedback) => void act('changes', id, feedback)}
        onAddComment={(id, body) => void act('comment', id, body)}
      />
    </main>
  )
}

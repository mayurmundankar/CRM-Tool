import { Suspense } from 'react'
import { verifyPortalClient } from '@/lib/portal-link'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { commentsFor, revisionsFor } from '@/lib/sheet-notes'
import { Client, CommunicationLog, Project, ProjectDeliverable } from '@/types/crm'
import { PublicPortal } from '@/components/crm/PublicPortal'

export default function ClientPortalPage({
  params,
}: {
  params: Promise<{ clientId: string; signature: string }>
}) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-lg px-4 py-16 text-sm text-muted-foreground">Opening the project…</main>}>
      <PortalBody params={params} />
    </Suspense>
  )
}

async function PortalBody({
  params,
}: {
  params: Promise<{ clientId: string; signature: string }>
}) {
  const { clientId, signature } = await params
  if (!verifyPortalClient(clientId, signature)) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-lg font-medium">This project link is not valid</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ask the studio for a new link to your drawings.</p>
      </main>
    )
  }
  if (!isSupabaseConfigured || !supabase) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-lg font-medium">Project portal is unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">The studio database is not connected.</p>
      </main>
    )
  }

  const { data: client } = await supabase.from('clients').select('*').eq('id', clientId).single()
  if (!client) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="text-lg font-medium">Project not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This link does not match a client in the studio.</p>
      </main>
    )
  }

  const { data: projects } = await supabase.from('projects').select('*').eq('client_id', clientId).order('created_at', { ascending: false })
  const project = (projects?.[0] || null) as Project | null
  const { data: deliverables } = project
    ? await supabase.from('deliverables').select('*').eq('project_id', project.id).order('updated_at', { ascending: false })
    : { data: [] }
  const { data: logs } = await supabase.from('communication_logs').select('*').eq('client_id', clientId).order('sent_at', { ascending: false })

  const sheetLogs = (logs || []) as CommunicationLog[]
  const sheets = (deliverables || []) as ProjectDeliverable[]

  return (
    <PublicPortal
      client={client as Client}
      project={project}
      deliverables={sheets}
      comments={sheets.flatMap((sheet) => commentsFor(sheetLogs, sheet.id))}
      revisions={sheets.flatMap((sheet) => revisionsFor(sheetLogs, sheet.id))}
      signature={signature}
    />
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { verifyPortalClient } from '@/lib/portal-link'
import { commentMessage, revisionMessage } from '@/lib/sheet-notes'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const clientId = String(body?.clientId || '')
  const signature = String(body?.signature || '')
  const deliverableId = String(body?.deliverableId || '')
  const action = String(body?.action || '')
  const note = String(body?.note || '').trim()

  if (!verifyPortalClient(clientId, signature)) {
    return NextResponse.json({ error: 'This project link is not valid.' }, { status: 403 })
  }
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({ error: 'The studio database is not connected.' }, { status: 503 })
  }
  if (!deliverableId || !['approve', 'changes', 'comment'].includes(action)) {
    return NextResponse.json({ error: 'This review could not be saved.' }, { status: 400 })
  }
  if ((action === 'changes' || action === 'comment') && !note) {
    return NextResponse.json({ error: 'Add a note so the studio knows what to change.' }, { status: 400 })
  }

  const { data: deliverable, error: lookupError } = await supabase
    .from('deliverables')
    .select('id, project_id, title, sheet_number, version, status')
    .eq('id', deliverableId)
    .single()
  if (lookupError || !deliverable) {
    return NextResponse.json({ error: 'That sheet could not be found.' }, { status: 404 })
  }

  const { data: project } = await supabase.from('projects').select('id, client_id, client_name').eq('id', deliverable.project_id).single()
  if (!project || project.client_id !== clientId) {
    return NextResponse.json({ error: 'That sheet is not on this project.' }, { status: 403 })
  }

  if (action === 'approve' || action === 'changes') {
    const status = action === 'approve' ? 'Approved' : 'Changes Requested'
    const { error } = await supabase
      .from('deliverables')
      .update({
        status,
        client_feedback: note || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliverableId)
    if (error) return NextResponse.json({ error: 'The review could not be saved.' }, { status: 500 })

    await supabase.from('communication_logs').insert([{
      client_id: clientId,
      client_name: project.client_name,
      channel: 'system',
      recipient_phone_or_email: 'studio',
      trigger_type: 'approval_request',
      message: revisionMessage(deliverableId, deliverable.version || 'v1.0', status, deliverable.sheet_number, note),
      status: 'delivered',
    }])
    return NextResponse.json({ ok: true, status })
  }

  const { error } = await supabase.from('communication_logs').insert([{
    client_id: clientId,
    client_name: project.client_name,
    channel: 'system',
    recipient_phone_or_email: 'studio',
    trigger_type: 'manual',
    message: commentMessage(deliverableId, deliverable.sheet_number, note),
    status: 'delivered',
  }])
  if (error) return NextResponse.json({ error: 'The comment could not be saved.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}

import { Client, Invoice, PipelineStage, Project, ProjectDeliverable, Inquiry } from '@/types/crm'
import { PIPELINE_STAGES } from '@/lib/studio'
import { ClientConsent } from '@/lib/consent'
import { formatCurrency, formatDate } from '@/lib/format'

export type StudioAction =
  | { kind: 'create_task'; title: string; clientId?: string; clientName?: string; dueDate: string }
  | {
      kind: 'draft_update'
      recipients: { clientId: string; clientName: string; email: string; phone: string; canSend: boolean }[]
      message: string
    }
  | {
      kind: 'prepare_invoice'
      clientId: string
      clientName: string
      projectId: string
      description: string
      amount: number
      dueDate: string
    }
  | { kind: 'move_stage'; clientId: string; clientName: string; from: PipelineStage; stage: PipelineStage }
  | { kind: 'create_client'; name: string; email: string; phone: string }
  | { kind: 'delayed_projects'; lines: string[] }

export interface ActionProposal {
  summary: string
  preview: string
  reason: string
  action: StudioAction
  needsApproval: boolean
  ready: boolean
  blockReason?: string
}

interface Snapshot {
  clients: Client[]
  projects: Project[]
  deliverables: ProjectDeliverable[]
  invoices: Invoice[]
  inquiries: Inquiry[]
}

function localDate(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function findClient(clients: Client[], text: string) {
  const haystack = text.toLowerCase()
  return clients.find((client) => haystack.includes(client.name.toLowerCase()))
}

function findStage(text: string): PipelineStage | undefined {
  const haystack = text.toLowerCase()
  return PIPELINE_STAGES.find((stage) => haystack.includes(stage.id.toLowerCase()) || haystack.includes(stage.label.toLowerCase()))?.id
}

function delayedProjects(snapshot: Snapshot) {
  const today = localDate()
  return snapshot.projects.filter((project) => {
    const target = project.target_date?.slice(0, 10)
    return Boolean(target && target < today && project.stage !== 'Handover & Reveal')
  })
}

export function proposeStudioAction(
  text: string,
  snapshot: Snapshot,
  consentFor: (clientId: string) => ClientConsent
): ActionProposal | null {
  const question = text.trim()
  const lower = question.toLowerCase()

  if (/^create a task\b/.test(lower)) {
    const title = question.replace(/^create a task(?: to)?\s*/i, '').replace(/\.$/, '')
    const client = findClient(snapshot.clients, question)
    const dueDate = localDate(1)
    if (!title) {
      return {
        summary: 'A task needs a description.',
        preview: 'Say what the follow-up is.',
        reason: 'The request did not include the task itself.',
        action: { kind: 'create_task', title: '', dueDate },
        needsApproval: true,
        ready: false,
        blockReason: 'Add what the studio should follow up on.',
      }
    }
    return {
      summary: 'Create this follow-up task.',
      preview: `${title}\nDue ${dueDate}${client ? `\nClient: ${client.name}` : ''}`,
      reason: 'Tasks are created only after you approve them.',
      action: { kind: 'create_task', title, clientId: client?.id, clientName: client?.name, dueDate },
      needsApproval: true,
      ready: true,
    }
  }

  if (/draft an update/.test(lower)) {
    const waiting = snapshot.deliverables.filter((item) => item.status === 'Pending Review')
    const recipients = waiting.flatMap((item) => {
      const project = snapshot.projects.find((row) => row.id === item.project_id)
      const client = snapshot.clients.find((row) => row.id === project?.client_id)
      if (!client) return []
      const consent = consentFor(client.id)
      return [{
        clientId: client.id,
        clientName: client.name,
        email: client.email,
        phone: client.phone,
        canSend: consent.email || consent.whatsapp,
        sheet: item.sheet_number,
      }]
    })
    const unique = recipients.filter((row, index) => recipients.findIndex((item) => item.clientId === row.clientId) === index)
    if (!unique.length) {
      return {
        summary: 'No approval update to draft.',
        preview: 'No sheets are waiting for client review.',
        reason: 'A draft is only offered when a sheet is Pending Review.',
        action: { kind: 'draft_update', recipients: [], message: '' },
        needsApproval: true,
        ready: false,
        blockReason: 'There are no clients waiting on an approval.',
      }
    }
    const message = unique
      .map((row) => `Hello ${row.clientName}, a drawing is waiting for your review. Open your project link, then approve it or tell us what to change.`)
      .join('\n\n')
    const canSend = unique.some((row) => row.canSend)
    return {
      summary: canSend ? 'Draft an approval update and send it where consent exists.' : 'Draft an approval update for the project log.',
      preview: unique.map((row) => `${row.clientName}${row.canSend ? ' · will send' : ' · log only, no consent'}`).join('\n') + `\n\n${message}`,
      reason: 'Messages are not sent until you approve this draft. Clients without consent are logged only.',
      action: { kind: 'draft_update', recipients: unique, message },
      needsApproval: true,
      ready: true,
    }
  }

  if (/milestone invoice|prepare an invoice|issue an invoice|create an invoice/.test(lower)) {
    const named = findClient(snapshot.clients, question)
    const project = named
      ? snapshot.projects.find((row) => row.client_id === named.id)
      : snapshot.projects.find((row) => row.stage !== 'Handover & Reveal') || snapshot.projects[0]
    const client = named || snapshot.clients.find((row) => row.id === project?.client_id) || snapshot.clients[0]
    if (!client) {
      return {
        summary: 'No client to invoice.',
        preview: 'Add a client first.',
        reason: 'An invoice has to belong to a client.',
        action: { kind: 'prepare_invoice', clientId: '', clientName: '', projectId: '', description: '', amount: 0, dueDate: localDate(14) },
        needsApproval: true,
        ready: false,
        blockReason: 'There is no client to bill.',
      }
    }
    const amountMatch = question.match(/\$?\s*(\d{3,})/)
    const basis = project?.total_budget || client.budget || 0
    const amount = amountMatch ? Number(amountMatch[1]) : Math.round(basis * 0.1)
    const dueDate = localDate(14)
    const description = `Milestone fee · ${project?.stage || client.stage}`
    return {
      summary: `Prepare a milestone invoice for ${client.name}.`,
      preview: `${description}\n${formatCurrency(amount)}\nDue ${dueDate}\n${project ? `Project: ${project.name}` : 'A project will be opened from this client if one does not exist yet.'}`,
      reason: 'The invoice is created as Pending only after you approve it. Nothing is marked paid.',
      action: {
        kind: 'prepare_invoice',
        clientId: client.id,
        clientName: client.name,
        projectId: project?.id || '',
        description,
        amount,
        dueDate,
      },
      needsApproval: true,
      ready: amount > 0,
      blockReason: amount > 0 ? undefined : 'Include an amount in the request. This record has no budget to base a fee on.',
    }
  }

  if (/delayed project|at risk|behind schedule/.test(lower)) {
    const late = delayedProjects(snapshot)
    const lines = late.map((project) => {
      return `${project.name} (${project.client_name}) targeted ${formatDate(project.target_date)} and is still in ${project.stage}. Reconfirm the date, issue the next sheet, and send a short status to the client.`
    })
    return {
      summary: late.length ? 'These projects are past their target.' : 'No projects are past their target.',
      preview: lines.join('\n\n') || 'Every open project is still on its target date.',
      reason: 'This is a suggestion from the project dates. It does not change any record.',
      action: { kind: 'delayed_projects', lines },
      needsApproval: false,
      ready: true,
    }
  }

  const move = question.match(/^move\s+(.+?)\s+to\s+(.+)$/i)
  if (move) {
    const client = findClient(snapshot.clients, move[1])
    const stage = findStage(move[2])
    if (!client || !stage) return null
    return {
      summary: `Move ${client.name} to ${stage}.`,
      preview: `From ${client.stage}\nTo ${stage}`,
      reason: 'Stage changes are applied only after you approve them.',
      action: { kind: 'move_stage', clientId: client.id, clientName: client.name, from: client.stage, stage },
      needsApproval: true,
      ready: client.stage !== stage,
      blockReason: client.stage === stage ? `${client.name} is already in ${stage}.` : undefined,
    }
  }

  if (/^create (?:a )?client\b/i.test(question)) {
    const name = (question.match(/named?\s+([^,]+?)(?=,| email| phone|$)/i) || question.match(/client\s+([^,]+?)(?=,| email| phone|$)/i))?.[1]?.trim() || ''
    const email = question.match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0] || ''
    const phone = question.match(/phone\s+([+\d][\d\s()-]{6,})/i)?.[1]?.trim() || ''
    return {
      summary: 'Create this client.',
      preview: [name || 'Name missing', email || 'Email missing', phone || 'No phone'].join('\n'),
      reason: 'A client and project are created only after you approve them.',
      action: { kind: 'create_client', name, email, phone },
      needsApproval: true,
      ready: Boolean(name && email),
      blockReason: name && email ? undefined : 'A name and email are required.',
    }
  }

  return null
}

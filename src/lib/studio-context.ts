import { Client, CommunicationLog, Inquiry, Invoice, Project, ProjectDeliverable } from '@/types/crm'
import { formatCurrency, formatDate } from '@/lib/format'

export interface StudioSnapshot {
  clients: Client[]
  projects: Project[]
  deliverables: ProjectDeliverable[]
  invoices: Invoice[]
  inquiries: Inquiry[]
  logs: CommunicationLog[]
}

export function buildStudioContext(snapshot: StudioSnapshot) {
  const projectName = (projectId: string) =>
    snapshot.projects.find((project) => project.id === projectId)?.name || 'Unlinked project'

  const clients = snapshot.clients.map((client) =>
    [
      client.name,
      client.company || 'No company',
      client.property_type,
      client.style_preference,
      client.stage,
      formatCurrency(client.budget),
      client.square_footage ? `${client.square_footage.toLocaleString()} sq ft` : 'sq ft unknown',
      client.lead_source,
      client.email,
      client.phone,
      client.city,
      client.address,
      client.notes ? `Notes: ${client.notes}` : 'No notes',
    ].join(' | ')
  )

  const projects = snapshot.projects.map((project) =>
    [
      project.name,
      project.client_name,
      project.property_type,
      project.stage,
      `${project.progress_pct}% complete`,
      `budget ${formatCurrency(project.total_budget)}`,
      `spent ${formatCurrency(project.spent_budget)}`,
      `target ${formatDate(project.target_date)}`,
      project.revit_version,
    ].join(' | ')
  )

  const deliverables = snapshot.deliverables.map((item) =>
    [
      item.sheet_number,
      item.title,
      item.type,
      item.status,
      projectName(item.project_id),
      item.version,
      item.ai_automated ? 'AI drafted' : 'Manual',
      `${item.time_saved_min} min saved`,
      item.client_feedback ? `Feedback: ${item.client_feedback}` : '',
    ].filter(Boolean).join(' | ')
  )

  const invoices = snapshot.invoices.map((invoice) =>
    [
      invoice.invoice_number,
      invoice.client_name,
      invoice.description,
      formatCurrency(invoice.amount),
      invoice.status,
      `issued ${formatDate(invoice.issue_date)}`,
      `due ${formatDate(invoice.due_date)}`,
    ].join(' | ')
  )

  const inquiries = snapshot.inquiries.map((inquiry) =>
    [
      inquiry.name,
      inquiry.status,
      inquiry.property_type,
      formatCurrency(inquiry.budget),
      inquiry.lead_source,
      inquiry.email,
      inquiry.phone,
      inquiry.message,
      formatDate(inquiry.created_at),
    ].join(' | ')
  )

  const activity = snapshot.logs.slice(0, 20).map((log) =>
    [formatDate(log.sent_at), log.client_name, log.channel, log.trigger_type, log.message].join(' | ')
  )

  return [
    'CLIENTS',
    clients.length ? clients.map((line) => `- ${line}`).join('\n') : '- none',
    '',
    'PROJECTS',
    projects.length ? projects.map((line) => `- ${line}`).join('\n') : '- none',
    '',
    'DELIVERABLES',
    deliverables.length ? deliverables.map((line) => `- ${line}`).join('\n') : '- none',
    '',
    'INVOICES',
    invoices.length ? invoices.map((line) => `- ${line}`).join('\n') : '- none',
    '',
    'INQUIRIES',
    inquiries.length ? inquiries.map((line) => `- ${line}`).join('\n') : '- none',
    '',
    'RECENT ACTIVITY',
    activity.length ? activity.map((line) => `- ${line}`).join('\n') : '- none',
  ].join('\n')
}

export function buildChatSystemPrompt(snapshot: StudioSnapshot) {
  return `You are Studio Chat inside FlowMS, an interior-design studio CRM.
Answer questions about clients, projects, inquiries, deliverables, invoices, and messages using only the studio records below.
If a name is close but not exact, match the closest client or project and say which record you used.
If the records do not contain the fact, say you do not have it. Do not invent budgets, dates, stages, sheet numbers, or invoice statuses.

Format every answer like this, with no markdown, asterisks, hashes, or tables:
First line: the client or project name.
Then one fact per line, written as "Label: value".
Use only the labels that apply, such as Project, Stage, Budget, Spent, Progress, Target, Invoice, Sheet, Status, Notes.
Leave a blank line before a second person or project.
If the question is a list, use one "Name: detail" line per item.

STUDIO RECORDS
${buildStudioContext(snapshot)}`
}

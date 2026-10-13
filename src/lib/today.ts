import { Client, Inquiry, Invoice, Project, ProjectDeliverable, StudioTask } from '@/types/crm'

export interface TodayItem {
  id: string
  title: string
  reason: string
  section: string
  clientId?: string
}

function localDate(offset = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function dateKey(value?: string) {
  if (!value) return ''
  return value.slice(0, 10)
}

export function buildTodayItems(input: {
  clients: Client[]
  projects: Project[]
  deliverables: ProjectDeliverable[]
  invoices: Invoice[]
  inquiries: Inquiry[]
  tasks: StudioTask[]
}): TodayItem[] {
  const today = localDate()
  const soon = localDate(14)
  const items: TodayItem[] = []
  const projectFor = (clientId: string) => input.projects.find((project) => project.client_id === clientId)

  input.tasks
    .filter((task) => task.status === 'Open' && dateKey(task.due_date) <= localDate(1))
    .forEach((task) => {
      const due = dateKey(task.due_date)
      const overdue = due < today
      items.push({
        id: `task-${task.id}`,
        title: task.title,
        reason: overdue
          ? `This follow-up was due ${due} and is still open.`
          : `This follow-up is due ${due}.`,
        section: 'analysis',
        clientId: task.client_id,
      })
    })

  input.inquiries
    .filter((inquiry) => inquiry.status === 'New')
    .forEach((inquiry) => {
      items.push({
        id: `inquiry-${inquiry.id}`,
        title: `Qualify ${inquiry.name}`,
        reason: `This brief is still New, from ${inquiry.lead_source}, and has not been qualified or archived.`,
        section: 'inquiries',
      })
    })

  input.deliverables
    .filter((item) => item.status === 'Pending Review')
    .forEach((item) => {
      const project = input.projects.find((row) => row.id === item.project_id)
      items.push({
        id: `approval-${item.id}`,
        title: `${item.sheet_number} is waiting for approval`,
        reason: `${item.title} was issued for review and the client has not approved it or requested changes.`,
        section: 'portal',
        clientId: project?.client_id,
      })
    })

  input.clients.forEach((client) => {
    const project = projectFor(client.id)
    const gaps: string[] = []
    if (!client.phone) gaps.push('phone')
    if (!client.address || client.address === 'To be confirmed') gaps.push('address')
    if (!client.city) gaps.push('city')
    if (project && !project.target_date) gaps.push('target date')
    if (!gaps.length) return
    items.push({
      id: `missing-${client.id}`,
      title: `${client.name} is missing project information`,
      reason: `The record has no ${gaps.join(', ')}, so the studio cannot schedule or contact them from this file.`,
      section: 'pipeline',
      clientId: client.id,
    })
  })

  input.projects.forEach((project) => {
    const target = dateKey(project.target_date)
    if (!target || project.stage === 'Handover & Reveal') return
    if (target < today) {
      items.push({
        id: `late-${project.id}`,
        title: `${project.name} is past its target`,
        reason: `The target date was ${target} and the project is still in ${project.stage}.`,
        section: 'pipeline',
        clientId: project.client_id,
      })
      return
    }
    if (target <= soon) {
      items.push({
        id: `soon-${project.id}`,
        title: `${project.name} has a milestone coming up`,
        reason: `The target date is ${target}, within the next two weeks.`,
        section: 'pipeline',
        clientId: project.client_id,
      })
    }
  })

  input.invoices.forEach((invoice) => {
    const due = dateKey(invoice.due_date)
    const pastDue = invoice.status === 'Overdue' || (invoice.status === 'Pending' && due && due < today)
    if (!pastDue) return
    items.push({
      id: `invoice-${invoice.id}`,
      title: `${invoice.invoice_number} needs follow-up`,
      reason:
        invoice.status === 'Overdue'
          ? `${invoice.client_name} was billed ${invoice.description} and the invoice is marked overdue.`
          : `${invoice.client_name} was due on ${due} and the invoice is still pending.`,
      section: 'invoices',
      clientId: invoice.client_id,
    })
  })

  return items
}

export function factualBriefing(items: TodayItem[]) {
  const delayed = items.filter((item) => item.id.startsWith('late-')).length
  const approvals = items.filter((item) => item.id.startsWith('approval-')).length
  const invoices = items.filter((item) => item.id.startsWith('invoice-')).length
  const inquiries = items.filter((item) => item.id.startsWith('inquiry-')).length
  const parts: string[] = []
  const missing = items.filter((item) => item.id.startsWith('missing-')).length
  const soon = items.filter((item) => item.id.startsWith('soon-')).length
  const tasks = items.filter((item) => item.id.startsWith('task-')).length
  if (delayed) parts.push(`${delayed} ${delayed === 1 ? 'project is' : 'projects are'} at risk of delay.`)
  if (approvals) parts.push(`${approvals} ${approvals === 1 ? 'approval is' : 'approvals are'} pending.`)
  if (invoices) parts.push(`${invoices} ${invoices === 1 ? 'invoice needs' : 'invoices need'} follow-up.`)
  if (inquiries) parts.push(`${inquiries} ${inquiries === 1 ? 'inquiry needs' : 'inquiries need'} qualification.`)
  if (missing) parts.push(`${missing} ${missing === 1 ? 'project is' : 'projects are'} missing information.`)
  if (soon) parts.push(`${soon} ${soon === 1 ? 'milestone is' : 'milestones are'} coming up.`)
  if (tasks) parts.push(`${tasks} ${tasks === 1 ? 'follow-up is' : 'follow-ups are'} open.`)
  if (!parts.length) return 'Nothing needs attention today. The studio queue is clear.'
  return parts.join(' ')
}

"use client"

import * as React from "react"
import { StudioShell } from "@/components/crm/StudioShell"
import { AnalysisDashboard } from "@/components/crm/AnalysisDashboard"
import { InquiriesInbox } from "@/components/crm/InquiriesInbox"
import { ClientPipelineKanban } from "@/components/crm/ClientPipelineKanban"
import { DeliverablesTracker } from "@/components/crm/DeliverablesTracker"
import { AiRevitSpecStudio } from "@/components/crm/AiRevitSpecStudio"
import { StudioChat } from "@/components/crm/StudioChat"
import { WhatsAppHub } from "@/components/crm/WhatsAppHub"
import { InvoicesTracker } from "@/components/crm/InvoicesTracker"
import { ClientPortalView } from "@/components/crm/ClientPortalView"
import { ClientRecordPanel } from "@/components/crm/ClientRecordPanel"
import { NewClientModal } from "@/components/crm/NewClientModal"
import { Button } from "@/components/ui/button"
import { CrmService } from "@/lib/crm-service"
import { ActionProposal } from "@/lib/studio-actions"
import { commentMessage, commentsFor, revisionMessage, revisionsFor } from "@/lib/sheet-notes"
import { readConsent } from "@/lib/consent"
import { TodayItem } from "@/lib/today"
import {
  ApprovalStatus,
  Client,
  CommunicationLog,
  Inquiry,
  InquiryStatus,
  Invoice,
  PipelineStage,
  Project,
  ProjectDeliverable,
  StudioTask,
} from "@/types/crm"

export default function StudioPage() {
  const [activeTab, setActiveTab] = React.useState('analysis')
  const [clients, setClients] = React.useState<Client[]>([])
  const [projects, setProjects] = React.useState<Project[]>([])
  const [deliverables, setDeliverables] = React.useState<ProjectDeliverable[]>([])
  const [communications, setCommunications] = React.useState<CommunicationLog[]>([])
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [inquiries, setInquiries] = React.useState<Inquiry[]>([])
  const [tasks, setTasks] = React.useState<StudioTask[]>([])
  const [shareUrl, setShareUrl] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(true)
  const [isNewClientModalOpen, setIsNewClientModalOpen] = React.useState(false)
  const [selectedPortalClient, setSelectedPortalClient] = React.useState<Client | null>(null)
  const [recordClientId, setRecordClientId] = React.useState<string | null>(null)

  const refreshProjects = async () => {
    setProjects(await CrmService.getProjects())
  }

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        CrmService.ensureLocalSeed()
        const [loadedClients, loadedProjects, loadedDeliverables, loadedComms, loadedInvoices, loadedInquiries, loadedTasks] =
          await Promise.all([
            CrmService.getClients(),
            CrmService.getProjects(),
            CrmService.getDeliverables(),
            CrmService.getCommunications(),
            CrmService.getInvoices(),
            CrmService.getInquiries(),
            CrmService.getTasks(),
          ])
        const missingProjects = loadedClients.filter(
          (client) => !loadedProjects.some((project) => project.client_id === client.id)
        )
        const createdProjects: Project[] = []
        for (const client of missingProjects) {
          try {
            createdProjects.push(await CrmService.ensureProject(client))
          } catch (err) {
            console.error('Could not open a project for', client.name, err)
          }
        }
        setClients(loadedClients)
        setProjects([...createdProjects, ...loadedProjects])
        setDeliverables(loadedDeliverables)
        setCommunications(loadedComms)
        setInvoices(loadedInvoices)
        setInquiries(loadedInquiries)
        setTasks(loadedTasks)
        if (loadedClients.length > 0) setSelectedPortalClient(loadedClients[0])
      } catch (err) {
        console.error('Failed to load CRM data', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const recordClient = clients.find((client) => client.id === recordClientId) || null

  const handleStageChange = async (clientId: string, newStage: PipelineStage) => {
    const previous = clients.find((client) => client.id === clientId)
    const updated = await CrmService.updateClientStage(clientId, newStage)
    if (!updated || !previous || previous.stage === newStage) return
    setClients((prev) => prev.map((client) => (client.id === clientId ? updated : client)))
    setProjects((prev) => prev.map((project) => (project.client_id === clientId ? { ...project, stage: newStage } : project)))
    const log = await CrmService.logActivity(
      updated.id,
      updated.name,
      `Moved from ${previous.stage} to ${newStage}.`,
      'stage_change'
    )
    setCommunications((prev) => [log, ...prev])
  }

  const handleAddClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    const newClient = await CrmService.addClient(clientData)
    setClients((prev) => [newClient, ...prev])
    await refreshProjects()
    if (!selectedPortalClient) setSelectedPortalClient(newClient)
  }

  const handleSaveNotes = async (clientId: string, notes: string) => {
    const updated = await CrmService.updateClient(clientId, { notes })
    if (updated) setClients((prev) => prev.map((client) => (client.id === clientId ? updated : client)))
  }

  const handleUpdateDeliverableStatus = async (id: string, status: ApprovalStatus, feedback?: string) => {
    const updated = await CrmService.updateDeliverableStatus(id, status, feedback)
    if (!updated) return
    setDeliverables((prev) => prev.map((item) => (item.id === id ? updated : item)))
    const project = projects.find((item) => item.id === updated.project_id)
    const client = clients.find((item) => item.id === project?.client_id)
    if (!client) return
    const log = await CrmService.logActivity(
      client.id,
      client.name,
      revisionMessage(updated.id, updated.version, status, updated.sheet_number, feedback || ''),
      'approval_request'
    )
    setCommunications((prev) => [log, ...prev])
  }

  const handleAddDeliverable = async (del: Omit<ProjectDeliverable, 'id' | 'updated_at'>) => {
    const created = await CrmService.addDeliverable(del)
    setDeliverables((prev) => [created, ...prev])
  }

  const handleSendWhatsApp = async (
    clientId: string,
    clientName: string,
    phone: string,
    message: string,
    triggerType: CommunicationLog['trigger_type'],
    status: CommunicationLog['status'] = 'sent',
    channel: CommunicationLog['channel'] = 'whatsapp'
  ) => {
    const newLog = await CrmService.sendWhatsAppNotification(clientId, clientName, phone, message, triggerType, status, channel)
    setCommunications((prev) => [newLog, ...prev])
  }

  const handleCreateInquiry = async (input: Omit<Inquiry, 'id' | 'created_at' | 'status'>) => {
    const created = await CrmService.addInquiry(input)
    setInquiries((prev) => [created, ...prev])
  }

  const handleInquiryStatus = async (id: string, status: InquiryStatus) => {
    const updated = await CrmService.updateInquiry(id, { status })
    if (updated) setInquiries((prev) => prev.map((inquiry) => (inquiry.id === id ? updated : inquiry)))
  }

  const handleConvertInquiry = async (inquiry: Inquiry) => {
    if (inquiry.status === 'Converted') return
    const client = await CrmService.addClient({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      address: 'To be confirmed',
      city: '',
      property_type: inquiry.property_type,
      style_preference: 'Warm Minimalist',
      budget: inquiry.budget,
      square_footage: 1800,
      stage: 'Lead Inbound',
      lead_source: inquiry.lead_source,
      notes: inquiry.message,
    })
    const updatedInquiry = await CrmService.updateInquiry(inquiry.id, { status: 'Converted' })
    const log = await CrmService.logActivity(
      client.id,
      client.name,
      `Converted inquiry from ${inquiry.lead_source}.`,
      'inquiry_converted'
    )
    setClients((prev) => [client, ...prev])
    if (updatedInquiry) setInquiries((prev) => prev.map((item) => (item.id === inquiry.id ? updatedInquiry : item)))
    setCommunications((prev) => [log, ...prev])
    await refreshProjects()
    setSelectedPortalClient((current) => current || client)
    setRecordClientId(client.id)
  }

  const handleCreateInvoice = async (input: Omit<Invoice, 'id' | 'invoice_number' | 'issue_date'>) => {
    let projectId = input.project_id
    if (!projectId) {
      const client = clients.find((item) => item.id === input.client_id)
      if (client) {
        const project = await CrmService.ensureProject(client)
        projectId = project.id
        await refreshProjects()
      }
    }
    const created = await CrmService.addInvoice({ ...input, project_id: projectId })
    setInvoices((prev) => [created, ...prev])
    const log = await CrmService.logActivity(
      created.client_id,
      created.client_name,
      `${created.invoice_number} issued for ${created.description}.`,
      'invoice_update'
    )
    setCommunications((prev) => [log, ...prev])
  }

  const handleInvoiceStatus = async (invoice: Invoice, status: Invoice['status']) => {
    if (invoice.status === status) return
    const updated = await CrmService.updateInvoiceStatus(invoice.id, status)
    if (!updated) return
    setInvoices((prev) => prev.map((item) => (item.id === invoice.id ? updated : item)))
    const log = await CrmService.logActivity(
      updated.client_id,
      updated.client_name,
      `${updated.invoice_number} marked ${status}.`,
      'invoice_update'
    )
    setCommunications((prev) => [log, ...prev])
  }

  const tomorrow = () => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
  }

  const handleAddTask = async (title: string, clientId?: string, clientName?: string, dueDate?: string) => {
    const task = await CrmService.addTask({
      title,
      client_id: clientId,
      client_name: clientName,
      due_date: dueDate || tomorrow(),
    })
    setTasks((prev) => [task, ...prev])
    return task
  }

  const handleCompleteTask = async (id: string) => {
    const updated = await CrmService.updateTask(id, { status: 'Done' })
    if (updated) setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)))
  }

  const handleSheetComment = async (deliverableId: string, body: string) => {
    const sheet = deliverables.find((item) => item.id === deliverableId)
    const project = projects.find((item) => item.id === sheet?.project_id)
    const client = clients.find((item) => item.id === project?.client_id) || selectedPortalClient
    if (!sheet || !client) return
    const log = await CrmService.logActivity(client.id, client.name, commentMessage(sheet.id, sheet.sheet_number, body), 'manual')
    setCommunications((prev) => [log, ...prev])
  }

  const handleApproveAction = async (proposal: ActionProposal) => {
    const action = proposal.action
    if (action.kind === 'create_task') {
      const task = await handleAddTask(action.title, action.clientId, action.clientName, action.dueDate)
      return `Task saved: ${task.title}. Due ${task.due_date}.`
    }
    if (action.kind === 'prepare_invoice') {
      await handleCreateInvoice({
        project_id: action.projectId,
        client_id: action.clientId,
        client_name: action.clientName,
        description: action.description,
        amount: action.amount,
        status: 'Pending',
        due_date: action.dueDate,
      })
      return `Invoice prepared for ${action.clientName} and left as Pending.`
    }
    if (action.kind === 'move_stage') {
      await handleStageChange(action.clientId, action.stage)
      return `${action.clientName} is now in ${action.stage}.`
    }
    if (action.kind === 'create_client') {
      await handleAddClient({
        name: action.name,
        email: action.email,
        phone: action.phone || 'To be confirmed',
        address: 'To be confirmed',
        city: '',
        property_type: 'Luxury Villa',
        style_preference: 'Warm Minimalist',
        budget: 0,
        square_footage: 0,
        stage: 'Lead Inbound',
        lead_source: 'Website',
      })
      return `${action.name} was added in Lead Inbound.`
    }
    if (action.kind === 'draft_update') {
      for (const recipient of action.recipients) {
        const consent = readConsent(recipient.clientId)
        let status: CommunicationLog['status'] = 'logged'
        let channel: CommunicationLog['channel'] = 'system'
        let recipientAddress = 'studio'
        if (recipient.canSend) {
          const useEmail = consent.email
          const res = await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              channel: useEmail ? 'email' : 'whatsapp',
              email: recipient.email,
              phone: recipient.phone,
              clientName: recipient.clientName,
              message: action.message,
              consentEmail: consent.email,
              consentWhatsapp: consent.whatsapp,
              recentMessages: communications
                .filter((log) => log.client_id === recipient.clientId)
                .map((log) => ({ message: log.message, sentAt: log.sent_at })),
            }),
          })
          const data = await res.json()
          status = data.status === 'delivered' ? 'delivered' : data.status === 'failed' ? 'failed' : 'logged'
          channel = useEmail ? 'email' : 'whatsapp'
          recipientAddress = useEmail ? recipient.email : recipient.phone
        }
        const log = await CrmService.sendWhatsAppNotification(
          recipient.clientId,
          recipient.clientName,
          recipientAddress,
          `Hello ${recipient.clientName}, a drawing is waiting for your review. Open your project link, then approve it or tell us what to change.`,
          'approval_request',
          status,
          channel
        )
        setCommunications((prev) => [log, ...prev])
      }
      return 'The update was approved. Clients with consent are sent when email or WhatsApp is configured. The others were logged only.'
    }
    return action.kind === 'delayed_projects'
      ? action.lines.join('\n') || 'No projects are past their target.'
      : 'Nothing was changed.'
  }

  const openPortal = (client: Client) => {
    setSelectedPortalClient(client)
    setRecordClientId(null)
    setActiveTab('portal')
  }

  const openInsight = (item: TodayItem) => {
    const client = item.clientId ? clients.find((row) => row.id === item.clientId) : undefined
    if (item.section === 'portal' && client) {
      openPortal(client)
      return
    }
    if (item.section === 'pipeline' && item.clientId) setRecordClientId(item.clientId)
    setActiveTab(item.section === 'analysis' ? 'analysis' : item.section)
  }

  React.useEffect(() => {
    if (!selectedPortalClient) {
      setShareUrl('')
      return
    }
    let cancelled = false
    void fetch(`/api/portal-link?clientId=${selectedPortalClient.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setShareUrl(data.url || '')
      })
      .catch(() => {
        if (!cancelled) setShareUrl('')
      })
    return () => {
      cancelled = true
    }
  }, [selectedPortalClient])

  const activePortalProject = React.useMemo(() => {
    return (
      projects.find((project) => project.client_id === selectedPortalClient?.id) || {
        id: 'proj-default',
        client_id: selectedPortalClient?.id || '',
        client_name: selectedPortalClient?.name || '',
        name: selectedPortalClient ? `${selectedPortalClient.name} project` : '',
        property_type: selectedPortalClient?.property_type || 'Luxury Villa',
        stage: selectedPortalClient?.stage || 'Concept & Moodboard',
        progress_pct: 25,
        target_date: '2027-01-15',
        total_budget: selectedPortalClient?.budget || 0,
        spent_budget: 0,
        revit_version: 'Revit 2026.1 (LOD 350)',
        deliverables_count: deliverables.length,
        created_at: '2026-10-12T00:00:00Z',
      }
    )
  }, [projects, selectedPortalClient, deliverables.length])

  const activePortalDeliverables = deliverables.filter((item) => item.project_id === activePortalProject?.id)
  const recordProject = projects.find((project) => project.client_id === recordClient?.id)
  const openInquiryCount = inquiries.filter((inquiry) => inquiry.status === 'New' || inquiry.status === 'Qualified').length

  return (
    <StudioShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      clientCount={clients.length}
      openInquiryCount={openInquiryCount}
      onOpenNewClient={() => setIsNewClientModalOpen(true)}
    >
      {isLoading ? (
        <p className="py-16 text-sm text-muted-foreground">Loading the studio…</p>
      ) : (
        <>
          {activeTab === 'analysis' && (
            <AnalysisDashboard
              clients={clients}
              projects={projects}
              inquiries={inquiries}
              invoices={invoices}
              deliverables={deliverables}
              tasks={tasks}
              onOpenSection={setActiveTab}
              onOpenInsight={openInsight}
              onCompleteTask={(id) => void handleCompleteTask(id)}
              onAddTask={(title) => void handleAddTask(title)}
            />
          )}
          {activeTab === 'inquiries' && (
            <InquiriesInbox
              inquiries={inquiries}
              onCreate={handleCreateInquiry}
              onStatusChange={handleInquiryStatus}
              onConvert={handleConvertInquiry}
            />
          )}
          {activeTab === 'pipeline' && (
            <ClientPipelineKanban
              clients={clients}
              onStageChange={handleStageChange}
              onOpenClient={(client) => setRecordClientId(client.id)}
              onSelectClientForPortal={openPortal}
              onSendWhatsAppQuick={(client) => {
                setSelectedPortalClient(client)
                setActiveTab('whatsapp')
              }}
            />
          )}
          {activeTab === 'deliverables' && (
            <DeliverablesTracker
              deliverables={deliverables}
              projects={projects}
              onUpdateStatus={handleUpdateDeliverableStatus}
              onAddDeliverable={handleAddDeliverable}
            />
          )}
          {activeTab === 'ai-studio' && <AiRevitSpecStudio />}
          {activeTab === 'chat' && (
            <StudioChat
              clients={clients}
              projects={projects}
              deliverables={deliverables}
              invoices={invoices}
              inquiries={inquiries}
              logs={communications}
              onApproveAction={handleApproveAction}
            />
          )}
          {activeTab === 'whatsapp' && (
            <WhatsAppHub
              logs={communications.filter((log) => log.channel === 'whatsapp' || log.channel === 'email')}
              clients={clients}
              onSendNotification={handleSendWhatsApp}
            />
          )}
          {activeTab === 'invoices' && (
            <InvoicesTracker
              invoices={invoices}
              clients={clients}
              projects={projects}
              onCreate={handleCreateInvoice}
              onStatusChange={handleInvoiceStatus}
            />
          )}
          {activeTab === 'portal' &&
            (selectedPortalClient ? (
              <ClientPortalView
                client={selectedPortalClient}
                project={activePortalProject}
                deliverables={activePortalDeliverables}
                shareUrl={shareUrl}
                comments={activePortalDeliverables.flatMap((item) => commentsFor(communications, item.id))}
                revisions={activePortalDeliverables.flatMap((item) => revisionsFor(communications, item.id))}
                onApproveDeliverable={(id, feedback) => handleUpdateDeliverableStatus(id, 'Approved', feedback)}
                onRequestChanges={(id, feedback) => handleUpdateDeliverableStatus(id, 'Changes Requested', feedback)}
                onAddComment={(id, body) => void handleSheetComment(id, body)}
                onBackToDashboard={() => setActiveTab('pipeline')}
              />
            ) : (
              <div className="py-16">
                <h2 className="text-lg font-medium">No client selected</h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Add a client, then open their portal from the pipeline.
                </p>
                <Button type="button" className="mt-4" onClick={() => setIsNewClientModalOpen(true)}>
                  Add client
                </Button>
              </div>
            ))}
        </>
      )}

      {recordClient && (
        <ClientRecordPanel
          client={recordClient}
          project={recordProject}
          deliverables={deliverables.filter((item) => item.project_id === recordProject?.id)}
          invoices={invoices.filter((invoice) => invoice.client_id === recordClient.id)}
          logs={communications.filter((log) => log.client_id === recordClient.id)}
          onClose={() => setRecordClientId(null)}
          onStageChange={handleStageChange}
          onSaveNotes={handleSaveNotes}
          onOpenPortal={openPortal}
          onOpenMessages={(client) => {
            setSelectedPortalClient(client)
            setRecordClientId(null)
            setActiveTab('whatsapp')
          }}
        />
      )}

      <NewClientModal
        open={isNewClientModalOpen}
        onOpenChange={setIsNewClientModalOpen}
        onAddClient={handleAddClient}
      />
    </StudioShell>
  )
}

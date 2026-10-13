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
} from "@/types/crm"

export default function StudioPage() {
  const [activeTab, setActiveTab] = React.useState('analysis')
  const [clients, setClients] = React.useState<Client[]>([])
  const [projects, setProjects] = React.useState<Project[]>([])
  const [deliverables, setDeliverables] = React.useState<ProjectDeliverable[]>([])
  const [communications, setCommunications] = React.useState<CommunicationLog[]>([])
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [inquiries, setInquiries] = React.useState<Inquiry[]>([])
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
        const [loadedClients, loadedProjects, loadedDeliverables, loadedComms, loadedInvoices, loadedInquiries] =
          await Promise.all([
            CrmService.getClients(),
            CrmService.getProjects(),
            CrmService.getDeliverables(),
            CrmService.getCommunications(),
            CrmService.getInvoices(),
            CrmService.getInquiries(),
          ])
        setClients(loadedClients)
        setProjects(loadedProjects)
        setDeliverables(loadedDeliverables)
        setCommunications(loadedComms)
        setInvoices(loadedInvoices)
        setInquiries(loadedInquiries)
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
    if (updated) setDeliverables((prev) => prev.map((item) => (item.id === id ? updated : item)))
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
    triggerType: CommunicationLog['trigger_type']
  ) => {
    const newLog = await CrmService.sendWhatsAppNotification(clientId, clientName, phone, message, triggerType)
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

  const openPortal = (client: Client) => {
    setSelectedPortalClient(client)
    setRecordClientId(null)
    setActiveTab('portal')
  }

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
              inquiries={inquiries}
              invoices={invoices}
              deliverables={deliverables}
              onOpenSection={setActiveTab}
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
            />
          )}
          {activeTab === 'whatsapp' && (
            <WhatsAppHub logs={communications.filter((log) => log.channel === 'whatsapp')} clients={clients} onSendNotification={handleSendWhatsApp} />
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
                onApproveDeliverable={(id, feedback) => handleUpdateDeliverableStatus(id, 'Approved', feedback)}
                onRequestChanges={(id, feedback) => handleUpdateDeliverableStatus(id, 'Changes Requested', feedback)}
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

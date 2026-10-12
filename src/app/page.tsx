"use client"

import * as React from "react"
import { Header } from "@/components/crm/Header"
import { ClientPipelineKanban } from "@/components/crm/ClientPipelineKanban"
import { DeliverablesTracker } from "@/components/crm/DeliverablesTracker"
import { AiRevitSpecStudio } from "@/components/crm/AiRevitSpecStudio"
import { WhatsAppHub } from "@/components/crm/WhatsAppHub"
import { InvoicesTracker } from "@/components/crm/InvoicesTracker"
import { ClientPortalView } from "@/components/crm/ClientPortalView"
import { NewClientModal } from "@/components/crm/NewClientModal"
import { CrmService } from "@/lib/crm-service"
import { Client, Project, ProjectDeliverable, CommunicationLog, Invoice, PipelineStage, ApprovalStatus } from "@/types/crm"
import { Sparkles, RefreshCw, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<string>('pipeline')
  const [clients, setClients] = React.useState<Client[]>([])
  const [projects, setProjects] = React.useState<Project[]>([])
  const [deliverables, setDeliverables] = React.useState<ProjectDeliverable[]>([])
  const [communications, setCommunications] = React.useState<CommunicationLog[]>([])
  const [invoices, setInvoices] = React.useState<Invoice[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Modals and portal selection
  const [isNewClientModalOpen, setIsNewClientModalOpen] = React.useState(false)
  const [selectedPortalClient, setSelectedPortalClient] = React.useState<Client | null>(null)

  // Load live Supabase data on mount
  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [loadedClients, loadedProjects, loadedDeliverables, loadedComms, loadedInvoices] = await Promise.all([
          CrmService.getClients(),
          CrmService.getProjects(),
          CrmService.getDeliverables(),
          CrmService.getCommunications(),
          CrmService.getInvoices()
        ])

        setClients(loadedClients)
        setProjects(loadedProjects)
        setDeliverables(loadedDeliverables)
        setCommunications(loadedComms)
        setInvoices(loadedInvoices)

        if (loadedClients.length > 0) {
          setSelectedPortalClient(loadedClients[0])
        }
      } catch (err) {
        console.error("Failed to load CRM data", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Metrics
  const totalPipelineValue = clients.reduce((acc, c) => acc + (c.budget || 0), 0)
  const totalHoursSaved = deliverables.reduce((acc, d) => acc + (d.time_saved_min || 0), 0) / 60

  // Handlers
  const handleStageChange = async (clientId: string, newStage: PipelineStage) => {
    const updated = await CrmService.updateClientStage(clientId, newStage)
    if (updated) {
      setClients(prev => prev.map(c => c.id === clientId ? updated : c))
    }
  }

  const handleAddClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
    const newClient = await CrmService.addClient(clientData)
    setClients(prev => [newClient, ...prev])
    if (!selectedPortalClient) {
      setSelectedPortalClient(newClient)
    }
  }

  const handleUpdateDeliverableStatus = async (id: string, status: ApprovalStatus, feedback?: string) => {
    const updated = await CrmService.updateDeliverableStatus(id, status, feedback)
    if (updated) {
      setDeliverables(prev => prev.map(d => d.id === id ? updated : d))
    }
  }

  const handleAddDeliverable = async (del: Omit<ProjectDeliverable, 'id' | 'updated_at'>) => {
    const created = await CrmService.addDeliverable(del)
    setDeliverables(prev => [created, ...prev])
  }

  const handleSendWhatsApp = async (
    clientId: string,
    clientName: string,
    phone: string,
    message: string,
    triggerType: CommunicationLog['trigger_type']
  ) => {
    const newLog = await CrmService.sendWhatsAppNotification(clientId, clientName, phone, message, triggerType)
    setCommunications(prev => [newLog, ...prev])
  }

  const handleOpenClientPortal = (client: Client) => {
    setSelectedPortalClient(client)
    setActiveTab('portal')
  }

  // Active client project for portal
  const activePortalProject = React.useMemo(() => {
    return projects.find(p => p.client_id === selectedPortalClient?.id) || {
      id: 'proj-default',
      client_id: selectedPortalClient?.id || '',
      client_name: selectedPortalClient?.name || '',
      name: selectedPortalClient ? `${selectedPortalClient.name} Project` : '',
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
  }, [projects, selectedPortalClient, deliverables.length])

  const activePortalDeliverables = deliverables.filter(d => d.project_id === activePortalProject?.id)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Header & Navigation */}
      <Header
        onOpenNewClient={() => setIsNewClientModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clientCount={clients.length}
        totalPipelineValue={totalPipelineValue}
        totalHoursSaved={totalHoursSaved}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground text-sm">
              <RefreshCw className="h-5 w-5 animate-spin text-amber-500" />
              <span>Connecting to Supabase Database...</span>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'pipeline' && (
              <ClientPipelineKanban
                clients={clients}
                onStageChange={handleStageChange}
                onSelectClientForPortal={handleOpenClientPortal}
                onSendWhatsAppQuick={(client) => {
                  setSelectedPortalClient(client)
                  setActiveTab('whatsapp')
                }}
              />
            )}

            {/* {activeTab === 'deliverables' && (
              <DeliverablesTracker
                deliverables={deliverables}
                projects={projects}
                onUpdateStatus={handleUpdateDeliverableStatus}
                onAddDeliverable={handleAddDeliverable}
              />
            )} */}

            {activeTab === 'ai-studio' && (
              <AiRevitSpecStudio />
            )}

            {activeTab === 'whatsapp' && (
              <WhatsAppHub
                logs={communications}
                clients={clients}
                onSendNotification={handleSendWhatsApp}
              />
            )}

            {activeTab === 'invoices' && (
              <InvoicesTracker
                invoices={invoices}
              />
            )}

            {activeTab === 'portal' && (
              selectedPortalClient ? (
                <ClientPortalView
                  client={selectedPortalClient}
                  project={activePortalProject}
                  deliverables={activePortalDeliverables}
                  onApproveDeliverable={(id, feedback) => handleUpdateDeliverableStatus(id, 'Approved', feedback)}
                  onRequestChanges={(id, feedback) => handleUpdateDeliverableStatus(id, 'Changes Requested', feedback)}
                  onBackToDashboard={() => setActiveTab('pipeline')}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-16 text-center border border-dashed border-border/80 rounded-2xl bg-card">
                  <Building2 className="h-12 w-12 text-amber-500 mb-3" />
                  <h3 className="text-lg font-serif font-semibold">No Client Selected</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md">
                    Onboard a client using the &quot;Add Client&quot; button to view their live client project portal.
                  </p>
                  <Button onClick={() => setIsNewClientModalOpen(true)} className="mt-4 bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                    + Add New Client
                  </Button>
                </div>
              )
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-4 px-4 sm:px-6 bg-background/50 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-foreground">ATELIER BIM</span>
            <span>• Next.js + Supabase + shadcn/ui Interior Architecture CRM</span>
          </div> */}

          {/* <div className="flex items-center gap-4">
            <span className="text-emerald-500 font-medium">● Connected to Live Supabase</span>
            <span>Production Ready for Vercel</span>
          </div> */}
        </div>
      </footer>

      {/* New Client Modal */}
      <NewClientModal
        open={isNewClientModalOpen}
        onOpenChange={setIsNewClientModalOpen}
        onAddClient={handleAddClient}
      />
    </div>
  )
}

import {
  Client,
  CommunicationLog,
  Inquiry,
  InquiryStatus,
  Invoice,
  PipelineStage,
  Project,
  ProjectDeliverable,
  StudioTask,
} from '@/types/crm'
import { supabase, isSupabaseConfigured } from './supabase'
import {
  SEED_CLIENTS,
  SEED_COMMUNICATIONS,
  SEED_DELIVERABLES,
  SEED_INQUIRIES,
  SEED_INVOICES,
  SEED_PROJECTS,
} from './mock-data'

const STORAGE_KEY_CLIENTS = 'crm_interior_clients'
const STORAGE_KEY_PROJECTS = 'crm_interior_projects'
const STORAGE_KEY_DELIVERABLES = 'crm_interior_deliverables'
const STORAGE_KEY_COMMUNICATIONS = 'crm_interior_communications'
const STORAGE_KEY_INVOICES = 'crm_interior_invoices'
const STORAGE_KEY_INQUIRIES = 'crm_interior_inquiries'
const STORAGE_KEY_TASKS = 'crm_interior_tasks'

function missingTable(error: { code?: string; message?: string } | null) {
  return error?.code === 'PGRST205' || /schema cache/i.test(error?.message || '')
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e)
    return fallback
  }
}

function saveToStorage<T>(key: string, data: T) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e)
  }
}

function buildProject(client: Client, now = new Date().toISOString()): Project {
  return {
    id: generateUUID(),
    client_id: client.id,
    client_name: client.name,
    name: `${client.name} • ${client.property_type}`,
    property_type: client.property_type,
    stage: client.stage,
    progress_pct: 10,
    target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    total_budget: client.budget,
    spent_budget: 0,
    revit_version: 'Revit 2026.1 (LOD 350)',
    deliverables_count: 0,
    created_at: now,
  }
}

function projectRow(project: Project) {
  const row = { ...project }
  delete row.deliverables_count
  return row
}

async function persistProject(project: Project): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('projects').insert([projectRow(project)])
    if (!error) return true
    console.error('Supabase persistProject error:', error)
    return false
  }
  const current = getFromStorage<Project[]>(STORAGE_KEY_PROJECTS, [])
  saveToStorage(STORAGE_KEY_PROJECTS, [project, ...current])
  return true
}

async function persistLog(log: CommunicationLog): Promise<CommunicationLog> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('communication_logs').insert([log]).select().single()
    if (!error && data) return data as CommunicationLog
    if (error) console.error('Supabase persistLog error:', error)
  }
  const current = getFromStorage<CommunicationLog[]>(STORAGE_KEY_COMMUNICATIONS, [])
  saveToStorage(STORAGE_KEY_COMMUNICATIONS, [log, ...current])
  return log
}

export const CrmService = {
  ensureLocalSeed() {
    if (typeof window === 'undefined') return
    if (isSupabaseConfigured) return
    if (localStorage.getItem(STORAGE_KEY_CLIENTS) !== null) return
    saveToStorage(STORAGE_KEY_CLIENTS, SEED_CLIENTS)
    saveToStorage(STORAGE_KEY_PROJECTS, SEED_PROJECTS)
    saveToStorage(STORAGE_KEY_DELIVERABLES, SEED_DELIVERABLES)
    saveToStorage(STORAGE_KEY_COMMUNICATIONS, SEED_COMMUNICATIONS)
    saveToStorage(STORAGE_KEY_INVOICES, SEED_INVOICES)
    saveToStorage(STORAGE_KEY_INQUIRIES, SEED_INQUIRIES)
  },

  clearLocalStorage() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY_CLIENTS)
    localStorage.removeItem(STORAGE_KEY_PROJECTS)
    localStorage.removeItem(STORAGE_KEY_DELIVERABLES)
    localStorage.removeItem(STORAGE_KEY_COMMUNICATIONS)
    localStorage.removeItem(STORAGE_KEY_INVOICES)
    localStorage.removeItem(STORAGE_KEY_INQUIRIES)
    localStorage.removeItem(STORAGE_KEY_TASKS)
  },

  async getClients(): Promise<Client[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
      if (!error && data) return data as Client[]
      if (error) console.error('Supabase getClients error:', error)
    }
    return getFromStorage<Client[]>(STORAGE_KEY_CLIENTS, [])
  },

  async addClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const now = new Date().toISOString()
    const newClient: Client = {
      ...clientData,
      id: generateUUID(),
      created_at: now,
      updated_at: now,
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('clients').insert([newClient]).select().single()
      if (!error && data) {
        const saved = data as Client
        await persistProject(buildProject(saved, now))
        return saved
      }
      if (error) console.error('Supabase addClient error:', error)
    }

    const current = getFromStorage<Client[]>(STORAGE_KEY_CLIENTS, [])
    saveToStorage(STORAGE_KEY_CLIENTS, [newClient, ...current])
    await persistProject(buildProject(newClient, now))
    return newClient
  },

  async updateClient(id: string, updates: Partial<Client>): Promise<Client | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (!error && data) return data as Client
      if (error) console.error('Supabase updateClient error:', error)
    }

    const current = getFromStorage<Client[]>(STORAGE_KEY_CLIENTS, [])
    const index = current.findIndex(c => c.id === id)
    if (index === -1) return null

    const updatedClient = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    current[index] = updatedClient
    saveToStorage(STORAGE_KEY_CLIENTS, current)
    return updatedClient
  },

  async updateClientStage(id: string, newStage: PipelineStage): Promise<Client | null> {
    const client = await this.updateClient(id, { stage: newStage })
    if (!client) return null

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('projects').update({ stage: newStage }).eq('client_id', id)
      if (!error) return client
      console.error('Supabase update project stage error:', error)
    }

    const projects = getFromStorage<Project[]>(STORAGE_KEY_PROJECTS, [])
    saveToStorage(
      STORAGE_KEY_PROJECTS,
      projects.map(project => (project.client_id === id ? { ...project, stage: newStage } : project))
    )
    return client
  },

  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      if (!error && data) {
        return data.map((project) => ({
          ...project,
          deliverables_count: (project as Project).deliverables_count ?? 0,
        })) as Project[]
      }
      if (error) console.error('Supabase getProjects error:', error)
    }
    return getFromStorage<Project[]>(STORAGE_KEY_PROJECTS, [])
  },

  async ensureProject(client: Client): Promise<Project> {
    const projects = await this.getProjects()
    const existing = projects.find(project => project.client_id === client.id)
    if (existing) return existing
    const project = buildProject(client)
    const saved = await persistProject(project)
    if (!saved) throw new Error(`Could not save a project for ${client.name}`)
    return project
  },

  async getDeliverables(): Promise<ProjectDeliverable[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('deliverables').select('*').order('updated_at', { ascending: false })
      if (!error && data) return data as ProjectDeliverable[]
      if (error) console.error('Supabase getDeliverables error:', error)
    }
    return getFromStorage<ProjectDeliverable[]>(STORAGE_KEY_DELIVERABLES, [])
  },

  async updateDeliverableStatus(
    id: string,
    status: ProjectDeliverable['status'],
    feedback?: string
  ): Promise<ProjectDeliverable | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('deliverables')
        .update({
          status,
          client_feedback: feedback || undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
      if (!error && data) return data as ProjectDeliverable
      if (error) console.error('Supabase updateDeliverableStatus error:', error)
    }

    const current = getFromStorage<ProjectDeliverable[]>(STORAGE_KEY_DELIVERABLES, [])
    const index = current.findIndex(d => d.id === id)
    if (index === -1) return null

    const updated = {
      ...current[index],
      status,
      client_feedback: feedback ?? current[index].client_feedback,
      updated_at: new Date().toISOString(),
    }
    current[index] = updated
    saveToStorage(STORAGE_KEY_DELIVERABLES, current)
    return updated
  },

  async addDeliverable(deliverable: Omit<ProjectDeliverable, 'id' | 'updated_at'>): Promise<ProjectDeliverable> {
    const newDeliverable: ProjectDeliverable = {
      ...deliverable,
      id: generateUUID(),
      updated_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('deliverables').insert([newDeliverable]).select().single()
      if (!error && data) return data as ProjectDeliverable
      if (error) console.error('Supabase addDeliverable error:', error)
    }

    const current = getFromStorage<ProjectDeliverable[]>(STORAGE_KEY_DELIVERABLES, [])
    saveToStorage(STORAGE_KEY_DELIVERABLES, [newDeliverable, ...current])
    return newDeliverable
  },

  async getCommunications(): Promise<CommunicationLog[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('communication_logs').select('*').order('sent_at', { ascending: false })
      if (!error && data) return data as CommunicationLog[]
      if (error) console.error('Supabase getCommunications error:', error)
    }
    return getFromStorage<CommunicationLog[]>(STORAGE_KEY_COMMUNICATIONS, [])
  },

  async sendWhatsAppNotification(
    clientId: string,
    clientName: string,
    recipientPhone: string,
    message: string,
    triggerType: CommunicationLog['trigger_type'] = 'manual',
    status: CommunicationLog['status'] = 'sent',
    channel: CommunicationLog['channel'] = 'whatsapp'
  ): Promise<CommunicationLog> {
    return persistLog({
      id: generateUUID(),
      client_id: clientId,
      client_name: clientName,
      channel,
      recipient_phone_or_email: recipientPhone,
      trigger_type: triggerType,
      message,
      sent_at: new Date().toISOString(),
      status,
    })
  },

  async logActivity(
    clientId: string,
    clientName: string,
    message: string,
    triggerType: CommunicationLog['trigger_type'] = 'manual'
  ): Promise<CommunicationLog> {
    return persistLog({
      id: generateUUID(),
      client_id: clientId,
      client_name: clientName,
      channel: 'system',
      recipient_phone_or_email: 'studio',
      trigger_type: triggerType,
      message,
      sent_at: new Date().toISOString(),
      status: 'delivered',
    })
  },

  async getInvoices(): Promise<Invoice[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('invoices').select('*').order('due_date', { ascending: true })
      if (!error && data) return data as Invoice[]
      if (error) console.error('Supabase getInvoices error:', error)
    }
    return getFromStorage<Invoice[]>(STORAGE_KEY_INVOICES, [])
  },

  async addInvoice(input: Omit<Invoice, 'id' | 'invoice_number' | 'issue_date'> & { invoice_number?: string }): Promise<Invoice> {
    const invoice: Invoice = {
      ...input,
      id: generateUUID(),
      invoice_number: input.invoice_number || `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      issue_date: new Date().toISOString().split('T')[0],
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('invoices').insert([invoice]).select().single()
      if (!error && data) return data as Invoice
      if (error) console.error('Supabase addInvoice error:', error)
    }

    const current = getFromStorage<Invoice[]>(STORAGE_KEY_INVOICES, [])
    saveToStorage(STORAGE_KEY_INVOICES, [invoice, ...current])
    return invoice
  },

  async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<Invoice | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('invoices').update({ status }).eq('id', id).select().single()
      if (!error && data) return data as Invoice
      if (error) console.error('Supabase updateInvoiceStatus error:', error)
    }

    const current = getFromStorage<Invoice[]>(STORAGE_KEY_INVOICES, [])
    const index = current.findIndex(invoice => invoice.id === id)
    if (index === -1) return null
    const updated = { ...current[index], status }
    current[index] = updated
    saveToStorage(STORAGE_KEY_INVOICES, current)
    return updated
  },

  async getInquiries(): Promise<Inquiry[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('inquiries').select('*').order('created_at', { ascending: false })
      if (!error && data) return data as Inquiry[]
      if (error) console.error('Supabase getInquiries error:', error)
    }
    return getFromStorage<Inquiry[]>(STORAGE_KEY_INQUIRIES, [])
  },

  async addInquiry(input: Omit<Inquiry, 'id' | 'created_at' | 'status'> & { status?: InquiryStatus }): Promise<Inquiry> {
    const inquiry: Inquiry = {
      ...input,
      id: generateUUID(),
      status: input.status || 'New',
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('inquiries').insert([inquiry]).select().single()
      if (!error && data) return data as Inquiry
      if (error) console.error('Supabase addInquiry error:', error)
    }

    const current = getFromStorage<Inquiry[]>(STORAGE_KEY_INQUIRIES, [])
    saveToStorage(STORAGE_KEY_INQUIRIES, [inquiry, ...current])
    return inquiry
  },

  async updateInquiry(id: string, updates: Partial<Inquiry>): Promise<Inquiry | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('inquiries').update(updates).eq('id', id).select().single()
      if (!error && data) return data as Inquiry
      if (error) console.error('Supabase updateInquiry error:', error)
    }

    const current = getFromStorage<Inquiry[]>(STORAGE_KEY_INQUIRIES, [])
    const index = current.findIndex(inquiry => inquiry.id === id)
    if (index === -1) return null
    const updated = { ...current[index], ...updates }
    current[index] = updated
    saveToStorage(STORAGE_KEY_INQUIRIES, current)
    return updated
  },

  async getTasks(): Promise<StudioTask[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('studio_tasks').select('*').order('due_date', { ascending: true })
      if (!error && data) return data as StudioTask[]
      if (error && !missingTable(error)) console.error('Supabase getTasks error:', error)
    }
    return getFromStorage<StudioTask[]>(STORAGE_KEY_TASKS, [])
  },

  async addTask(input: Omit<StudioTask, 'id' | 'created_at' | 'status'> & { status?: StudioTask['status'] }): Promise<StudioTask> {
    const task: StudioTask = {
      ...input,
      id: generateUUID(),
      status: input.status || 'Open',
      created_at: new Date().toISOString(),
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('studio_tasks').insert([task]).select().single()
      if (!error && data) return data as StudioTask
      if (error && !missingTable(error)) console.error('Supabase addTask error:', error)
      if (!error) return task
    }
    const current = getFromStorage<StudioTask[]>(STORAGE_KEY_TASKS, [])
    saveToStorage(STORAGE_KEY_TASKS, [task, ...current])
    return task
  },

  async updateTask(id: string, updates: Partial<StudioTask>): Promise<StudioTask | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('studio_tasks').update(updates).eq('id', id).select().single()
      if (!error && data) return data as StudioTask
      if (error && !missingTable(error)) console.error('Supabase updateTask error:', error)
      if (!error) return null
    }
    const current = getFromStorage<StudioTask[]>(STORAGE_KEY_TASKS, [])
    const index = current.findIndex((task) => task.id === id)
    if (index === -1) return null
    const updated = { ...current[index], ...updates }
    current[index] = updated
    saveToStorage(STORAGE_KEY_TASKS, current)
    return updated
  },

  resetToDefaults() {
    this.clearLocalStorage()
  },
}

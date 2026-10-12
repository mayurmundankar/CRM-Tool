import { Client, Project, ProjectDeliverable, CommunicationLog, Invoice, PipelineStage } from '@/types/crm'
import { supabase, isSupabaseConfigured } from './supabase'

const STORAGE_KEY_CLIENTS = 'crm_interior_clients'
const STORAGE_KEY_PROJECTS = 'crm_interior_projects'
const STORAGE_KEY_DELIVERABLES = 'crm_interior_deliverables'
const STORAGE_KEY_COMMUNICATIONS = 'crm_interior_communications'
const STORAGE_KEY_INVOICES = 'crm_interior_invoices'

// Helper to generate RFC4122 UUID
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

// Helper to get from LocalStorage
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

export const CrmService = {
  // Clear any old dummy data in browser localStorage
  clearLocalStorage() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY_CLIENTS)
    localStorage.removeItem(STORAGE_KEY_PROJECTS)
    localStorage.removeItem(STORAGE_KEY_DELIVERABLES)
    localStorage.removeItem(STORAGE_KEY_COMMUNICATIONS)
    localStorage.removeItem(STORAGE_KEY_INVOICES)
  },

  // --- CLIENTS ---
  async getClients(): Promise<Client[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
      if (!error && data) {
        return data as Client[]
      }
      if (error) {
        console.error('Supabase getClients error:', error)
      }
    }
    return getFromStorage<Client[]>(STORAGE_KEY_CLIENTS, [])
  },

  async addClient(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const newId = generateUUID()
    const now = new Date().toISOString()
    const newClient: Client = {
      ...clientData,
      id: newId,
      created_at: now,
      updated_at: now,
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select()
        .single()

      if (!error && data) {
        // Also create a default linked project in Supabase for this client
        const newProject: Project = {
          id: generateUUID(),
          client_id: data.id,
          client_name: data.name,
          name: `${data.name} • ${data.property_type} Design`,
          property_type: data.property_type,
          stage: data.stage,
          progress_pct: 10,
          target_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_budget: data.budget,
          spent_budget: 0,
          revit_version: 'Revit 2026.1 (LOD 350)',
          deliverables_count: 0,
          created_at: now,
        }
        await supabase.from('projects').insert([newProject])

        return data as Client
      }

      if (error) {
        console.error('Supabase addClient error:', error)
      }
    }

    const current = getFromStorage<Client[]>(STORAGE_KEY_CLIENTS, [])
    const updated = [newClient, ...current]
    saveToStorage(STORAGE_KEY_CLIENTS, updated)
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
      updated_at: new Date().toISOString()
    }
    current[index] = updatedClient
    saveToStorage(STORAGE_KEY_CLIENTS, current)
    return updatedClient
  },

  async updateClientStage(id: string, newStage: PipelineStage): Promise<Client | null> {
    return this.updateClient(id, { stage: newStage })
  },

  // --- PROJECTS ---
  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      if (!error && data) return data as Project[]
      if (error) console.error('Supabase getProjects error:', error)
    }
    return getFromStorage<Project[]>(STORAGE_KEY_PROJECTS, [])
  },

  // --- DELIVERABLES ---
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
          updated_at: new Date().toISOString()
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
      updated_at: new Date().toISOString()
    }
    current[index] = updated
    saveToStorage(STORAGE_KEY_DELIVERABLES, current)
    return updated
  },

  async addDeliverable(deliverable: Omit<ProjectDeliverable, 'id' | 'updated_at'>): Promise<ProjectDeliverable> {
    const newDeliverable: ProjectDeliverable = {
      ...deliverable,
      id: generateUUID(),
      updated_at: new Date().toISOString()
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('deliverables').insert([newDeliverable]).select().single()
      if (!error && data) return data as ProjectDeliverable
      if (error) console.error('Supabase addDeliverable error:', error)
    }

    const current = getFromStorage<ProjectDeliverable[]>(STORAGE_KEY_DELIVERABLES, [])
    const updated = [newDeliverable, ...current]
    saveToStorage(STORAGE_KEY_DELIVERABLES, updated)
    return newDeliverable
  },

  // --- COMMUNICATIONS (WhatsApp & Notifications) ---
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
    triggerType: CommunicationLog['trigger_type'] = 'manual'
  ): Promise<CommunicationLog> {
    const newLog: CommunicationLog = {
      id: generateUUID(),
      client_id: clientId,
      client_name: clientName,
      channel: 'whatsapp',
      recipient_phone_or_email: recipientPhone,
      trigger_type: triggerType,
      message,
      sent_at: new Date().toISOString(),
      status: 'sent',
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('communication_logs').insert([newLog]).select().single()
      if (!error && data) return data as CommunicationLog
      if (error) console.error('Supabase sendWhatsAppNotification error:', error)
    }

    const current = getFromStorage<CommunicationLog[]>(STORAGE_KEY_COMMUNICATIONS, [])
    const updated = [newLog, ...current]
    saveToStorage(STORAGE_KEY_COMMUNICATIONS, updated)
    return newLog
  },

  // --- INVOICES ---
  async getInvoices(): Promise<Invoice[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('invoices').select('*').order('due_date', { ascending: true })
      if (!error && data) return data as Invoice[]
      if (error) console.error('Supabase getInvoices error:', error)
    }
    return getFromStorage<Invoice[]>(STORAGE_KEY_INVOICES, [])
  },

  // Reset/Empty everything
  resetToDefaults() {
    this.clearLocalStorage()
  }
}

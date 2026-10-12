export type PropertyType =
  | 'Luxury Villa'
  | 'Penthouse'
  | 'Commercial Office'
  | 'Boutique Retail'
  | 'Modern Apartment'
  | 'Hospitality & Lounge'

export type DesignStyle =
  | 'Warm Minimalist'
  | 'Contemporary Japandi'
  | 'Mid-Century Modern'
  | 'Biophilic Luxury'
  | 'Urban Industrial'
  | 'Neo-Classical'
  | 'Art Deco Modern'

export type PipelineStage =
  | 'Lead Inbound'
  | 'Consultation & Discovery'
  | 'Concept & Moodboard'
  | 'Schematic Planning'
  | 'Revit BIM & Tech Drawings'
  | 'Procurement & Specs'
  | 'Execution & Site Build'
  | 'Handover & Reveal'

export type DeliverableType =
  | 'Lighting Plan'
  | 'Plumbing Plan'
  | 'Elevation'
  | '3D Photorealistic Render'
  | 'Revit BIM Model'
  | 'Material Schedule'

export type ApprovalStatus =
  | 'Draft'
  | 'Pending Review'
  | 'Approved'
  | 'Changes Requested'

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  company?: string
  address: string
  city: string
  avatar_url?: string
  property_type: PropertyType
  style_preference: DesignStyle
  budget: number
  square_footage: number
  stage: PipelineStage
  lead_source: 'Referral' | 'Instagram' | 'Architect Partner' | 'Website' | 'Houzz'
  notes?: string
  created_at: string
  updated_at: string
}

export interface ProjectDeliverable {
  id: string
  project_id: string
  title: string
  type: DeliverableType
  sheet_number: string // e.g. E-101, P-201, A-402
  status: ApprovalStatus
  ai_automated: boolean
  time_saved_min: number
  preview_url: string
  file_url?: string
  client_feedback?: string
  version: string
  updated_at: string
}

export interface Project {
  id: string
  client_id: string
  client_name: string
  name: string
  property_type: PropertyType
  stage: PipelineStage
  progress_pct: number
  target_date: string
  total_budget: number
  spent_budget: number
  revit_version: string
  deliverables_count: number
  created_at: string
}

export interface CommunicationLog {
  id: string
  client_id: string
  client_name: string
  channel: 'whatsapp' | 'email' | 'system'
  recipient_phone_or_email: string
  trigger_type: 'milestone_completed' | 'plan_ready' | 'approval_request' | 'invoice_sent' | 'manual'
  message: string
  sent_at: string
  status: 'sent' | 'delivered' | 'read'
}

export interface Invoice {
  id: string
  project_id: string
  client_id: string
  client_name: string
  invoice_number: string
  description: string
  amount: number
  status: 'Paid' | 'Pending' | 'Overdue'
  issue_date: string
  due_date: string
}

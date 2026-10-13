import { DesignStyle, LeadSource, PipelineStage, PropertyType } from '@/types/crm'

export const PIPELINE_STAGES: { id: PipelineStage; label: string; description: string }[] = [
  { id: 'Lead Inbound', label: 'Inbound', description: 'New client, brief still open' },
  { id: 'Consultation & Discovery', label: 'Consultation', description: 'Site visit and scope' },
  { id: 'Concept & Moodboard', label: 'Concept', description: 'Direction and materials' },
  { id: 'Schematic Planning', label: 'Schematic', description: 'Plans and partitions' },
  { id: 'Revit BIM & Tech Drawings', label: 'Revit BIM', description: 'Sheets and models' },
  { id: 'Procurement & Specs', label: 'Procurement', description: 'FF&E and finishes' },
  { id: 'Execution & Site Build', label: 'Site', description: 'Build in progress' },
  { id: 'Handover & Reveal', label: 'Handover', description: 'Styled and signed off' },
]

export const PROPERTY_TYPES: PropertyType[] = [
  'Luxury Villa',
  'Penthouse',
  'Commercial Office',
  'Boutique Retail',
  'Modern Apartment',
  'Hospitality & Lounge',
]

export const DESIGN_STYLES: DesignStyle[] = [
  'Warm Minimalist',
  'Contemporary Japandi',
  'Mid-Century Modern',
  'Biophilic Luxury',
  'Urban Industrial',
  'Neo-Classical',
  'Art Deco Modern',
]

export const LEAD_SOURCES: LeadSource[] = [
  'Referral',
  'Instagram',
  'Architect Partner',
  'Website',
  'Houzz',
]

export const BUDGET_BANDS = [
  { value: 'ALL', label: 'Any budget' },
  { value: 'under-150', label: 'Under $150k' },
  { value: '150-400', label: '$150k–$400k' },
  { value: '400-800', label: '$400k–$800k' },
  { value: '800-plus', label: '$800k+' },
]

export function matchesBudget(budget: number, band: string) {
  if (band === 'ALL') return true
  if (band === 'under-150') return budget < 150000
  if (band === '150-400') return budget >= 150000 && budget < 400000
  if (band === '400-800') return budget >= 400000 && budget < 800000
  if (band === '800-plus') return budget >= 800000
  return true
}

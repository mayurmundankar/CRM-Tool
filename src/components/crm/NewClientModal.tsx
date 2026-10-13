"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Client, PropertyType, DesignStyle, PipelineStage } from "@/types/crm"
import { Sparkles, Building, Palette, DollarSign, Ruler, Phone, Mail, User } from "lucide-react"

interface NewClientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddClient: (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => void
}

const PROPERTY_TYPES: PropertyType[] = [
  'Luxury Villa',
  'Penthouse',
  'Commercial Office',
  'Boutique Retail',
  'Modern Apartment',
  'Hospitality & Lounge'
]

const DESIGN_STYLES: DesignStyle[] = [
  'Warm Minimalist',
  'Contemporary Japandi',
  'Mid-Century Modern',
  'Biophilic Luxury',
  'Urban Industrial',
  'Neo-Classical',
  'Art Deco Modern'
]

export function NewClientModal({ open, onOpenChange, onAddClient }: NewClientModalProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: 'New York, NY',
    property_type: 'Penthouse' as PropertyType,
    style_preference: 'Warm Minimalist' as DesignStyle,
    budget: 150000,
    square_footage: 3200,
    stage: 'Lead Inbound' as PipelineStage,
    lead_source: 'Referral' as Client['lead_source'],
    notes: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    onAddClient(formData)

    onOpenChange(false)
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      city: 'New York, NY',
      property_type: 'Penthouse',
      style_preference: 'Warm Minimalist',
      budget: 150000,
      square_footage: 3200,
      stage: 'Lead Inbound',
      lead_source: 'Referral',
      notes: '',
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-xl">Onboard a client</DialogTitle>
              <DialogDescription>
                Register client details, property specifications, design aesthetic, and project budget.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Full Name *
              </label>
              <Input
                required
                placeholder="e.g. Vivienne St. Claire"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building className="h-3.5 w-3.5" /> Company / Family Estate
              </label>
              <Input
                placeholder="e.g. St. Claire Holdings"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> Email Address *
              </label>
              <Input
                type="email"
                required
                placeholder="vivienne@estate.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> Phone (WhatsApp enabled)
              </label>
              <Input
                type="tel"
                placeholder="+1 (555) 392-1084"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Project Site Address & Location
            </label>
            <Input
              placeholder="e.g. 520 West 28th St, Penthouse 7, Chelsea, New York"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* Architectural & Design Preferences */}
          <div className="rounded-lg border border-border/80 bg-muted/20 p-3.5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5" /> Architectural & Design Specifications
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Property Type</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value as PropertyType })}
                >
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Design Style Aesthetic</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  value={formData.style_preference}
                  onChange={(e) => setFormData({ ...formData, style_preference: e.target.value as DesignStyle })}
                >
                  {DESIGN_STYLES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Target Budget (USD)
                </label>
                <Input
                  type="number"
                  min={10000}
                  step={5000}
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Ruler className="h-3 w-3" /> Square Footage (sq ft)
                </label>
                <Input
                  type="number"
                  min={200}
                  step={50}
                  value={formData.square_footage}
                  onChange={(e) => setFormData({ ...formData, square_footage: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Initial Scope & Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Initial Design Brief & Revit Automation Requirements
            </label>
            <Textarea
              rows={3}
              placeholder="e.g. Needs rapid automated lighting plan for gallery walls, custom kitchen island millwork elevation, smart dimming scenes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save & Create Client Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

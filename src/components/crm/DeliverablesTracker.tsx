"use client"

import * as React from "react"
import { ProjectDeliverable, DeliverableType, ApprovalStatus, Project } from "@/types/crm"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  Sliders,
  Send,
  Download,
  Building,
  Layers,
  Lightbulb,
  Droplet,
  Compass
} from "lucide-react"

interface DeliverablesTrackerProps {
  deliverables: ProjectDeliverable[]
  projects: Project[]
  onUpdateStatus: (id: string, status: ApprovalStatus, feedback?: string) => void
  onAddDeliverable: (del: Omit<ProjectDeliverable, 'id' | 'updated_at'>) => void
}

export function DeliverablesTracker({
  deliverables,
  projects,
  onUpdateStatus,
  onAddDeliverable
}: DeliverablesTrackerProps) {
  const [selectedTypeFilter, setSelectedTypeFilter] = React.useState<string>('ALL')
  const [isGenerateModalOpen, setIsGenerateModalOpen] = React.useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false)
  const [activeDeliverable, setActiveDeliverable] = React.useState<ProjectDeliverable | null>(null)
  const [reviewFeedback, setReviewFeedback] = React.useState('')

  // AI Generator simulation state
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [generationStep, setGenerationStep] = React.useState(0)
  const [genData, setGenData] = React.useState({
    projectId: projects[0]?.id || '',
    type: 'Lighting Plan' as DeliverableType,
    room: 'Great Room & Open Gallery',
    sheetNumber: 'E-103',
    luxTarget: '300 Lux (Warm 2700K)',
  })

  const filteredDeliverables = deliverables.filter((d) => {
    if (selectedTypeFilter === 'ALL') return true
    return d.type === selectedTypeFilter
  })

  const totalTimeSavedMin = deliverables.reduce((acc, d) => acc + (d.time_saved_min || 0), 0)
  const approvedCount = deliverables.filter(d => d.status === 'Approved').length
  const pendingCount = deliverables.filter(d => d.status === 'Pending Review').length

  const handleStartAiGeneration = () => {
    setIsGenerating(true)
    setGenerationStep(1)

    const timer1 = setTimeout(() => setGenerationStep(2), 1200)
    const timer2 = setTimeout(() => setGenerationStep(3), 2400)
    const timer3 = setTimeout(() => {
      setGenerationStep(4)
      const project = projects.find(p => p.id === genData.projectId) || projects[0]
      const savedMinutes = genData.type === 'Lighting Plan' ? 145 : 130

      onAddDeliverable({
        project_id: genData.projectId,
        title: `${genData.room} Automated ${genData.type}`,
        type: genData.type,
        sheet_number: genData.sheetNumber,
        status: 'Pending Review',
        ai_automated: true,
        time_saved_min: savedMinutes,
        preview_url: genData.type === 'Lighting Plan'
          ? 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=900&auto=format&fit=crop&q=80',
        client_feedback: `Generated in 4m 15s via Revit Automation Engine. Slashed manual drafting time from 2.5 hours to minutes.`,
        version: 'v1.0'
      })

      setIsGenerating(false)
      setIsGenerateModalOpen(false)
      setGenerationStep(0)
    }, 3800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }

  const openReviewModal = (del: ProjectDeliverable) => {
    setActiveDeliverable(del)
    setReviewFeedback(del.client_feedback || '')
    setIsReviewModalOpen(true)
  }

  const handleSaveReview = (status: ApprovalStatus) => {
    if (!activeDeliverable) return
    onUpdateStatus(activeDeliverable.id, status, reviewFeedback)
    setIsReviewModalOpen(false)
  }

  const getTypeIcon = (type: DeliverableType) => {
    switch (type) {
      case 'Lighting Plan': return <Lightbulb className="h-4 w-4 text-amber-400" />
      case 'Plumbing Plan': return <Droplet className="h-4 w-4 text-blue-400" />
      case 'Elevation': return <Layers className="h-4 w-4 text-purple-400" />
      default: return <FileText className="h-4 w-4 text-emerald-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Automation Metrics & CTA */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-50/90 via-stone-50 to-amber-100/50 dark:from-neutral-900 dark:via-neutral-900 dark:to-amber-950/40 p-6 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="gold" className="gap-1 font-semibold text-xs">
                <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Revit BIM Automation Engine
              </Badge>
              <span className="text-xs text-muted-foreground">JD Objective Alignment: 2-3h reduced to minutes</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground dark:text-white font-serif">
              Architectural & Interior Design Deliverables
            </h2>
            <p className="text-sm text-muted-foreground dark:text-neutral-300 max-w-2xl">
              Track automated lighting plans, plumbing plans, elevations, and client sign-offs.
              Empowers your U.S. clients with instant sheet reviews and automated Revit turnaround.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="rounded-xl border border-border/80 bg-background/90 dark:border-white/10 dark:bg-white/5 p-3 text-center sm:text-left">
              <div className="text-[11px] text-muted-foreground dark:text-neutral-400">Total Time Saved</div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {(totalTimeSavedMin / 60).toFixed(1)} hrs <span className="text-xs text-muted-foreground dark:text-neutral-400 font-normal">({totalTimeSavedMin} min)</span>
              </div>
            </div>

            <Button
              onClick={() => setIsGenerateModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold shadow-xs shadow-amber-500/20 text-xs"
            >
              <Sparkles className="h-4 w-4 stroke-[2.5]" />
              <span>Generate Automated Plan</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'Lighting Plan', 'Plumbing Plan', 'Elevation', '3D Photorealistic Render'].map((type) => (
            <Button
              key={type}
              variant={selectedTypeFilter === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTypeFilter(type)}
              className="h-8 text-xs font-medium whitespace-nowrap"
            >
              {type === 'ALL' ? 'All Deliverables' : type}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <strong className="text-foreground">{approvedCount}</strong> Approved
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <strong className="text-foreground">{pendingCount}</strong> In Review
          </span>
        </div>
      </div>

      {/* Deliverables Grid */}
      {filteredDeliverables.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border/80 rounded-2xl bg-card">
          <FileText className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-base font-semibold">No deliverables yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Generate an automated Revit lighting or plumbing plan sheet, or add a new deliverable.
          </p>
          <Button
            onClick={() => setIsGenerateModalOpen(true)}
            className="mt-4 gap-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Automated Plan</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDeliverables.map((item) => {
            const project = projects.find(p => p.id === item.project_id)

          return (
            <Card key={item.id} className="overflow-hidden border-border/80 hover:border-amber-500/40 transition-all flex flex-col group">
              {/* Preview Thumbnail */}
              <div className="relative h-48 w-full overflow-hidden bg-neutral-950">
                <img
                  src={item.preview_url}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <Badge variant="outline" className="bg-black/60 text-white border-white/20 backdrop-blur-xs font-mono text-[11px] gap-1">
                    {getTypeIcon(item.type)}
                    Sheet {item.sheet_number}
                  </Badge>

                  {item.ai_automated && (
                    <Badge variant="gold" className="bg-amber-500/90 text-black font-semibold text-[10px] gap-1">
                      <Zap className="h-3 w-3 fill-black" />
                      AI Automated ({item.time_saved_min}m saved)
                    </Badge>
                  )}
                </div>

                {/* Status at bottom of image */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/90 truncate drop-shadow">
                    {project ? project.name : 'Interior Project'}
                  </span>
                  <Badge
                    variant={
                      item.status === 'Approved'
                        ? 'emerald'
                        : item.status === 'Changes Requested'
                        ? 'destructive'
                        : 'gold'
                    }
                    className="text-[10px]"
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>

              {/* Card Body */}
              <CardContent className="p-4 flex-1 space-y-2.5">
                <div>
                  <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-amber-500 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.type} • Revision {item.version}
                  </p>
                </div>

                {item.client_feedback && (
                  <div className="rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground border border-border/50">
                    <span className="font-medium text-foreground block text-[11px] mb-0.5">Review Note:</span>
                    <p className="italic line-clamp-2">&quot;{item.client_feedback}&quot;</p>
                  </div>
                )}
              </CardContent>

              {/* Card Footer Actions */}
              <CardFooter className="p-4 pt-0 border-t border-border/40 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted-foreground">
                  Updated {new Date(item.updated_at).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1"
                    onClick={() => openReviewModal(item)}
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Review / Feedback</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    )}

      {/* AI Generator Modal */}
      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-500">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="font-serif text-lg">AI Revit Documentation Engine</DialogTitle>
                <DialogDescription>
                  Automate lighting plans, plumbing diagrams, and millwork elevations in minutes.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {isGenerating ? (
            <div className="py-8 space-y-4 text-center">
              <div className="flex justify-center">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 animate-pulse">
                  <Compass className="h-8 w-8 animate-spin" />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-foreground">
                  {generationStep === 1 && "1/3 Analyzing architectural space & lux parameters..."}
                  {generationStep === 2 && "2/3 Generating Revit families, circuits & fixture symbols..."}
                  {generationStep === 3 && "3/3 Drafting sheet documentation & CAD schedule annotations..."}
                  {generationStep === 4 && "Automation completed! Preparing sheet for client approval..."}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Running Revit API automated script • Target: Under 5 minutes (Manual baseline: 2.5 hours)
                </p>
              </div>

              <Progress value={generationStep * 25} className="h-2" />
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Target Project</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={genData.projectId}
                  onChange={(e) => setGenData({ ...genData, projectId: e.target.value })}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.client_name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Plan Type</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={genData.type}
                    onChange={(e) => setGenData({ ...genData, type: e.target.value as DeliverableType })}
                  >
                    <option value="Lighting Plan">Lighting & Switching Plan</option>
                    <option value="Plumbing Plan">Plumbing & Fixtures Elevation</option>
                    <option value="Elevation">Interior Millwork Elevation</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Revit Sheet Number</label>
                  <Input
                    value={genData.sheetNumber}
                    onChange={(e) => setGenData({ ...genData, sheetNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Target Room / Zone</label>
                <Input
                  value={genData.room}
                  onChange={(e) => setGenData({ ...genData, room: e.target.value })}
                  placeholder="e.g. Master Suite, Kitchen Island, Dining Pavilion"
                />
              </div>

              <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-xs space-y-1 text-muted-foreground">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> Expected Productivity Gain:
                </span>
                <p>
                  Typical manual drafting: <strong>150 minutes</strong>.
                  Automated generation runtime: <strong>~3-4 minutes</strong> (97% faster delivery).
                </p>
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>Cancel</Button>
                <Button onClick={handleStartAiGeneration} className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                  Execute AI Automation
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review & Feedback Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Deliverable Review & Approval</DialogTitle>
            <DialogDescription>
              {activeDeliverable?.title} ({activeDeliverable?.sheet_number})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={activeDeliverable?.preview_url}
                alt="Plan Preview"
                className="w-full h-44 object-cover"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Client / Designer Feedback</label>
              <Textarea
                rows={3}
                placeholder="Enter client review notes, lighting adjustment requests, or contractor remarks..."
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleSaveReview('Changes Requested')}
              >
                Request Revisions
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSaveReview('Pending Review')}
              >
                Mark In Review
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                size="sm"
                onClick={() => handleSaveReview('Approved')}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve Sheet
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

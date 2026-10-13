"use client"

import * as React from "react"
import { Client, Project, ProjectDeliverable } from "@/types/crm"
import { realClientNote, realSheetPreview, SheetComment, SheetRevision } from "@/lib/sheet-notes"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import confetti from "canvas-confetti"
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  FileText,
  MapPin,
  Calendar,
  MessageCircle,
  ShieldCheck,
  Zap,
  Download,
  ThumbsUp,
  Eye,
  Send,
  Sliders,
  Share2
} from "lucide-react"

interface ClientPortalViewProps {
  client: Client
  project: Project
  deliverables: ProjectDeliverable[]
  onApproveDeliverable: (id: string, feedback?: string) => void
  onRequestChanges: (id: string, feedback: string) => void
  onBackToDashboard?: () => void
  mode?: 'studio' | 'client'
  shareUrl?: string
  comments?: SheetComment[]
  revisions?: SheetRevision[]
  onAddComment?: (deliverableId: string, body: string) => void
}

export function ClientPortalView({
  client,
  project,
  deliverables,
  onApproveDeliverable,
  onRequestChanges,
  onBackToDashboard,
  mode = 'studio',
  shareUrl,
  comments = [],
  revisions = [],
  onAddComment,
}: ClientPortalViewProps) {
  const [activePlanId, setActivePlanId] = React.useState<string>(deliverables[0]?.id || '')
  const [feedbackNote, setFeedbackNote] = React.useState('')
  const [commentDraft, setCommentDraft] = React.useState('')
  const [justApproved, setJustApproved] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const readySheets = deliverables.filter((item) => item.status === 'Pending Review')
  const activeDeliverable = deliverables.find(d => d.id === activePlanId) || deliverables[0]
  const activeComments = comments.filter((item) => item.deliverableId === activeDeliverable?.id)
  const activeRevisions = revisions.filter((item) => item.deliverableId === activeDeliverable?.id)

  const handleApprove = () => {
    if (!activeDeliverable) return

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      })
    } catch (e) {
      // ignore in SSR
    }

    onApproveDeliverable(activeDeliverable.id, feedbackNote || "Approved via Client Portal")
    setJustApproved(true)
    setTimeout(() => setJustApproved(false), 3000)
    setFeedbackNote('')
  }

  const handleReject = () => {
    if (!activeDeliverable || !feedbackNote) return
    onRequestChanges(activeDeliverable.id, feedbackNote)
    setFeedbackNote('')
  }

  return (
    <div className="space-y-6">
      {/* Client Portal Mode Banner */}
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 px-4 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="gold" className="text-[10px]">{mode === 'client' ? 'Your project' : 'Client Preview Mode'}</Badge>
          <span className="text-muted-foreground">
            {mode === 'client'
              ? `Review the latest drawings for ${project?.name || client.name}. Approve a sheet or leave a comment on it.`
              : <>Studio preview for <strong>{client.name}</strong> ({client.property_type}).</>}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {shareUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
            >
              <Share2 className="mr-1 h-3 w-3" />
              {copied ? 'Link copied' : 'Copy client link'}
            </Button>
          )}
          {onBackToDashboard && (
            <Button variant="outline" size="sm" onClick={onBackToDashboard} className="h-7 text-xs">
              Return to CRM Pipeline
            </Button>
          )}
        </div>
      </div>

      {mode === 'client' && readySheets.length > 0 && (
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
          New work is ready for review: {readySheets.map((item) => item.sheet_number).join(', ')}. The latest approved version stays marked on each sheet.
        </div>
      )}

      {/* Hero Estate Header */}
      <div className="relative overflow-hidden rounded-lg border border-border bg-card p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {client.property_type}
              </Badge>
              <span className="text-xs text-muted-foreground dark:text-neutral-400">• Style: {client.style_preference}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground dark:text-white">
              {project ? project.name : `${client.name}'s Residence`}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground dark:text-neutral-300">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {client.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Target Handover: {project ? new Date(project.target_date).toLocaleDateString() : 'Dec 2026'}
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />
                {project ? project.revit_version : 'Revit 2026.1 LOD 350'}
              </span>
            </div>
          </div>

          {/* Project Progress Card */}
          <div className="w-full md:w-64 rounded-xl border border-border/80 bg-background/90 dark:border-white/10 dark:bg-white/5 p-4 backdrop-blur-md space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground dark:text-neutral-300">Overall Progress</span>
              <span className="text-sm font-medium">{project ? project.progress_pct : 65}%</span>
            </div>
            <Progress value={project ? project.progress_pct : 65} className="h-2" />
            <div className="text-[11px] text-muted-foreground dark:text-neutral-400 text-right">
              Stage: <strong>{client.stage}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Plan Reviewer & Deliverable Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Deliverables List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Architectural Sheets & Plans
            </h3>
            <span className="text-xs text-muted-foreground">{deliverables.length} files</span>
          </div>

          <div className="space-y-2.5">
            {deliverables.length === 0 && (
              <p className="text-sm text-muted-foreground">No sheets on this project yet.</p>
            )}
            {deliverables.map((del) => (
              <div
                key={del.id}
                onClick={() => setActivePlanId(del.id)}
                className={`cursor-pointer rounded-xl border p-3 transition-all flex items-start justify-between gap-3 ${
                  activeDeliverable?.id === del.id
                    ? 'border-foreground/30 bg-muted'
                    : 'border-border/70 bg-card hover:border-border hover:bg-muted/40'
                }`}
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-muted-foreground">
                      [{del.sheet_number}]
                    </span>
                    <h4 className="font-medium text-xs truncate text-foreground">{del.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{del.type}</span>
                    <span>• {del.version}</span>
                  </div>
                </div>

                <Badge
                  variant={
                    del.status === 'Approved'
                      ? 'emerald'
                      : del.status === 'Changes Requested'
                      ? 'destructive'
                      : 'gold'
                  }
                  className="text-[10px] shrink-0"
                >
                  {del.status}
                </Badge>
              </div>
            ))}
          </div>

          {/* Direct WhatsApp Concierge Card */}
          <Card className="border-border/80 p-4 bg-muted/20 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold">Interior Architecture Concierge</h4>
                <p className="text-[11px] text-muted-foreground">Need urgent adjustments? Text the team</p>
              </div>
            </div>
            <a
              href={`https://wa.me/?text=Hello%20FlowMS%20team,%20inquiring%20about%20${encodeURIComponent(client.address)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 p-2 text-xs font-semibold text-white transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Chat with Project Lead on WhatsApp</span>
            </a>
          </Card>
        </div>

        {/* Right Column: Active Sheet Inspection & Approval Sign-off */}
        <div className="lg:col-span-8 space-y-4">
          {!activeDeliverable ? (
            <p className="py-8 text-sm text-muted-foreground">Sheets appear here once the studio issues them.</p>
          ) : (
          <Card className="border-border/80 overflow-hidden">
            <CardHeader className="border-b border-border/50 pb-3 flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">{activeDeliverable?.sheet_number}</Badge>
                  {activeDeliverable?.ai_automated && (
                    <Badge variant="gold" className="text-[10px] gap-1">
                      <Zap className="h-3 w-3 fill-amber-500 text-amber-500" /> AI Automated Documentation
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg mt-1">{activeDeliverable?.title}</CardTitle>
                <CardDescription>
                  {realSheetPreview(activeDeliverable?.preview_url)
                    ? 'The drawing attached to this sheet.'
                    : 'No drawing file is attached. You can still approve this issue or ask for a change.'}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={activeDeliverable?.status === 'Approved' ? 'emerald' : 'gold'}
                  className="text-xs px-2.5 py-0.5"
                >
                  {activeDeliverable?.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Preview image */}
              <div className="relative overflow-hidden rounded-xl border border-border bg-neutral-950">
                {realSheetPreview(activeDeliverable?.preview_url) ? (
                  <img
                    src={realSheetPreview(activeDeliverable?.preview_url)}
                    alt={activeDeliverable?.title}
                    className="h-56 w-full object-contain sm:h-80"
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center px-6 text-center text-sm text-neutral-400 sm:h-48">
                    Sheet {activeDeliverable?.sheet_number}. No drawing file is attached yet.
                  </div>
                )}
                <div className="absolute bottom-3 left-3 rounded-lg border border-white/20 bg-black/75 px-3 py-1.5 text-xs text-white">
                  Version {activeDeliverable?.version}
                </div>
              </div>

              {realClientNote(activeDeliverable?.client_feedback) && (
                <div className="rounded-lg border border-border/60 bg-muted/40 p-3 text-xs">
                  <span className="mb-0.5 block font-semibold text-foreground">Latest review note</span>
                  <p className="text-muted-foreground">{realClientNote(activeDeliverable?.client_feedback)}</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Comments on this sheet</h4>
                {activeComments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No comments on this sheet yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {activeComments.map((comment) => (
                      <li key={comment.id} className="rounded-lg border border-border px-3 py-2 text-xs">
                        {comment.body}
                      </li>
                    ))}
                  </ul>
                )}
                {onAddComment && activeDeliverable && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Textarea
                      rows={2}
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      placeholder="Comment on this sheet"
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      disabled={!commentDraft.trim()}
                      onClick={() => {
                        onAddComment(activeDeliverable.id, commentDraft.trim())
                        setCommentDraft('')
                      }}
                    >
                      Add comment
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Revision history</h4>
                {activeRevisions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No earlier revisions recorded. The version on the sheet is the current one.</p>
                ) : (
                  <ul className="space-y-2">
                    {activeRevisions.map((revision) => (
                      <li key={revision.id} className="text-xs text-muted-foreground">
                        <span className="text-foreground">{revision.version}</span> · {revision.status}
                        <span className="block">{revision.note}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Approval controls */}
              <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Client Sign-Off & Approvals
                </h4>

                <Textarea
                  rows={2}
                  placeholder="Optional review notes, lighting adjustments or questions before sign-off..."
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  className="text-xs"
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="text-[11px] text-muted-foreground">
                    By clicking Approve, you authorize the project team to proceed to procurement & contractor fabrication.
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReject}
                      disabled={!feedbackNote}
                      className="text-xs flex-1 sm:flex-none"
                    >
                      Request Revisions
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleApprove}
                      disabled={activeDeliverable?.status === 'Approved'}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 flex-1 sm:flex-none shadow-sm shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{activeDeliverable?.status === 'Approved' ? 'Already Approved' : 'Sign Off & Approve'}</span>
                    </Button>
                  </div>
                </div>

                {justApproved && (
                  <div className="text-center text-xs font-semibold text-emerald-500 pt-2 animate-bounce">
                    🎉 Sheet {activeDeliverable?.sheet_number} approved! Your team has been notified.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </div>
  )
}

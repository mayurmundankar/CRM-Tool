"use client"

import * as React from "react"
import { CommunicationLog, Client } from "@/types/crm"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Send,
  CheckCheck,
  Phone,
  Clock,
  Sparkles,
  Zap,
  ShieldCheck,
  User,
  ArrowRight,
} from "lucide-react"
import { readConsent, writeConsent } from "@/lib/consent"

interface WhatsAppHubProps {
  logs: CommunicationLog[]
  clients: Client[]
  onSendNotification: (
    clientId: string,
    clientName: string,
    phone: string,
    message: string,
    triggerType: CommunicationLog['trigger_type'],
    status?: CommunicationLog['status'],
    channel?: CommunicationLog['channel']
  ) => void
}

const TEMPLATES = [
  {
    id: 'plan_ready',
    name: 'Plan Sheet Ready for Review',
    text: 'Hello {NAME}, your automated {SHEET} has been drafted by our Revit BIM team and is ready on your client portal. Click to review & sign off: https://atelierbim.studio/portal/{ID}',
  },
  {
    id: 'milestone_completed',
    name: 'Milestone Phase Completed',
    text: 'Exciting update for {NAME}: The schematic design & technical documentation phase for your {PROPERTY} has completed! View the latest 3D renders on your portal: https://atelierbim.studio/portal/{ID}',
  },
  {
    id: 'approval_request',
    name: 'Urgent Sign-Off Request',
    text: 'Dear {NAME}, we require your approval on the master bathroom plumbing elevation before contractor fabrication begins this Friday. Thank you!',
  },
  {
    id: 'site_update',
    name: 'Site Inspection & Progress',
    text: 'Good afternoon {NAME}, our architectural team completed today\'s site inspection. All framing dimensions match the Revit BIM model precisely. Photos uploaded to your portal.',
  }
]

export function WhatsAppHub({ logs, clients, onSendNotification }: WhatsAppHubProps) {
  const [selectedClientId, setSelectedClientId] = React.useState<string>(clients[0]?.id || '')
  const [messageText, setMessageText] = React.useState('')
  const [selectedTemplate, setSelectedTemplate] = React.useState('plan_ready')
  const [justSent, setJustSent] = React.useState(false)
  const [channel, setChannel] = React.useState<'whatsapp' | 'email'>('whatsapp')
  const [consentEmail, setConsentEmail] = React.useState(false)
  const [consentWhatsapp, setConsentWhatsapp] = React.useState(false)
  const [sendNote, setSendNote] = React.useState<string | null>(null)
  const [forceNext, setForceNext] = React.useState(false)

  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0]

  React.useEffect(() => {
    if (!selectedClient) return
    const consent = readConsent(selectedClient.id)
    setConsentEmail(consent.email)
    setConsentWhatsapp(consent.whatsapp)
    applyTemplate(selectedTemplate, selectedClient)
  }, [selectedClientId])

  const applyTemplate = (templateId: string, client: Client) => {
    const tmpl = TEMPLATES.find(t => t.id === templateId)
    if (!tmpl || !client) return
    const customized = tmpl.text
      .replace('{NAME}', client.name)
      .replace('{PROPERTY}', client.property_type)
      .replace('{SHEET}', 'Lighting & Switching Plan (Sheet E-101)')
      .replace('{ID}', client.id)
    setMessageText(customized)
  }

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    if (selectedClient) {
      applyTemplate(templateId, selectedClient)
    }
  }

  const dispatch = async (force: boolean, logOnly: boolean) => {
    if (!selectedClient || !messageText) return
    setSendNote(null)
    const consent = { email: consentEmail, whatsapp: consentWhatsapp }
    writeConsent(selectedClient.id, consent)

    if (logOnly) {
      onSendNotification(selectedClient.id, selectedClient.name, selectedClient.phone, messageText, selectedTemplate as CommunicationLog['trigger_type'], 'logged', channel)
      setSendNote('Logged on the client record. Nothing was sent.')
      setJustSent(true)
      return
    }

    const recentMessages = logs
      .filter((log) => log.client_id === selectedClient.id)
      .map((log) => ({ message: log.message, sentAt: log.sent_at }))
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel,
        email: selectedClient.email,
        phone: selectedClient.phone,
        clientName: selectedClient.name,
        message: messageText,
        consentEmail,
        consentWhatsapp,
        force,
        recentMessages,
      }),
    })
    const data = await res.json()
    if (data.status === 'duplicate') {
      setForceNext(true)
      setSendNote(data.detail)
      return
    }
    if (data.status === 'consent') {
      setSendNote(data.detail)
      return
    }
    const status: CommunicationLog['status'] = data.status === 'delivered' ? 'delivered' : data.status === 'failed' ? 'failed' : 'logged'
    const recipient = channel === 'email' ? selectedClient.email : selectedClient.phone
    onSendNotification(
      selectedClient.id,
      selectedClient.name,
      recipient,
      messageText,
      selectedTemplate as CommunicationLog['trigger_type'],
      status,
      channel
    )
    setForceNext(false)
    setSendNote(data.detail || 'Saved.')
    setJustSent(true)
  }

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault()
    void dispatch(forceNext, false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/60 pb-5">
        <div className="flex items-center gap-2">
          <Badge variant="emerald" className="gap-1 text-xs">
            <MessageCircle className="h-3 w-3" /> WhatsApp Business API Integration
          </Badge>
          <span className="text-xs text-muted-foreground">Automated Client Touchpoints & Transparency</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground mt-1">
          WhatsApp & Client Notification Center
        </h2>
        <p className="text-sm text-muted-foreground">
          Send automated milestone notifications, deliverable approval requests, and site updates straight to your client&apos;s phone.
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="py-12">
          <h3 className="text-base font-medium">No clients yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Add a client to draft a WhatsApp update and keep it on their record.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Message Composer */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-4 w-4 text-emerald-500" /> Send Automated WhatsApp Notification
              </CardTitle>
              <CardDescription>
                Choose client recipient and template trigger to dispatch real-time mobile alerts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Select Client</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.property_type})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Recipient WhatsApp Number</label>
                    <Input
                      readOnly
                      value={selectedClient ? selectedClient.phone : ''}
                      className="bg-muted/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Automation Template</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TEMPLATES.map((tmpl) => (
                      <button
                        type="button"
                        key={tmpl.id}
                        onClick={() => handleTemplateChange(tmpl.id)}
                        className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                          selectedTemplate === tmpl.id
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                            : 'border-border/60 hover:bg-muted text-muted-foreground'
                        }`}
                      >
                        {tmpl.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Message Body</label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        if (!selectedClient) return
                        const prompt = `Draft a personalized WhatsApp update for interior design client ${selectedClient.name}. Property: ${selectedClient.property_type}. Current stage: ${selectedClient.stage}. Mention our Revit documentation progress.`
                        const res = await (await import('@/lib/groq-client')).generateWithGroq({
                          prompt,
                          task: 'whatsapp',
                        })
                        if (res.content) {
                          setMessageText(res.content.replace(/^["']|["']$/g, '').trim())
                        }
                      }}
                      className="h-6 text-[11px] gap-1 text-amber-600 dark:text-amber-400 hover:text-amber-500"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Draft with Groq AI</span>
                    </Button>
                  </div>
                  <Textarea
                    rows={4}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Write message..."
                    className="font-sans text-xs"
                  />
                </div>

                <div className="space-y-2 rounded-lg border border-border px-3 py-3 text-xs">
                  <p className="font-semibold uppercase text-muted-foreground">Consent and channel</p>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setChannel('whatsapp')} className={`rounded-md border px-2 py-1 ${channel === 'whatsapp' ? 'border-foreground' : 'border-border text-muted-foreground'}`}>WhatsApp</button>
                    <button type="button" onClick={() => setChannel('email')} className={`rounded-md border px-2 py-1 ${channel === 'email' ? 'border-foreground' : 'border-border text-muted-foreground'}`}>Email</button>
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={consentWhatsapp} onChange={(event) => setConsentWhatsapp(event.target.checked)} />
                    Client agreed to WhatsApp
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={consentEmail} onChange={(event) => setConsentEmail(event.target.checked)} />
                    Client agreed to email
                  </label>
                  <p className="text-muted-foreground">Without a provider key, an approved send is kept on the log and is not delivered. Duplicate text from the last day asks before sending again.</p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>{forceNext ? 'Send again' : channel === 'email' ? 'Send email' : 'Send WhatsApp'}</span>
                  </Button>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => void dispatch(false, true)}>
                    Log draft only
                  </Button>
                </div>

                {sendNote && (
                  <p className="text-xs text-muted-foreground">{sendNote}</p>
                )}
                {justSent && !sendNote && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-500 font-medium py-1">
                    <CheckCheck className="h-4 w-4" /> Saved.
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp Mobile Device Live Simulator */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm rounded-[36px] border-4 border-neutral-800 bg-neutral-950 p-3 shadow-2xl">
            {/* Phone Notch */}
            <div className="mx-auto h-4 w-28 rounded-full bg-neutral-800 mb-2" />

            {/* Chat header */}
            <div className="flex items-center gap-2.5 rounded-t-2xl bg-[#075E54] p-3 text-white">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                FM
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-bold truncate">FlowMS</div>
                <div className="text-[10px] text-emerald-200">Official Client Portal Bot</div>
              </div>
            </div>

            {/* Chat conversation area */}
            <div className="h-96 overflow-y-auto bg-[#0b141a] p-3 space-y-3 text-xs bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
              <div className="text-center text-[10px] text-neutral-400 bg-neutral-800/60 rounded px-2 py-0.5 w-fit mx-auto">
                End-to-end encrypted
              </div>

              {/* Simulated inbound messages */}
              <div className="flex flex-col gap-1 items-end">
                <div className="max-w-[85%] rounded-lg rounded-tr-none bg-[#005c4b] p-2.5 text-white shadow-xs">
                  <p className="leading-relaxed text-xs">{messageText || "Select a template above to preview text..."}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-emerald-200">
                    <span>Just now</span>
                    <CheckCheck className="h-3 w-3 text-[#53bdeb]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Phone bottom bar */}
            <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-neutral-700" />
          </div>
        </div>
      </div>
    )}

      {/* Communication Log History */}
      <Card className="border-border/80">
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" /> Automated Notification Audit Log
          </CardTitle>
          <CardDescription>
            History of automated notifications sent across all client accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No WhatsApp notifications sent yet.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {logs.map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{log.client_name}</span>
                      <Badge variant="emerald" className="text-[10px] py-0">{log.recipient_phone_or_email}</Badge>
                      <Badge variant="outline" className="text-[10px] py-0">{log.trigger_type.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-1">{log.message}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-muted-foreground text-[11px]">
                    <span>{new Date(log.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className={`flex items-center gap-1 font-medium ${log.status === 'failed' ? 'text-destructive' : 'text-emerald-500'}`}>
                      <CheckCheck className="h-3.5 w-3.5" />
                      {log.status === 'failed' ? 'Failed' : log.status === 'logged' ? 'Logged' : log.status === 'delivered' ? 'Delivered' : 'Sent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

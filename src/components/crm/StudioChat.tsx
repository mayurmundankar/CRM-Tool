"use client"

import * as React from "react"
import { Client, CommunicationLog, Inquiry, Invoice, Project, ProjectDeliverable } from "@/types/crm"
import { generateWithGroq } from "@/lib/groq-client"
import { buildChatSystemPrompt } from "@/lib/studio-context"
import { ActionProposal, proposeStudioAction } from "@/lib/studio-actions"
import { readConsent } from "@/lib/consent"
import { PageHeading } from "@/components/crm/PageHeading"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface StudioChatProps {
  clients: Client[]
  projects: Project[]
  deliverables: ProjectDeliverable[]
  invoices: Invoice[]
  inquiries: Inquiry[]
  logs: CommunicationLog[]
  onApproveAction?: (proposal: ActionProposal) => Promise<string>
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean)
  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key} className="font-medium text-foreground">{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={key}>{part.slice(1, -1)}</em>
    }
    return <React.Fragment key={key}>{part}</React.Fragment>
  })
}

function answerLines(content: string) {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/```[a-z]*\n?/gi, '')
    .split('\n')
    .flatMap((line) => {
      const trimmed = line.trim().replace(/^[-*]\s+/, '').replace(/^\d+[.)]\s+/, '')
      if (!trimmed) return ['']
      if (trimmed.includes('|') && trimmed.includes(':')) {
        return trimmed.split('|').map((part) => part.trim()).filter(Boolean)
      }
      return [trimmed]
    })
}

function ChatAnswer({ content }: { content: string }) {
  const blocks: React.ReactNode[] = []
  let facts: { label: string; value: string }[] = []
  let factKey = 0

  const flushFacts = () => {
    if (!facts.length) return
    const rows = facts
    facts = []
    blocks.push(
      <dl key={`facts-${factKey++}`} className="divide-y divide-border/80">
        {rows.map((row) => (
          <div key={row.label + row.value} className="grid grid-cols-[6.5rem_1fr] gap-3 py-1.5">
            <dt className="text-xs text-muted-foreground">{row.label}</dt>
            <dd className="text-sm leading-relaxed">{renderInline(row.value, row.label)}</dd>
          </div>
        ))}
      </dl>
    )
  }

  answerLines(content).forEach((line, index) => {
    if (!line) {
      flushFacts()
      return
    }
    const fact = line.match(/^(?:\*\*)?([^:*]{2,28})(?:\*\*)?:\s+(.+)$/)
    if (fact) {
      facts.push({ label: fact[1].replace(/\*\*/g, ''), value: fact[2] })
      return
    }
    flushFacts()
    blocks.push(
      <p key={`text-${index}`} className="text-sm font-medium leading-relaxed">
        {renderInline(line.replace(/\*\*/g, ''), `text-${index}`)}
      </p>
    )
  })
  flushFacts()

  return <div className="space-y-2">{blocks}</div>
}

const SUGGESTIONS = [
  'Which invoices are still unpaid?',
  'Create a task to follow up on the pending kitchen drawings.',
  'Draft an update for clients waiting for approval.',
  'Prepare a milestone invoice for this project.',
  'Show delayed projects and suggest how to recover them.',
]

export function StudioChat({
  clients,
  projects,
  deliverables,
  invoices,
  inquiries,
  logs,
  onApproveAction,
}: StudioChatProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [draft, setDraft] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [proposal, setProposal] = React.useState<ActionProposal | null>(null)
  const lastMessageRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages, pending])

  const ask = async (text: string) => {
    const question = text.trim()
    if (!question || pending) return

    const history = [...messages, { role: 'user' as const, content: question }]
    setMessages(history)
    setDraft('')
    setError(null)
    setProposal(null)

    const proposed = proposeStudioAction(question, { clients, projects, deliverables, invoices, inquiries }, readConsent)
    if (proposed) {
      setProposal(proposed)
      setMessages((current) => [...current, { role: 'assistant', content: proposed.summary }])
      return
    }

    setPending(true)

    const transcript = history
      .map((message) => `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}`)
      .join('\n\n')

    const result = await generateWithGroq({
      task: 'chat',
      systemPrompt: buildChatSystemPrompt({ clients, projects, deliverables, invoices, inquiries, logs }),
      prompt: transcript,
    })

    setPending(false)
    if (result.error || !result.content) {
      setError(result.requiresKey
        ? 'Studio Chat is unavailable until GROQ_API_KEY is set on the server.'
        : result.error || 'Studio Chat could not answer.')
      return
    }

    setMessages((current) => [...current, { role: 'assistant', content: result.content || '' }])
  }

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void ask(draft)
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] min-h-[520px] flex-col">
      <PageHeading
        eyebrow="FlowMS"
        title="Studio Chat"
        description="Ask about the studio, or ask it to draft a task, an update, or an invoice. Changes wait for your approval."
      />

      <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-card">
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Try a question about a project already in the studio.</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void ask(suggestion)}
                    className="rounded-full border border-border px-3 py-1 text-left text-xs text-foreground hover:bg-muted"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              ref={index === messages.length - 1 ? lastMessageRef : undefined}
              className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
            >
              <div
                className={
                  message.role === 'user'
                    ? 'max-w-[80%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground'
                    : 'w-full max-w-xl rounded-lg border border-border bg-background px-4 py-3 text-foreground'
                }
              >
                {message.role === 'user' ? (
                  <p className="leading-relaxed">{message.content}</p>
                ) : (
                  <ChatAnswer content={message.content} />
                )}
              </div>
            </div>
          ))}

          {pending && <p className="text-sm text-muted-foreground">Looking through the studio records…</p>}
          {proposal && (
            <div className="rounded-lg border border-border bg-background px-4 py-3">
              <p className="text-sm font-medium">{proposal.summary}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{proposal.preview}</p>
              <p className="mt-2 text-xs text-muted-foreground">{proposal.reason}</p>
              {proposal.blockReason && <p className="mt-2 text-xs text-destructive">{proposal.blockReason}</p>}
              <div className="mt-3 flex gap-2">
                {proposal.needsApproval && (
                  <Button
                    type="button"
                    size="sm"
                    disabled={!proposal.ready || pending || !onApproveAction}
                    onClick={() => {
                      if (!onApproveAction) return
                      setPending(true)
                      void onApproveAction(proposal).then((result) => {
                        setPending(false)
                        setProposal(null)
                        setMessages((current) => [...current, { role: 'assistant', content: result }])
                      })
                    }}
                  >
                    Approve
                  </Button>
                )}
                <Button type="button" size="sm" variant="outline" onClick={() => setProposal(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-border p-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void ask(draft)
              }
            }}
            rows={2}
            placeholder="Ask about a project, client, sheet, or invoice"
            className="min-h-0 resize-none"
          />
          <Button type="submit" disabled={pending || !draft.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}

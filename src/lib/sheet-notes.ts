import { ApprovalStatus, CommunicationLog } from '@/types/crm'

export interface SheetComment {
  id: string
  deliverableId: string
  body: string
  createdAt: string
}

export interface SheetRevision {
  id: string
  deliverableId: string
  version: string
  status: string
  note: string
  createdAt: string
}

export function commentMessage(deliverableId: string, sheetNumber: string, body: string) {
  return `[[c:${deliverableId}]]Comment on ${sheetNumber}: ${body}`
}

export function revisionMessage(
  deliverableId: string,
  version: string,
  status: ApprovalStatus | string,
  sheetNumber: string,
  note: string
) {
  const detail = note ? ` ${note}` : ''
  return `[[r:${deliverableId}|${version}|${status}]]Revision ${version} of ${sheetNumber} marked ${status}.${detail}`
}

const PLACEHOLDER_NOTE = 'Generated in 4m 15s via Revit Automation Engine.'

export function realSheetPreview(url?: string) {
  if (!url || url.includes('images.unsplash.com')) return ''
  return url
}

export function realClientNote(note?: string) {
  if (!note || note.startsWith(PLACEHOLDER_NOTE)) return ''
  return note
}

export function displayLogMessage(message: string) {
  return message.replace(/^\[\[[cr]:[^\]]+\]\]/, '')
}

export function commentsFor(logs: CommunicationLog[], deliverableId: string): SheetComment[] {
  return logs.flatMap((log) => {
    const match = log.message.match(/^\[\[c:([^\]]+)\]\]Comment on [^:]+:\s*([\s\S]*)$/)
    if (!match || match[1] !== deliverableId) return []
    return [{ id: log.id, deliverableId, body: match[2], createdAt: log.sent_at }]
  })
}

export function revisionsFor(logs: CommunicationLog[], deliverableId: string): SheetRevision[] {
  return logs.flatMap((log) => {
    const match = log.message.match(/^\[\[r:([^|\]]+)\|([^|\]]+)\|([^\]]+)\]\]([\s\S]*)$/)
    if (!match || match[1] !== deliverableId) return []
    return [{
      id: log.id,
      deliverableId,
      version: match[2],
      status: match[3],
      note: match[4],
      createdAt: log.sent_at,
    }]
  })
}

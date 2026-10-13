import { NextRequest, NextResponse } from 'next/server'

interface NotifyBody {
  channel?: 'email' | 'whatsapp'
  email?: string
  phone?: string
  clientName?: string
  message?: string
  consentEmail?: boolean
  consentWhatsapp?: boolean
  force?: boolean
  recentMessages?: { message: string; sentAt: string }[]
}

function digits(phone: string) {
  return phone.replace(/\D/g, '')
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as NotifyBody | null
  const channel = body?.channel === 'email' ? 'email' : 'whatsapp'
  const message = String(body?.message || '').trim()
  const clientName = String(body?.clientName || 'Client')
  if (!message) return NextResponse.json({ status: 'failed', detail: 'Write a message first.' }, { status: 400 })

  const allowed = channel === 'email' ? Boolean(body?.consentEmail) : Boolean(body?.consentWhatsapp)
  if (!allowed) {
    return NextResponse.json({
      status: 'consent',
      detail: `This client has not agreed to ${channel === 'email' ? 'email' : 'WhatsApp'}. Log the draft, or record consent first.`,
    })
  }

  const cutoff = Date.now() - 24 * 60 * 60 * 1000
  const duplicate = (body?.recentMessages || []).some((row) => {
    return row.message.trim() === message && new Date(row.sentAt).getTime() >= cutoff
  })
  if (duplicate && !body?.force) {
    return NextResponse.json({
      status: 'duplicate',
      detail: 'The same message was sent to this client in the last day.',
    })
  }

  if (channel === 'email') {
    const key = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM
    const to = String(body?.email || '').trim()
    if (!key || !from) {
      return NextResponse.json({
        status: 'logged',
        detail: 'Saved to the project log. Live email is off until RESEND_API_KEY and RESEND_FROM are set.',
      })
    }
    if (!to) return NextResponse.json({ status: 'failed', detail: 'This client has no email address.' })
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `Update for ${clientName}`,
        text: message,
      }),
    })
    if (!res.ok) {
      const detail = await res.text()
      return NextResponse.json({ status: 'failed', detail: detail.slice(0, 280) || 'Email could not be sent.' })
    }
    return NextResponse.json({ status: 'delivered', detail: `Email sent to ${to}.` })
  }

  const token = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const to = digits(String(body?.phone || ''))
  if (!token || !phoneNumberId) {
    return NextResponse.json({
      status: 'logged',
      detail: 'Saved to the project log. Live WhatsApp is off until WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID are set.',
    })
  }
  if (!to) return NextResponse.json({ status: 'failed', detail: 'This client has no phone number.' })
  const res = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    }),
  })
  if (!res.ok) {
    const detail = await res.text()
    return NextResponse.json({ status: 'failed', detail: detail.slice(0, 280) || 'WhatsApp could not be sent.' })
  }
  return NextResponse.json({ status: 'delivered', detail: `WhatsApp sent to ${to}.` })
}

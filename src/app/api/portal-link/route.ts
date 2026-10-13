import { NextRequest, NextResponse } from 'next/server'
import { signPortalClient } from '@/lib/portal-link'

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId') || ''
  if (!clientId) {
    return NextResponse.json({ error: 'A client is required.' }, { status: 400 })
  }
  const signature = signPortalClient(clientId)
  const url = `${req.nextUrl.origin}/portal/${clientId}/${signature}`
  return NextResponse.json({ url })
}

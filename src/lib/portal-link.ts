import { createHmac, timingSafeEqual } from 'crypto'

function secret() {
  return process.env.PORTAL_LINK_SECRET || process.env.GROQ_API_KEY || 'flowms-portal-dev'
}

export function signPortalClient(clientId: string) {
  return createHmac('sha256', secret()).update(clientId).digest('base64url')
}

export function verifyPortalClient(clientId: string, signature: string) {
  if (!clientId || !signature) return false
  const expected = signPortalClient(clientId)
  const left = Buffer.from(expected)
  const right = Buffer.from(signature)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

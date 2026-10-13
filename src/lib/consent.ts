export interface ClientConsent {
  email: boolean
  whatsapp: boolean
}

const KEY = 'crm_client_consent'

function readAll(): Record<string, ClientConsent> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export function readConsent(clientId: string): ClientConsent {
  return readAll()[clientId] || { email: false, whatsapp: false }
}

export function writeConsent(clientId: string, consent: ClientConsent) {
  if (typeof window === 'undefined') return
  const all = readAll()
  all[clientId] = consent
  localStorage.setItem(KEY, JSON.stringify(all))
}

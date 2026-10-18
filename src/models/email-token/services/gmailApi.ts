/** Minimal Gmail/Google REST client. Every call takes the access token explicitly; nothing is stored. */

const USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'
const SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send'
const REQUEST_TIMEOUT_MS = 15_000

type FetchLike = typeof fetch

export interface GmailAccount {
  email: string
  name: string
}

export interface OutgoingMessage {
  to: string
  subject: string
  body: string
}

export class GmailApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'GmailApiError'
    this.status = status
  }
}

/** Deliberately simple: no whitespace (so no CR/LF header injection), one @, and a dotted domain. */
const EMAIL_PATTERN = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/

export function isValidEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_PATTERN.test(value)
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function toBase64Url(value: string): string {
  return toBase64(new TextEncoder().encode(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function encodeHeader(value: string): string {
  if (/[\r\n]/.test(value)) throw new Error('Header values must be a single line.')
  const isPlainAscii = /^[\x20-\x7e]*$/.test(value)
  return isPlainAscii ? value : `=?UTF-8?B?${toBase64(new TextEncoder().encode(value))}?=`
}

function wrapBase64(value: string): string {
  return value.match(/.{1,76}/g)?.join('\r\n') ?? ''
}

/** RFC 2822 plain-text message, base64url-encoded as the Gmail API's `raw` field expects. */
export function buildRawMessage({ to, subject, body }: OutgoingMessage): string {
  if (!isValidEmail(to)) throw new Error('Recipient is not a valid email address.')

  const message = [
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    wrapBase64(toBase64(new TextEncoder().encode(body))),
  ].join('\r\n')

  return toBase64Url(message)
}

/** The only message this app sends: a harmless connectivity check with no payslip data. */
export function buildTestMessage(to: string, sentAt: Date): OutgoingMessage {
  return {
    to,
    subject: 'Generic Payroll test dispatch',
    body: [
      'This is a test message from Generic Payroll.',
      '',
      'If you can read this, the Gmail relay is working. No payslip data was sent.',
      `Sent at ${sentAt.toISOString()}`,
    ].join('\r\n'),
  }
}

/** What Google's JSON error body says, reduced to the few fields we use. All optional: bodies vary. */
interface GoogleErrorDetail {
  reason: string
  message: string
  /** `projects/<number>` of the Cloud project the request was billed to, when Google says. */
  consumer: string
}

const NO_DETAIL: GoogleErrorDetail = { reason: '', message: '', consumer: '' }

const asText = (value: unknown): string => (typeof value === 'string' ? value : '')

async function readGoogleError(response: Response): Promise<GoogleErrorDetail> {
  try {
    const body: unknown = await response.json()
    const error = (body as { error?: unknown } | null)?.error
    if (typeof error !== 'object' || error === null) return NO_DETAIL

    const { message, status, errors, details } = error as {
      message?: unknown
      status?: unknown
      errors?: unknown
      details?: unknown
    }
    const info = (Array.isArray(details) ? details : []).find(
      (item): item is { reason?: unknown; metadata?: { consumer?: unknown } } =>
        typeof item === 'object' && item !== null && 'reason' in item,
    )
    const legacy = Array.isArray(errors)
      ? (errors[0] as { reason?: unknown } | undefined)
      : undefined

    return {
      reason: asText(info?.reason) || asText(legacy?.reason) || asText(status),
      message: asText(message),
      consumer: asText(info?.metadata?.consumer),
    }
  } catch {
    return NO_DETAIL
  }
}

const SERVICE_DISABLED = ['SERVICE_DISABLED', 'accessNotConfigured']
const SCOPE_MISSING = ['ACCESS_TOKEN_SCOPE_INSUFFICIENT', 'insufficientPermissions']
const SEND_LIMIT = ['rateLimitExceeded', 'userRateLimitExceeded', 'dailyLimitExceeded']

function clip(text: string, max = 200): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function forbiddenMessage({ reason, message, consumer }: GoogleErrorDetail): string {
  if (SERVICE_DISABLED.includes(reason)) {
    // Digits only, so nothing from the response can end up inside the link we show.
    const project = /(\d{5,})/.exec(consumer)?.[1] ?? /project (\d{5,})/.exec(message)?.[1]
    const where = project
      ? `Enable it at https://console.cloud.google.com/apis/library/gmail.googleapis.com?project=${project}`
      : 'Enable it under APIs & Services → Library'
    return `The Gmail API is not enabled for the Google Cloud project behind this app's Client ID${project ? ` (project ${project})` : ''}. ${where}, wait a minute, then try again.`
  }
  if (SCOPE_MISSING.includes(reason)) {
    return 'Google did not grant permission to send email. Sign out, sign in again and allow sending email on your behalf.'
  }
  if (SEND_LIMIT.includes(reason)) {
    return "This Google account has reached Gmail's sending limit. Try again later."
  }
  return message
    ? `Google refused the request: ${clip(message)}`
    : 'Google refused the request. Check that the Gmail API is enabled for this project and that send permission was granted.'
}

function statusMessage(status: number, detail: GoogleErrorDetail): string {
  if (status === 401) return 'Your Google session has expired. Sign in again.'
  if (status === 403) return forbiddenMessage(detail)
  if (status === 429) return 'Google is rate limiting requests. Wait a moment and try again.'
  return detail.message
    ? `Google returned an error (${status}): ${clip(detail.message)}`
    : `Google returned an error (${status}).`
}

async function callGoogle(fetchImpl: FetchLike, url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetchImpl(url, { ...init, signal: controller.signal })
    if (!response.ok) {
      const detail = response.status === 401 ? NO_DETAIL : await readGoogleError(response)
      throw new GmailApiError(response.status, statusMessage(response.status, detail))
    }
    return response
  } catch (error) {
    if (error instanceof GmailApiError) throw error
    const timedOut = error instanceof DOMException && error.name === 'AbortError'
    throw new GmailApiError(
      0,
      timedOut
        ? 'Google did not respond in time. Check your connection and try again.'
        : 'Could not reach Google. Check your connection and try again.',
    )
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchProfile(
  accessToken: string,
  fetchImpl: FetchLike = fetch,
): Promise<GmailAccount> {
  const response = await callGoogle(fetchImpl, USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const profile = (await response.json()) as { email?: unknown; name?: unknown }

  if (typeof profile.email !== 'string' || !isValidEmail(profile.email)) {
    throw new GmailApiError(
      response.status,
      'Google did not return an email address for this account.',
    )
  }
  const name =
    typeof profile.name === 'string' && profile.name.trim() ? profile.name : profile.email
  return { email: profile.email, name }
}

export async function sendMessage(
  accessToken: string,
  message: OutgoingMessage,
  fetchImpl: FetchLike = fetch,
): Promise<{ id: string }> {
  const response = await callGoogle(fetchImpl, SEND_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: buildRawMessage(message) }),
  })
  const result = (await response.json()) as { id?: unknown }
  return { id: typeof result.id === 'string' ? result.id : '' }
}

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GmailApiError } from '@/models/email-token/services/gmailApi'
import { GOOGLE_SCOPES, type GoogleToken } from '@/models/email-token/services/googleIdentity'
import { createGmailSession, type GmailSessionDeps } from '../gmailSession'

const CLIENT_ID = 'test-client.apps.googleusercontent.com'
const START = new Date('2025-05-15T08:30:00.000Z')

/** Deps whose functions are typed spies, so each test can script one call at a time. */
function makeDeps(clientId = CLIENT_ID) {
  return {
    clientId,
    load: vi.fn<GmailSessionDeps['load']>(async () => {}),
    requestToken: vi.fn<GmailSessionDeps['requestToken']>(async () => ({
      accessToken: 'token-1',
      expiresInSeconds: 3600,
    })),
    revoke: vi.fn<GmailSessionDeps['revoke']>(async () => {}),
    fetchProfile: vi.fn<GmailSessionDeps['fetchProfile']>(async () => ({
      email: 'test.user@example.com',
      name: 'Test User',
    })),
    sendMessage: vi.fn<GmailSessionDeps['sendMessage']>(async () => ({ id: 'msg-1' })),
    now: () => Date.now(),
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(START)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('createGmailSession: configuration', () => {
  it('reports itself unconfigured without a client ID and refuses to sign in', async () => {
    const deps = makeDeps('')
    const session = createGmailSession(deps)

    await session.signIn()

    expect(session.configured).toBe(false)
    expect(session.status.value).toBe('signed-out')
    expect(session.error.value).toMatch(/not configured/i)
    expect(deps.requestToken).not.toHaveBeenCalled()
  })

  it('pre-loads Google on prepare, and stays quiet when unconfigured', async () => {
    const configured = makeDeps()
    await createGmailSession(configured).prepare()
    expect(configured.load).toHaveBeenCalledOnce()

    const unconfigured = makeDeps('')
    await createGmailSession(unconfigured).prepare()
    expect(unconfigured.load).not.toHaveBeenCalled()
  })

  it('surfaces a script-load failure from prepare', async () => {
    const deps = makeDeps()
    deps.load.mockRejectedValueOnce(new Error('Could not load Google sign-in.'))
    const session = createGmailSession(deps)

    await session.prepare()

    expect(session.error.value).toBe('Could not load Google sign-in.')
  })
})

describe('createGmailSession: signIn', () => {
  it('signs in, records the account and a one-hour expiry', async () => {
    const deps = makeDeps()
    const session = createGmailSession(deps)

    await session.signIn()

    expect(deps.requestToken).toHaveBeenCalledWith(CLIENT_ID, GOOGLE_SCOPES)
    expect(session.status.value).toBe('signed-in')
    expect(session.isSignedIn.value).toBe(true)
    expect(session.account.value).toEqual({ email: 'test.user@example.com', name: 'Test User' })
    expect(session.signedInAt.value).toBe(START.getTime())
    expect(session.expiresAt.value).toBe(START.getTime() + 3_600_000)
    expect(session.error.value).toBeNull()
  })

  it('shows "signing-in" while Google is open and ignores a second click', async () => {
    let finish: (token: GoogleToken) => void = () => {}
    const deps = makeDeps()
    deps.requestToken.mockImplementationOnce(() => new Promise((resolve) => (finish = resolve)))
    const session = createGmailSession(deps)

    const first = session.signIn()
    await vi.advanceTimersByTimeAsync(0)
    expect(session.status.value).toBe('signing-in')

    await session.signIn()
    expect(deps.requestToken).toHaveBeenCalledTimes(1)

    finish({ accessToken: 'token-1', expiresInSeconds: 3600 })
    await first
    expect(session.status.value).toBe('signed-in')
  })

  it('stays signed out with a readable error when sign-in fails', async () => {
    const deps = makeDeps()
    deps.requestToken.mockRejectedValueOnce(
      new Error('The Google sign-in window was closed before it finished.'),
    )
    const session = createGmailSession(deps)

    await session.signIn()

    expect(session.status.value).toBe('signed-out')
    expect(session.account.value).toBeNull()
    expect(session.error.value).toBe('The Google sign-in window was closed before it finished.')
  })

  it('revokes a token it cannot use when the profile lookup fails', async () => {
    const deps = makeDeps()
    deps.fetchProfile.mockRejectedValueOnce(new GmailApiError(403, 'Google refused the request.'))
    const session = createGmailSession(deps)

    await session.signIn()

    expect(deps.revoke).toHaveBeenCalledWith('token-1')
    expect(session.status.value).toBe('signed-out')
    expect(session.error.value).toBe('Google refused the request.')
  })

  it('revokes the previous token after a successful re-sign-in', async () => {
    const deps = makeDeps()
    const session = createGmailSession(deps)
    await session.signIn()

    deps.requestToken.mockResolvedValueOnce({ accessToken: 'token-2', expiresInSeconds: 3600 })
    deps.fetchProfile.mockResolvedValueOnce({ email: 'other@example.com', name: 'Other User' })
    await session.signIn()

    expect(session.account.value?.email).toBe('other@example.com')
    expect(deps.revoke).toHaveBeenCalledWith('token-1')
    expect(deps.revoke).not.toHaveBeenCalledWith('token-2')
  })

  it('keeps the existing session when a re-sign-in fails', async () => {
    const deps = makeDeps()
    const session = createGmailSession(deps)
    await session.signIn()

    deps.requestToken.mockRejectedValueOnce(new Error('Google access was denied.'))
    await session.signIn()

    expect(session.status.value).toBe('signed-in')
    expect(session.account.value?.email).toBe('test.user@example.com')
    expect(session.error.value).toBe('Google access was denied.')
  })
})

describe('createGmailSession: signOut and expiry', () => {
  it('clears the session and revokes the token on sign-out', async () => {
    const deps = makeDeps()
    const session = createGmailSession(deps)
    await session.signIn()

    await session.signOut()

    expect(deps.revoke).toHaveBeenCalledWith('token-1')
    expect(session.status.value).toBe('signed-out')
    expect(session.account.value).toBeNull()
    expect(session.signedInAt.value).toBeNull()
    expect(session.expiresAt.value).toBeNull()
  })

  it('still signs out locally when revoking fails', async () => {
    const deps = makeDeps()
    deps.revoke.mockRejectedValue(new Error('offline'))
    const session = createGmailSession(deps)
    await session.signIn()

    await expect(session.signOut()).resolves.toBeUndefined()
    expect(session.status.value).toBe('signed-out')
  })

  it('signs the user out when the token expires', async () => {
    const session = createGmailSession(makeDeps())
    await session.signIn()

    await vi.advanceTimersByTimeAsync(3_599_999)
    expect(session.status.value).toBe('signed-in')

    await vi.advanceTimersByTimeAsync(1)
    expect(session.status.value).toBe('signed-out')
    expect(session.error.value).toMatch(/expired/i)
  })

  it('never exposes the access token through its state', async () => {
    const session = createGmailSession(makeDeps())
    await session.signIn()

    const visible = JSON.stringify({
      status: session.status.value,
      account: session.account.value,
      signedInAt: session.signedInAt.value,
      expiresAt: session.expiresAt.value,
      error: session.error.value,
      keys: Object.keys(session),
    })

    expect(visible).not.toContain('token-1')
    expect(visible).not.toMatch(/accessToken/i)
  })
})

describe('createGmailSession: sendTestEmail', () => {
  it('refuses to send while signed out', async () => {
    const deps = makeDeps()
    const session = createGmailSession(deps)

    await expect(session.sendTestEmail('a@example.com')).rejects.toThrow(/Sign in/)
    expect(deps.sendMessage).not.toHaveBeenCalled()
  })

  it('sends the fixed test message with the session token', async () => {
    const deps = makeDeps()
    const session = createGmailSession(deps)
    await session.signIn()

    await session.sendTestEmail('recipient@example.com')

    expect(deps.sendMessage).toHaveBeenCalledOnce()
    const [token, message] = deps.sendMessage.mock.calls[0] ?? []
    expect(token).toBe('token-1')
    expect(message).toMatchObject({
      to: 'recipient@example.com',
      subject: 'Generic Payroll test dispatch',
    })
    expect(message?.body).toContain('No payslip data was sent.')
  })

  it('signs out when Google says the token is no longer valid', async () => {
    const deps = makeDeps()
    deps.sendMessage.mockRejectedValueOnce(
      new GmailApiError(401, 'Your Google session has expired. Sign in again.'),
    )
    const session = createGmailSession(deps)
    await session.signIn()

    await expect(session.sendTestEmail('a@example.com')).rejects.toThrow(/expired/)

    expect(session.status.value).toBe('signed-out')
    expect(session.error.value).toMatch(/expired/)
  })

  it('keeps the session after any other send failure', async () => {
    const deps = makeDeps()
    deps.sendMessage.mockRejectedValueOnce(
      new GmailApiError(429, 'Google is rate limiting requests.'),
    )
    const session = createGmailSession(deps)
    await session.signIn()

    await expect(session.sendTestEmail('a@example.com')).rejects.toThrow(/rate limiting/)

    expect(session.status.value).toBe('signed-in')
  })
})

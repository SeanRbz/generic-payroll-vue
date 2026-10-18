import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const SCRIPT_SELECTOR = 'script[src="https://accounts.google.com/gsi/client"]'

interface CapturedConfig {
  client_id: string
  scope: string
  callback: (response: Record<string, unknown>) => void
  error_callback?: (error: { type: string }) => void
}

type OnRequest = (config: CapturedConfig, options?: { prompt?: string }) => void

function installGoogle(onRequest: OnRequest, granted = true) {
  const revoke = vi.fn<(token: string, done?: () => void) => void>((_token, done) => done?.())
  const initTokenClient = vi.fn<
    (config: CapturedConfig) => { requestAccessToken: (options?: { prompt?: string }) => void }
  >((config) => ({
    requestAccessToken: (options) => onRequest(config, options),
  }))
  window.google = {
    accounts: { oauth2: { initTokenClient, hasGrantedAllScopes: () => granted, revoke } },
  } as unknown as Window['google']
  return { initTokenClient, revoke }
}

async function freshModule() {
  vi.resetModules()
  return import('../googleIdentity')
}

beforeEach(() => {
  delete window.google
})

afterEach(() => {
  delete window.google
  document.querySelectorAll('script[src*="accounts.google.com"]').forEach((node) => node.remove())
})

describe('loadGoogleIdentity', () => {
  it("adds Google's script once and resolves when it loads", async () => {
    const { loadGoogleIdentity } = await freshModule()

    const first = loadGoogleIdentity()
    const second = loadGoogleIdentity()
    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1)

    document.querySelector(SCRIPT_SELECTOR)?.dispatchEvent(new Event('load'))
    await expect(first).resolves.toBeUndefined()
    await expect(second).resolves.toBeUndefined()
  })

  it('resolves immediately, without a second script, once Google is available', async () => {
    const { loadGoogleIdentity } = await freshModule()
    installGoogle(() => {})

    await expect(loadGoogleIdentity()).resolves.toBeUndefined()
    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(0)
  })

  it('rejects when the script cannot load, removes it, and allows a retry', async () => {
    const { loadGoogleIdentity } = await freshModule()

    const attempt = loadGoogleIdentity()
    document.querySelector(SCRIPT_SELECTOR)?.dispatchEvent(new Event('error'))
    await expect(attempt).rejects.toMatchObject({
      code: 'load-failed',
      message: expect.stringContaining('internet connection'),
    })
    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(0)

    void loadGoogleIdentity()
    expect(document.querySelectorAll(SCRIPT_SELECTOR)).toHaveLength(1)
  })
})

describe('requestAccessToken', () => {
  it('asks for the account chooser with the send-only Gmail scope and resolves the token', async () => {
    const { requestAccessToken, GOOGLE_SCOPES, GMAIL_SEND_SCOPE } = await freshModule()
    const seen: { prompt?: string }[] = []
    const { initTokenClient } = installGoogle((config, options) => {
      seen.push(options ?? {})
      config.callback({ access_token: 'dummy-token', expires_in: '3599', scope: 'x' })
    })

    await expect(requestAccessToken('client-id', GOOGLE_SCOPES)).resolves.toEqual({
      accessToken: 'dummy-token',
      expiresInSeconds: 3599,
    })

    const config = initTokenClient.mock.calls[0]?.[0]
    expect(config?.client_id).toBe('client-id')
    expect(config?.scope.split(' ')).toContain(GMAIL_SEND_SCOPE)
    expect(config?.scope).not.toContain('gmail.readonly')
    expect(config?.scope).not.toContain('mail.google.com')
    expect(seen).toEqual([{ prompt: 'select_account' }])
  })

  it('rejects when Google reports an error', async () => {
    const { requestAccessToken, GOOGLE_SCOPES } = await freshModule()
    installGoogle((config) => config.callback({ error: 'access_denied' }))

    await expect(requestAccessToken('client-id', GOOGLE_SCOPES)).rejects.toMatchObject({
      name: 'GoogleSignInError',
      code: 'access_denied',
      message: 'Google access was denied.',
    })
  })

  it('rejects when the user unticks the Gmail send permission', async () => {
    const { requestAccessToken, GOOGLE_SCOPES } = await freshModule()
    installGoogle(
      (config) =>
        config.callback({ access_token: 'dummy-token', expires_in: 3599, scope: 'openid' }),
      false,
    )

    await expect(requestAccessToken('client-id', GOOGLE_SCOPES)).rejects.toMatchObject({
      code: 'scope-denied',
      message: expect.stringContaining('permission'),
    })
  })

  it('explains a closed or blocked popup', async () => {
    const { requestAccessToken, GOOGLE_SCOPES } = await freshModule()

    installGoogle((config) => config.error_callback?.({ type: 'popup_closed' }))
    await expect(requestAccessToken('c', GOOGLE_SCOPES)).rejects.toMatchObject({
      code: 'popup_closed',
      message: expect.stringContaining('closed'),
    })

    installGoogle((config) => config.error_callback?.({ type: 'popup_failed_to_open' }))
    await expect(requestAccessToken('c', GOOGLE_SCOPES)).rejects.toMatchObject({
      code: 'popup_failed_to_open',
      message: expect.stringContaining('pop-ups'),
    })
  })

  it('uses a generic message for an unknown error without a description', async () => {
    const { requestAccessToken, GOOGLE_SCOPES } = await freshModule()
    installGoogle((config) => config.error_callback?.({ type: 'something_new' }))

    await expect(requestAccessToken('c', GOOGLE_SCOPES)).rejects.toMatchObject({
      message: 'Google sign-in failed. Please try again.',
    })
  })

  it('rejects clearly when Google has not loaded', async () => {
    const { requestAccessToken, GOOGLE_SCOPES } = await freshModule()

    await expect(requestAccessToken('c', GOOGLE_SCOPES)).rejects.toMatchObject({
      code: 'not-loaded',
    })
  })
})

describe('revokeAccessToken', () => {
  it('revokes the token at Google and resolves when Google confirms', async () => {
    const { revokeAccessToken } = await freshModule()
    const { revoke } = installGoogle(() => {})

    await expect(revokeAccessToken('dummy-token')).resolves.toBeUndefined()
    expect(revoke).toHaveBeenCalledWith('dummy-token', expect.any(Function))
  })

  it('still resolves when Google never loaded', async () => {
    const { revokeAccessToken } = await freshModule()
    await expect(revokeAccessToken('dummy-token')).resolves.toBeUndefined()
  })
})

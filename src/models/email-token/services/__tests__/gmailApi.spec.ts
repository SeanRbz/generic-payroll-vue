import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  buildRawMessage,
  buildTestMessage,
  fetchProfile,
  GmailApiError,
  isValidEmail,
  sendMessage,
} from '../gmailApi'

function decodeRaw(raw: string): string {
  return Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
}

function splitMessage(raw: string) {
  const decoded = decodeRaw(raw)
  const separator = decoded.indexOf('\r\n\r\n')
  return { head: decoded.slice(0, separator), body: decoded.slice(separator + 4) }
}

function decodeBody(body: string): string {
  return Buffer.from(body.replace(/\r\n/g, ''), 'base64').toString('utf8')
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

afterEach(() => {
  vi.useRealTimers()
})

describe('isValidEmail', () => {
  it('accepts ordinary addresses', () => {
    expect(isValidEmail('a@b.co')).toBe(true)
    expect(isValidEmail('first.last+tag@sub.example.gov.ph')).toBe(true)
  })

  it('rejects malformed addresses and anything that could inject a header', () => {
    for (const value of [
      '',
      'plain',
      'a@b',
      'a b@c.co',
      '<a@b.co>',
      'a@@b.co',
      'a@b.co\r\nBcc: victim@example.com',
      'a@b.co\nBcc: victim@example.com',
      `${'x'.repeat(250)}@b.co`,
    ]) {
      expect(isValidEmail(value)).toBe(false)
    }
  })
})

describe('buildRawMessage', () => {
  it('produces a base64url plain-text message with the expected headers', () => {
    const raw = buildRawMessage({
      to: 'a@example.com',
      subject: 'Hello',
      body: 'Line one\nLine two',
    })
    const { head, body } = splitMessage(raw)

    expect(raw).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(head).toContain('To: a@example.com')
    expect(head).toContain('Subject: Hello')
    expect(head).toContain('MIME-Version: 1.0')
    expect(head).toContain('Content-Type: text/plain; charset="UTF-8"')
    expect(head).toContain('Content-Transfer-Encoding: base64')
    expect(decodeBody(body)).toBe('Line one\nLine two')
  })

  it('round-trips non-ASCII text in the body', () => {
    const { body } = splitMessage(
      buildRawMessage({ to: 'a@example.com', subject: 'x', body: 'Net pay ₱1,000 — café' }),
    )
    expect(decodeBody(body)).toBe('Net pay ₱1,000 — café')
  })

  it('encodes a non-ASCII subject as an RFC 2047 word', () => {
    const { head } = splitMessage(
      buildRawMessage({ to: 'a@example.com', subject: 'Payslip ₱1,000', body: 'x' }),
    )
    const encoded = /Subject: =\?UTF-8\?B\?([^?]+)\?=/.exec(head)?.[1] ?? ''

    expect(Buffer.from(encoded, 'base64').toString('utf8')).toBe('Payslip ₱1,000')
  })

  it('wraps the base64 body at 76 characters', () => {
    const { body } = splitMessage(
      buildRawMessage({ to: 'a@example.com', subject: 'x', body: 'x'.repeat(300) }),
    )

    for (const line of body.split('\r\n')) expect(line.length).toBeLessThanOrEqual(76)
  })

  it('refuses an invalid recipient or a multi-line subject', () => {
    expect(() => buildRawMessage({ to: 'nope', subject: 'x', body: 'x' })).toThrow(/valid email/)
    expect(() =>
      buildRawMessage({ to: 'a@example.com', subject: 'x\r\nBcc: v@example.com', body: 'x' }),
    ).toThrow(/single line/)
  })
})

describe('buildTestMessage', () => {
  it('is a harmless connectivity check that carries no payslip data', () => {
    const message = buildTestMessage('a@example.com', new Date('2025-05-15T08:30:00.000Z'))

    expect(message.to).toBe('a@example.com')
    expect(message.subject).toBe('Generic Payroll test dispatch')
    expect(message.body).toContain('No payslip data was sent.')
    expect(message.body).toContain('2025-05-15T08:30:00.000Z')
  })
})

describe('fetchProfile', () => {
  it('reads the account email and name with a bearer token', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json({ email: 'a@b.co', name: 'A B' }))

    await expect(fetchProfile('dummy-token', fetchMock)).resolves.toEqual({
      email: 'a@b.co',
      name: 'A B',
    })

    const [url, init] = fetchMock.mock.calls[0] ?? []
    expect(url).toBe('https://www.googleapis.com/oauth2/v3/userinfo')
    expect(new Headers(init?.headers).get('Authorization')).toBe('Bearer dummy-token')
  })

  it('falls back to the email when Google sends no name', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json({ email: 'a@b.co' }))
    await expect(fetchProfile('t', fetchMock)).resolves.toEqual({ email: 'a@b.co', name: 'a@b.co' })
  })

  it('rejects an expired token with a sign-in-again message', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json({}, 401))

    await expect(fetchProfile('t', fetchMock)).rejects.toMatchObject({
      name: 'GmailApiError',
      status: 401,
      message: expect.stringContaining('expired'),
    })
  })

  it('rejects a profile without a usable email', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json({ name: 'No Email' }))
    await expect(fetchProfile('t', fetchMock)).rejects.toThrow(/email address/)
  })

  it('reports a network failure as status 0', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => {
      throw new TypeError('Failed to fetch')
    })

    await expect(fetchProfile('t', fetchMock)).rejects.toMatchObject({
      status: 0,
      message: expect.stringContaining('Could not reach Google'),
    })
  })

  it('gives up when Google does not answer in time', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn<typeof fetch>(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        }),
    )

    // Capture the failure up front so it is never an unhandled rejection while the clock advances.
    const settled = fetchProfile('t', fetchMock).catch((error: unknown) => error)
    await vi.advanceTimersByTimeAsync(15_000)

    expect(await settled).toMatchObject({
      status: 0,
      message: expect.stringContaining('did not respond'),
    })
  })
})

describe('sendMessage', () => {
  it('posts the raw message to Gmail and returns the message id', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json({ id: 'msg-123' }))

    await expect(
      sendMessage('dummy-token', { to: 'a@example.com', subject: 'Hi', body: 'Body' }, fetchMock),
    ).resolves.toEqual({ id: 'msg-123' })

    const [url, init] = fetchMock.mock.calls[0] ?? []
    const headers = new Headers(init?.headers)
    expect(url).toBe('https://gmail.googleapis.com/gmail/v1/users/me/messages/send')
    expect(init?.method).toBe('POST')
    expect(headers.get('Authorization')).toBe('Bearer dummy-token')
    expect(headers.get('Content-Type')).toBe('application/json')
    const { raw } = JSON.parse(String(init?.body)) as { raw: string }
    expect(decodeRaw(raw)).toContain('To: a@example.com')
  })

  it('maps a permission error to an actionable message', async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => json({}, 403))

    await expect(
      sendMessage('t', { to: 'a@example.com', subject: 's', body: 'b' }, fetchMock),
    ).rejects.toMatchObject({ status: 403, message: expect.stringContaining('Gmail API') })
  })

  describe('explains why Google refused (403)', () => {
    const outgoing = { to: 'a@example.com', subject: 's', body: 'b' }

    async function refusal(body: BodyInit | object, contentType = 'application/json') {
      const payload = typeof body === 'string' ? body : JSON.stringify(body)
      const fetchMock = vi.fn<typeof fetch>(
        async () =>
          new Response(payload, { status: 403, headers: { 'Content-Type': contentType } }),
      )
      const error = await sendMessage('t', outgoing, fetchMock).catch((failure: unknown) => failure)
      expect(error).toBeInstanceOf(GmailApiError)
      return (error as GmailApiError).message
    }

    it('names the project and the enable link when the Gmail API is switched off', async () => {
      const message = await refusal({
        error: {
          code: 403,
          message: 'Gmail API has not been used in project 98835276829 before or it is disabled.',
          status: 'PERMISSION_DENIED',
          details: [
            {
              '@type': 'type.googleapis.com/google.rpc.ErrorInfo',
              reason: 'SERVICE_DISABLED',
              metadata: {
                consumer: 'projects/98835276829',
                activationUrl: 'https://evil.example/steal',
              },
            },
          ],
        },
      })

      expect(message).toContain('Gmail API is not enabled')
      expect(message).toContain('project 98835276829')
      expect(message).toContain(
        'https://console.cloud.google.com/apis/library/gmail.googleapis.com?project=98835276829',
      )
      expect(message).not.toContain('evil.example')
    })

    it('recognises the older accessNotConfigured format, taking the project from the text', async () => {
      const message = await refusal({
        error: {
          code: 403,
          message: 'Gmail API has not been used in project 123456789 before or it is disabled.',
          errors: [{ reason: 'accessNotConfigured', domain: 'usageLimits' }],
        },
      })

      expect(message).toContain('Gmail API is not enabled')
      expect(message).toContain('?project=123456789')
    })

    it('still tells the user to enable the API when Google gives no project', async () => {
      const message = await refusal({ error: { errors: [{ reason: 'accessNotConfigured' }] } })

      expect(message).toContain('APIs & Services')
      expect(message).not.toContain('?project=')
    })

    it('asks the user to grant the send permission when the scope is missing', async () => {
      const message = await refusal({
        error: { details: [{ reason: 'ACCESS_TOKEN_SCOPE_INSUFFICIENT' }] },
      })

      expect(message).toContain('allow sending email')
    })

    it('reports the account sending limit', async () => {
      const message = await refusal({ error: { errors: [{ reason: 'dailyLimitExceeded' }] } })

      expect(message).toContain('sending limit')
    })

    it("passes on Google's own words for a reason it does not know", async () => {
      const message = await refusal({ error: { message: 'Blocked by domain policy.' } })

      expect(message).toBe('Google refused the request: Blocked by domain policy.')
    })

    it('shortens a very long message from Google', async () => {
      const message = await refusal({ error: { message: 'x'.repeat(2000) } })

      expect(message.length).toBeLessThan(260)
      expect(message.endsWith('…')).toBe(true)
    })

    it('falls back to a generic hint when the body is not JSON', async () => {
      const message = await refusal('<html>Forbidden</html>', 'text/html')

      expect(message).toContain('Check that the Gmail API is enabled')
    })

    it("includes Google's message for other client errors", async () => {
      const fetchMock = vi.fn<typeof fetch>(async () =>
        json({ error: { message: 'Mail service not enabled' } }, 400),
      )

      await expect(sendMessage('t', outgoing, fetchMock)).rejects.toMatchObject({
        status: 400,
        message: 'Google returned an error (400): Mail service not enabled',
      })
    })
  })

  it('never calls Google for an invalid recipient', async () => {
    const fetchMock = vi.fn<typeof fetch>()

    await expect(
      sendMessage('t', { to: 'not-an-email', subject: 's', body: 'b' }, fetchMock),
    ).rejects.toThrow(/valid email/)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('exposes the HTTP status on its error type', () => {
    const error = new GmailApiError(429, 'slow down')
    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(429)
  })
})

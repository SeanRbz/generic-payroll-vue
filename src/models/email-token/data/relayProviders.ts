import type { RelayProvider } from '@/models/email-token/types'

const ENCRYPTION_NOTE =
  'Credentials are AES-256 encrypted at rest and never stored in plain text per Republic Act No. 10173 (Data Privacy Act of 2012).'

export const defaultRelayProvider: RelayProvider = {
  id: 'gmail',
  name: 'Gmail',
  icon: 'mail',
  protocol: 'OAuth 2.0 / App Password',
  idleNote: 'Available',
  credentialLabel: 'Gmail App Password / Token',
  credentialHint: '16-char app secret',
  complianceNote:
    'Sign-in uses Google OAuth 2.0 with the send-only Gmail permission. No password or token is stored: the access token is kept in memory for this browser session (about one hour) and revoked on sign-out.',
  transport: 'Gmail API • HTTPS',
  usesSignIn: true,
}

export const relayProviders: readonly RelayProvider[] = [
  defaultRelayProvider,
  {
    id: 'ms365',
    name: 'MS 365',
    icon: 'domain',
    protocol: 'Exchange / Azure AD',
    idleNote: 'Available',
    credentialLabel: 'Client Secret / Access Token',
    credentialHint: 'Azure AD app secret',
    complianceNote: `Microsoft 365 relay requires an Azure AD app registration with the Mail.Send permission granted by your tenant administrator. ${ENCRYPTION_NOTE}`,
    transport: 'Microsoft Graph • HTTPS',
    disabled: true, // not offered: the frontend uses Gmail sign-in only
  },
  {
    id: 'smtp',
    name: 'Custom SMTP',
    icon: 'dns',
    protocol: 'GovNet TLS Relay',
    idleNote: 'Port 587 / 465',
    credentialLabel: 'SMTP Password / Token',
    credentialHint: 'Relay account secret',
    complianceNote: `Custom SMTP relays must enforce TLS (STARTTLS on port 587 or implicit TLS on 465) and use a dedicated service account. ${ENCRYPTION_NOTE}`,
    transport: 'SMTP • TLS 587 / 465',
    disabled: true, // not offered: the frontend uses Gmail sign-in only
  },
]

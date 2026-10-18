import { computed } from 'vue'

import { recipientStats, recipientSummary } from '@/models/recipients/data/recipientStats'
import { recipients } from '@/models/recipients/data/recipients'
import { bureauOptions } from '@/models/shared/organization'
import type { BadgeTone } from '@/types/ui'

/** Recipient Directory modal: the roster, its summary figures and the header/footer captions. */
export function useRecipientDirectoryViewModel() {
  const summary = recipientSummary
  const hasRecipients = computed(() => summary.total > 0)

  const badgeTone = computed<BadgeTone>(() => (hasRecipients.value ? 'success' : 'neutral'))
  const badgeText = computed(
    () => `${summary.total} Recipients Loaded${hasRecipients.value ? ' • Batch Verified' : ''}`,
  )

  const syncText = computed(() =>
    summary.syncedAt
      ? `Last synchronized from ${summary.syncSource} ${summary.syncedAt}`
      : 'Not yet synchronized',
  )
  const footerText = computed(
    () => `Showing ${recipients.length} of ${summary.total} recipients • ${syncText.value}`,
  )

  return {
    recipients,
    stats: recipientStats,
    summary,
    bureauOptions,
    badgeTone,
    badgeText,
    footerText,
  }
}

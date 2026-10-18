import { computed, shallowRef } from 'vue'

import { formatTime } from '@/utils/format'
import { batchSummary, ledgerPagination } from '@/models/batch-generator/data/batchSummary'
import { employmentTypeOptions } from '@/models/batch-generator/data/filters'
import { ledgerRows } from '@/models/batch-generator/data/ledgerRows'
import { metrics } from '@/models/batch-generator/data/metrics'
import type { StatusFilterId } from '@/models/batch-generator/types'
import { useGmailSession } from '@/models/email-token/gmailSession'
import { bureauOptions } from '@/models/shared/organization'

/** Batch Generator page: the sample batch, the email-token tile and which modal is open. */
export function useBatchGeneratorViewModel() {
  const session = useGmailSession()
  const { isSignedIn, expiresAt } = session

  const isEmailTokenOpen = shallowRef(false)
  const isRecipientsOpen = shallowRef(false)

  const tokenStatusLabel = computed(() => {
    if (isSignedIn.value && expiresAt.value !== null) {
      return `Token Valid • Expires ${formatTime(expiresAt.value)}`
    }
    return session.configured ? 'Not signed in' : 'Not configured'
  })

  const folderLabel = computed(() => batchSummary.dtrSource?.folderLabel ?? 'No folder selected')

  const statusCounts = computed<Record<StatusFilterId, number>>(() => ({
    all: batchSummary.totalRecords,
    ready: batchSummary.readyCount,
    flagged: batchSummary.flaggedCount,
  }))

  function openEmailToken() {
    isEmailTokenOpen.value = true
  }

  function openRecipients() {
    isRecipientsOpen.value = true
  }

  return {
    batchSummary,
    metrics,
    ledgerRows,
    ledgerPagination,
    bureauOptions,
    employmentTypeOptions,
    isSignedIn,
    tokenStatusLabel,
    folderLabel,
    statusCounts,
    /** Writable so the page can bind it with `v-model:open`; the modal closes itself. */
    isEmailTokenOpen,
    isRecipientsOpen,
    openEmailToken,
    openRecipients,
  }
}

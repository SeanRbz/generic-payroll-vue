<script setup lang="ts">
import MetricsGrid from '@/views/components/ui/MetricsGrid.vue'
import BatchActionToolbar from '@/views/batch-generator/BatchActionToolbar.vue'
import BatchDispatchBar from '@/views/batch-generator/BatchDispatchBar.vue'
import BatchPageHeader from '@/views/batch-generator/BatchPageHeader.vue'
import DtrSourceBanner from '@/views/batch-generator/DtrSourceBanner.vue'
import LedgerToolbar from '@/views/batch-generator/LedgerToolbar.vue'
import PayrollLedgerTable from '@/views/batch-generator/PayrollLedgerTable.vue'
import EmailTokenModal from '@/views/email-token/EmailTokenModal.vue'
import RecipientDirectoryModal from '@/views/recipients/RecipientDirectoryModal.vue'
import { useBatchGeneratorViewModel } from '@/viewmodels/batch-generator/useBatchGeneratorViewModel'

const {
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
  isEmailTokenOpen,
  isRecipientsOpen,
  openEmailToken,
  openRecipients,
} = useBatchGeneratorViewModel()
</script>

<template>
  <div class="flex w-full flex-col">
    <div class="mb-space-xl flex flex-col gap-space-lg">
      <BatchPageHeader :cycle-tag="batchSummary.cycleTag" />
      <DtrSourceBanner :source="batchSummary.dtrSource" />
      <BatchActionToolbar
        :folder-label="folderLabel"
        :token-configured="isSignedIn"
        :token-status-label="tokenStatusLabel"
        :recipient-count="batchSummary.totalRecords"
        @open-email-token="openEmailToken"
        @open-recipients="openRecipients"
      />
    </div>

    <MetricsGrid :metrics="metrics" label="Batch summary" class="mb-space-xl" />
    <LedgerToolbar
      :counts="statusCounts"
      :bureau-options="bureauOptions"
      :employment-type-options="employmentTypeOptions"
      class="mb-space-md"
    />
    <PayrollLedgerTable
      :rows="ledgerRows"
      :pagination="ledgerPagination"
      :selected-count="batchSummary.selectedCount"
      class="mb-space-xl"
    />
    <BatchDispatchBar :selected-count="batchSummary.selectedCount" />

    <EmailTokenModal v-model:open="isEmailTokenOpen" />
    <RecipientDirectoryModal v-model:open="isRecipientsOpen" />
  </div>
</template>

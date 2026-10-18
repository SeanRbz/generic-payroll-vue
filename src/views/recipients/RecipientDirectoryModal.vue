<script setup lang="ts">
import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import BaseButton from '@/views/components/ui/BaseButton.vue'
import BaseModal from '@/views/components/ui/BaseModal.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import { useRecipientDirectoryViewModel } from '@/viewmodels/recipients/useRecipientDirectoryViewModel'
import RecipientFilterBar from './RecipientFilterBar.vue'
import RecipientImportBar from './RecipientImportBar.vue'
import RecipientStatsStrip from './RecipientStatsStrip.vue'
import RecipientTable from './RecipientTable.vue'

const open = defineModel<boolean>('open', { required: true })

const { recipients, stats, bureauOptions, badgeTone, badgeText, footerText } =
  useRecipientDirectoryViewModel()
</script>

<template>
  <BaseModal
    v-model:open="open"
    title="Recipient Directory &amp; Staff List"
    description="Manage employee notification directory, verified official emails, and automated payslip dispatch routing."
    size="3xl"
  >
    <template #icon>
      <MaterialIcon name="groups" class="text-[22px]" />
    </template>
    <template #badge>
      <BaseBadge :tone="badgeTone" size="sm" pill>{{ badgeText }}</BaseBadge>
    </template>

    <div class="flex flex-col gap-space-md pb-space-md">
      <RecipientStatsStrip :stats="stats" />
      <RecipientImportBar />
      <RecipientFilterBar :bureau-options="bureauOptions" />
      <RecipientTable :recipients="recipients" />
    </div>

    <template #footer>
      <div class="flex flex-col gap-space-sm sm:flex-row sm:items-center sm:justify-between">
        <p
          class="flex min-w-0 flex-1 items-center gap-1.5 font-label-code text-[11px] text-on-surface-variant"
        >
          <MaterialIcon name="sync" class="text-[14px] text-secondary" />
          {{ footerText }}
        </p>
        <div class="flex items-center gap-space-sm">
          <BaseButton @click="open = false">Close</BaseButton>
          <BaseButton variant="gradient" class="font-semibold">
            <MaterialIcon name="done_all" class="text-[18px]" />
            Save &amp; Apply Recipients
          </BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

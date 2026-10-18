<script setup lang="ts">
import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import { formatNumber } from '@/utils/format'
import ActionTile from './ActionTile.vue'

defineProps<{
  folderLabel: string
  tokenConfigured: boolean
  tokenStatusLabel: string
  recipientCount: number
}>()

defineEmits<{
  'open-email-token': []
  'open-recipients': []
}>()
</script>

<template>
  <div
    class="flex flex-wrap items-center justify-between gap-space-md rounded-lg bg-surface-container-lowest p-space-md shadow-sm"
  >
    <div class="flex flex-wrap items-center gap-space-sm">
      <ActionTile
        icon="folder_open"
        title="Select Folder"
        :subtitle="folderLabel"
        trailing-icon="sync_alt"
        truncate-subtitle
      />
      <ActionTile
        icon="key"
        :icon-box="tokenConfigured ? 'success' : 'soft'"
        title="Email Token"
        :subtitle="tokenStatusLabel"
        :subtitle-tone="tokenConfigured ? 'success' : 'muted'"
        trailing-icon="tune"
        @click="$emit('open-email-token')"
      >
        <template #title-extra>
          <span
            v-if="tokenConfigured"
            class="size-2 rounded-full bg-secondary"
            aria-hidden="true"
          />
        </template>
      </ActionTile>
      <ActionTile
        icon="group"
        icon-box="soft"
        title="Recipients"
        :subtitle="`${formatNumber(recipientCount)} Staff Configured`"
        trailing-icon="visibility"
        @click="$emit('open-recipients')"
      >
        <template #title-extra>
          <BaseBadge tone="solid" pill>{{ recipientCount }}</BaseBadge>
        </template>
      </ActionTile>
    </div>

    <button
      type="button"
      class="group ml-auto flex items-center gap-space-sm rounded-sm bg-linear-to-r from-secondary to-tertiary-container px-space-lg py-3 text-on-primary shadow-md transition-all hover:brightness-110 active:brightness-95"
    >
      <MaterialIcon
        name="send_money"
        class="text-[22px] transition-transform group-hover:rotate-12"
      />
      <span class="flex flex-col text-left">
        <span
          class="font-headline-md text-headline-md leading-tight font-bold tracking-tight text-white"
        >
          Generate &amp; Dispatch Payroll
        </span>
        <span class="-mt-0.5 font-label-code text-label-code text-secondary-fixed opacity-90">
          Build PDFs • Encrypt with Tax TIN • Send SMTP
        </span>
      </span>
      <MaterialIcon name="bolt" class="ml-2 text-[20px] text-white" />
    </button>
  </div>
</template>

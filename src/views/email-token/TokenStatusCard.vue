<script setup lang="ts">
import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import BaseButton from '@/views/components/ui/BaseButton.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import type { TokenStatus } from '@/models/email-token/types'

defineProps<{
  status: TokenStatus | null
  /** A sign-in is open at Google. */
  busy?: boolean
  /** The action cannot run (e.g. sign-in is not configured). */
  disabled?: boolean
}>()

defineEmits<{ regenerate: [] }>()
</script>

<template>
  <div
    class="flex flex-col items-start justify-between gap-space-md rounded-lg bg-surface-container-low p-space-md sm:flex-row"
  >
    <div class="flex min-w-0 items-start gap-space-sm">
      <span
        class="mt-1.5 size-2 shrink-0 rounded-full"
        :class="status ? 'bg-secondary' : 'bg-outline'"
        aria-hidden="true"
      />
      <div class="flex flex-col gap-1">
        <div class="flex flex-wrap items-center gap-space-sm">
          <span class="font-body-md text-body-md font-bold text-on-surface">
            Token Status: {{ status ? status.label : 'Not configured' }}
          </span>
          <BaseBadge v-if="status" tone="success">{{ status.handshake }}</BaseBadge>
        </div>
        <p class="font-label-code text-label-code text-on-surface-variant">
          {{
            status
              ? status.detail
              : 'No token yet. Sign in with Google to authorize payslip dispatch.'
          }}
        </p>
      </div>
    </div>
    <BaseButton
      variant="outline"
      size="sm"
      class="shrink-0 font-semibold"
      :disabled="busy || disabled"
      @click="$emit('regenerate')"
    >
      <MaterialIcon
        :name="busy ? 'progress_activity' : 'sync'"
        class="text-[16px]"
        :class="busy && 'animate-spin'"
      />
      {{ busy ? 'Waiting for Google…' : status ? 'Regenerate Token' : 'Generate Token' }}
    </BaseButton>
  </div>
</template>

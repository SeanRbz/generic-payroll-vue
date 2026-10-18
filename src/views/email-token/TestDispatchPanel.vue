<script setup lang="ts">
import { useId } from 'vue'

import BaseButton from '@/views/components/ui/BaseButton.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import type { DispatchResult } from '@/models/email-token/types'

const recipient = defineModel<string>({ default: '' })

defineProps<{
  transport: string
  canSend: boolean
  sending: boolean
  result: DispatchResult | null
  /** The typed recipient is not a valid email address. */
  invalid: boolean
}>()

defineEmits<{ send: [] }>()

const headingId = useId()
</script>

<template>
  <section :aria-labelledby="headingId" class="rounded-lg bg-surface-container-low p-space-md">
    <div class="mb-space-sm flex items-center justify-between gap-space-sm">
      <h3
        :id="headingId"
        class="flex items-center gap-space-xs font-label-strong text-label-strong tracking-wider text-primary uppercase"
      >
        <MaterialIcon name="send" class="text-[16px]" />
        Test Connection &amp; Relay Handshake
      </h3>
      <span class="font-label-code text-[11px] font-semibold text-on-surface-variant">
        {{ transport }}
      </span>
    </div>
    <div class="flex flex-col gap-space-sm sm:flex-row sm:items-center">
      <div class="relative min-w-0 flex-1">
        <MaterialIcon
          name="mail"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-outline"
        />
        <input
          v-model="recipient"
          type="email"
          name="test-recipient-email"
          aria-label="Test recipient email"
          autocomplete="off"
          placeholder="Enter a test recipient email"
          :aria-invalid="invalid"
          class="h-10 w-full rounded-sm bg-surface-container-lowest pr-3 pl-10 font-label-code text-label-code text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-error"
          @keydown.enter.prevent="canSend && $emit('send')"
        />
      </div>
      <BaseButton
        variant="soft"
        class="shrink-0 font-semibold"
        :disabled="!canSend"
        @click="$emit('send')"
      >
        <MaterialIcon
          :name="sending ? 'progress_activity' : 'forward_to_inbox'"
          class="text-[18px]"
          :class="sending && 'animate-spin'"
        />
        {{ sending ? 'Sending…' : 'Send Test Dispatch' }}
      </BaseButton>
    </div>
    <p
      v-if="result"
      :role="result.kind === 'error' ? 'alert' : 'status'"
      class="mt-space-sm flex items-start gap-1 font-label-code text-[11px]"
      :class="result.kind === 'error' ? 'text-error' : 'text-secondary'"
    >
      <MaterialIcon
        :name="result.kind === 'error' ? 'error' : 'check_circle'"
        class="mt-px text-[14px]"
      />
      <span class="min-w-0 break-words">{{ result.text }}</span>
    </p>
  </section>
</template>

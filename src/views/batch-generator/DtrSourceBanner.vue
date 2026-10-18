<script setup lang="ts">
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import { formatNumber } from '@/utils/format'
import type { DtrSource } from '@/models/batch-generator/types'

defineProps<{ source: DtrSource | null }>()
</script>

<template>
  <div
    class="flex flex-col justify-between gap-space-md rounded-lg bg-surface-container-lowest p-space-md shadow-sm md:flex-row md:items-center"
  >
    <div class="flex min-w-0 items-center gap-space-md">
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-sm bg-surface-container text-primary"
      >
        <MaterialIcon name="folder_special" class="text-[20px]" />
      </div>
      <div class="flex min-w-0 flex-col">
        <div class="flex flex-wrap items-center gap-space-xs">
          <span class="font-label-strong text-label-strong tracking-wider text-outline uppercase">
            Loaded DTR Biometrics Source:
          </span>
          <span
            class="flex items-center gap-1 font-label-code text-label-code font-semibold"
            :class="source ? 'text-secondary' : 'text-outline'"
          >
            <span
              class="size-1.5 rounded-full"
              :class="source ? 'bg-secondary' : 'bg-outline'"
              aria-hidden="true"
            />
            {{
              source
                ? `Synchronized • ${formatNumber(source.rawFilesParsed)} Raw Files Parsed`
                : 'No source loaded'
            }}
          </span>
        </div>
        <span
          class="truncate font-label-code text-label-code"
          :class="source ? 'font-medium text-on-surface' : 'text-outline'"
          :title="source?.path"
        >
          {{ source?.path ?? 'Select a folder to load the biometric time-card export (.csv).' }}
        </span>
      </div>
    </div>
    <div
      v-if="source"
      class="flex shrink-0 items-center gap-space-xs font-label-code text-label-code text-on-surface-variant"
    >
      <MaterialIcon name="verified" class="text-[16px] text-secondary" />
      <span>Checksum: {{ source.checksum }}</span>
    </div>
  </div>
</template>

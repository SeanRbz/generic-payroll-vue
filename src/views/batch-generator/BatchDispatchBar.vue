<script setup lang="ts">
import { computed } from 'vue'

import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import BaseButton from '@/views/components/ui/BaseButton.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import { formatNumber } from '@/utils/format'

const { selectedCount } = defineProps<{ selectedCount: number }>()

const hasRecords = computed(() => selectedCount > 0)
</script>

<template>
  <div class="sticky bottom-4 z-30 mt-auto w-full">
    <div
      class="flex flex-col justify-between gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-xl md:flex-row md:items-center"
    >
      <div class="flex items-center gap-space-md">
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-lg"
          :class="
            hasRecords
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-surface-container text-outline'
          "
        >
          <MaterialIcon name="verified_user" class="text-[24px]" />
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-space-xs">
            <span class="font-headline-md text-headline-md font-bold text-on-surface">
              {{ formatNumber(selectedCount) }} Records Selected
            </span>
            <BaseBadge v-if="hasRecords" tone="success" size="sm" pill>Batch Verified</BaseBadge>
          </div>
          <span class="font-label-code text-label-code text-on-surface-variant">
            {{
              hasRecords
                ? 'Ready to Dispatch via Authenticated Token • GovNet Mail Relay • ADA Advice Slip Gen'
                : 'Load a DTR folder and configure the email token to enable dispatch'
            }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-space-sm self-end md:self-auto">
        <BaseButton :disabled="!hasRecords">
          <MaterialIcon name="picture_as_pdf" class="text-[18px] text-primary" />
          Sample Bundle PDF
        </BaseButton>
        <BaseButton variant="success" size="lg" :disabled="!hasRecords">
          <MaterialIcon name="send_money" class="text-[20px]" />
          Start Dispatch ({{ formatNumber(selectedCount) }})
        </BaseButton>
      </div>
    </div>
  </div>
</template>

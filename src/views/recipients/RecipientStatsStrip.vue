<script setup lang="ts">
import type { RecipientStat } from '@/models/recipients/types'

defineProps<{ stats: readonly RecipientStat[] }>()

const dotClass: Record<RecipientStat['dot'], string> = {
  primary: 'bg-primary-container',
  success: 'bg-secondary',
  neutral: 'bg-outline',
}
</script>

<template>
  <dl
    class="grid grid-cols-2 gap-space-md rounded-lg bg-surface-container-low p-space-md md:grid-cols-4"
  >
    <div v-for="stat in stats" :key="stat.id" class="flex flex-col gap-0.5">
      <dt
        class="flex items-center gap-1.5 font-label-strong text-[10px] tracking-wider text-on-surface-variant uppercase"
      >
        <span class="size-1.5 rounded-full" :class="dotClass[stat.dot]" aria-hidden="true" />
        {{ stat.label }}
      </dt>
      <dd class="font-label-numeric text-label-numeric font-bold text-on-surface">
        {{ stat.value }}
      </dd>
    </div>
  </dl>
</template>

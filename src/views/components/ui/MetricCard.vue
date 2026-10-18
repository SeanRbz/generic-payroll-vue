<script setup lang="ts">
import { computed } from 'vue'

import { formatNumber, formatPeso } from '@/utils/format'
import MaterialIcon from './MaterialIcon.vue'
import type { Metric, MetricFooterItem } from '@/types/ui'

const { metric } = defineProps<{ metric: Metric }>()

const accentClass: Record<Metric['accent'], string> = {
  primary: 'bg-primary',
  'primary-container': 'bg-primary-container',
  outline: 'bg-outline',
  secondary: 'bg-secondary',
}

const iconToneClass: Record<Metric['iconTone'], string> = {
  primary: 'bg-surface-container text-primary',
  neutral: 'bg-surface-container text-outline',
  success: 'bg-secondary-container text-on-secondary-container',
}

const footerToneClass: Record<NonNullable<MetricFooterItem['tone']>, string> = {
  default: '',
  positive: 'font-medium text-secondary',
  negative: 'font-medium text-error',
  strong: 'font-semibold text-secondary',
}

const displayValue = computed(() => {
  if (metric.format === 'text') return metric.value
  if (metric.format === 'peso') return formatPeso(metric.value)
  if (metric.format === 'percent') return `${formatNumber(metric.value, 1)}%`
  return formatNumber(metric.value, metric.format === 'hours' ? 1 : 0)
})
</script>

<template>
  <article
    class="@container relative flex flex-col justify-between overflow-hidden rounded-lg bg-surface-container-lowest p-space-md shadow-sm"
  >
    <div class="absolute inset-x-0 top-0 h-1" :class="accentClass[metric.accent]" />

    <div class="mb-space-sm flex items-center justify-between">
      <h3
        class="font-label-strong text-label-strong tracking-wider uppercase"
        :class="metric.emphasized ? 'text-secondary' : 'text-outline'"
      >
        {{ metric.label }}
      </h3>
      <span
        class="flex size-7 items-center justify-center rounded-sm"
        :class="iconToneClass[metric.iconTone]"
      >
        <MaterialIcon :name="metric.icon" class="text-[18px]" />
      </span>
    </div>

    <p class="flex flex-wrap items-baseline gap-space-xs">
      <span
        class="font-headline-xl text-[length:clamp(1.25rem,14cqw,2rem)] leading-10 font-bold tracking-tight"
        :class="metric.emphasized ? 'text-secondary' : 'text-on-surface'"
      >
        {{ displayValue }}
      </span>
      <span v-if="metric.unit" class="font-body-sm text-body-sm text-outline">{{
        metric.unit
      }}</span>
      <span v-if="metric.note" class="font-body-sm text-body-sm font-semibold text-secondary">
        {{ metric.note }}
      </span>
    </p>

    <div
      class="mt-space-xs flex items-center justify-between rounded-sm bg-surface-container-low px-2 py-1 font-label-code text-label-code text-on-surface-variant"
    >
      <template v-for="(item, index) in metric.footer" :key="item.text">
        <span v-if="index > 0 && metric.footerSeparator" class="text-outline" aria-hidden="true">
          •
        </span>
        <span class="flex items-center gap-1" :class="footerToneClass[item.tone ?? 'default']">
          <MaterialIcon v-if="item.icon" :name="item.icon" class="text-[12px]" />
          {{ item.text }}
        </span>
      </template>
    </div>
  </article>
</template>

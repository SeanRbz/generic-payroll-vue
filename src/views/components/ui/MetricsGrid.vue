<script setup lang="ts">
import MetricCard from './MetricCard.vue'
import type { Metric } from '@/types/ui'

const { columns = 4 } = defineProps<{
  metrics: readonly Metric[]
  label: string
  /** How many cards sit side by side on wide screens. */
  columns?: 4 | 5
}>()

const columnClass = {
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5',
} as const
</script>

<template>
  <section :aria-label="label" class="grid grid-cols-1 gap-space-md" :class="columnClass[columns]">
    <MetricCard v-for="metric in metrics" :key="metric.id" :metric="metric" />
  </section>
</template>

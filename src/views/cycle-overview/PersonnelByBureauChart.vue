<script setup lang="ts">
import { computed } from 'vue'

import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import ChartCard from '@/views/components/ui/ChartCard.vue'
import ChartTooltip from '@/views/components/ui/ChartTooltip.vue'
import { percentOf } from '@/utils/chart'
import { formatNumber } from '@/utils/format'
import type { BureauHeadcount } from '@/models/cycle-overview/types'

const { bureaus } = defineProps<{ bureaus: readonly BureauHeadcount[] }>()

const series = [
  { key: 'regular', label: 'Plantilla (Regular)', fill: 'bg-primary-container' },
  { key: 'cos', label: 'COS / Job Order', fill: 'bg-secondary' },
] as const

const rows = computed(() => {
  const max = Math.max(0, ...bureaus.map((bureau) => bureau.regular + bureau.cos))
  return bureaus.map((bureau) => {
    const total = bureau.regular + bureau.cos
    return {
      ...bureau,
      total,
      width: percentOf(total, max),
      segments: [
        { ...series[0], value: bureau.regular },
        { ...series[1], value: bureau.cos },
      ].filter((segment) => segment.value > 0),
    }
  })
})

const totals = computed(() => {
  const regular = bureaus.reduce((sum, bureau) => sum + bureau.regular, 0)
  const cos = bureaus.reduce((sum, bureau) => sum + bureau.cos, 0)
  return { regular, cos, all: regular + cos }
})
</script>

<template>
  <ChartCard
    title="Personnel by Bureau"
    subtitle="Plantilla (Regular) versus Contract of Service (COS)"
  >
    <template #badge>
      <BaseBadge tone="neutral" size="sm" class="whitespace-nowrap">
        {{ formatNumber(totals.all) }} total
      </BaseBadge>
    </template>

    <ul class="flex flex-col gap-space-md" aria-label="Headcount per bureau">
      <li v-for="row in rows" :key="row.id">
        <div class="mb-1 flex items-baseline justify-between gap-space-sm">
          <span class="font-body-sm text-body-sm text-on-surface">{{ row.label }}</span>
          <span class="shrink-0 font-label-code text-label-code text-on-surface-variant">
            <strong class="font-label-numeric text-label-numeric font-semibold text-on-surface">
              {{ formatNumber(row.total) }}
            </strong>
            ({{ row.regular }} Reg / {{ row.cos }} COS)
          </span>
        </div>
        <div class="flex gap-0.5" :style="{ width: `${row.width}%` }">
          <div
            v-for="(segment, index) in row.segments"
            :key="segment.key"
            class="group/mark relative min-w-0 py-0.5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
            :style="{ flexGrow: segment.value, flexBasis: 0 }"
            tabindex="0"
            role="img"
            :aria-label="`${row.label}: ${segment.value} ${segment.label}`"
          >
            <div
              class="h-5"
              :class="[segment.fill, index === row.segments.length - 1 ? 'rounded-r-lg' : '']"
            />
            <ChartTooltip>{{ segment.label }}: {{ segment.value }}</ChartTooltip>
          </div>
        </div>
      </li>
    </ul>

    <template #footer>
      <ul
        class="flex flex-wrap items-center gap-x-space-md gap-y-1 font-label-code text-label-code text-on-surface-variant"
        aria-label="Legend"
      >
        <li v-for="item in series" :key="item.key" class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-sm" :class="item.fill" aria-hidden="true" />
          {{ item.label }} · {{ formatNumber(totals[item.key]) }}
        </li>
      </ul>
    </template>

    <template #table>
      <table class="w-full text-left font-label-code text-label-code text-on-surface">
        <caption class="sr-only">
          Headcount per bureau
        </caption>
        <thead class="text-on-surface-variant">
          <tr>
            <th scope="col" class="py-1 pr-space-sm font-semibold">Bureau</th>
            <th scope="col" class="px-space-xs py-1 text-right font-semibold">Regular</th>
            <th scope="col" class="px-space-xs py-1 text-right font-semibold">COS</th>
            <th scope="col" class="py-1 pl-space-xs text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="border-t border-outline-variant/40">
            <th scope="row" class="py-1 pr-space-sm font-normal">{{ row.label }}</th>
            <td class="px-space-xs py-1 text-right">{{ row.regular }}</td>
            <td class="px-space-xs py-1 text-right">{{ row.cos }}</td>
            <td class="py-1 pl-space-xs text-right font-semibold">{{ row.total }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </ChartCard>
</template>

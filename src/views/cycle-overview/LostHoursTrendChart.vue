<script setup lang="ts">
import { computed } from 'vue'

import BaseBadge from '@/views/components/ui/BaseBadge.vue'
import ChartCard from '@/views/components/ui/ChartCard.vue'
import ChartTooltip from '@/views/components/ui/ChartTooltip.vue'
import { percentOf } from '@/utils/chart'
import { formatNumber, formatPeso } from '@/utils/format'
import type {
  LostHoursCategory,
  LostHoursKind,
  LostHoursPeriod,
} from '@/models/cycle-overview/types'

const { periods, breakdown, impact, improvement } = defineProps<{
  periods: readonly LostHoursPeriod[]
  breakdown: readonly LostHoursCategory[]
  /** Pesos auto-deducted for the current period. */
  impact: number
  /** Drop in lost hours from the previous period (%); null when there is nothing to compare. */
  improvement: number | null
}>()

const kinds: Record<LostHoursKind, { label: string; fill: string }> = {
  past: { label: 'Previous period', fill: 'bg-outline-variant' },
  current: { label: 'Current period', fill: 'bg-primary-container' },
  target: { label: 'Target', fill: 'bg-secondary-container' },
}

const legend = (Object.keys(kinds) as LostHoursKind[]).map((kind) => ({ kind, ...kinds[kind] }))

const columns = computed(() => {
  const max = Math.max(0, ...periods.map((period) => period.hours))
  return periods.map((period) => ({
    ...period,
    height: percentOf(period.hours, max),
    fill: kinds[period.kind].fill,
    kindLabel: kinds[period.kind].label,
  }))
})
</script>

<template>
  <ChartCard
    title="Lost Hours Trend"
    subtitle="Tardiness, undertime and unapproved absence per pay period"
  >
    <template #badge>
      <BaseBadge
        v-if="improvement !== null && improvement > 0"
        tone="success"
        size="sm"
        pill
        class="whitespace-nowrap"
      >
        {{ formatNumber(improvement, 1) }}% improvement
      </BaseBadge>
    </template>

    <ul class="flex pt-6" aria-label="Lost hours per pay period">
      <li
        v-for="column in columns"
        :key="column.id"
        class="group/mark relative flex flex-1 flex-col items-center focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
        tabindex="0"
        role="img"
        :aria-label="`${column.label}: ${formatNumber(column.hours, 1)} hours (${column.kindLabel})`"
      >
        <div class="relative h-40 w-full border-b border-outline-variant">
          <span
            class="absolute left-1/2 -translate-x-1/2 font-label-numeric text-label-numeric text-on-surface"
            :style="{ bottom: `calc(${column.height}% + 4px)` }"
          >
            {{ formatNumber(column.hours, 1) }}
          </span>
          <div
            class="absolute bottom-0 left-1/2 w-6 -translate-x-1/2 rounded-t-lg"
            :class="column.fill"
            :style="{ height: `${column.height}%` }"
          />
        </div>
        <span
          class="mt-1 font-label-code text-label-code whitespace-nowrap text-on-surface-variant"
        >
          {{ column.label }}
        </span>
        <ChartTooltip>{{ column.kindLabel }}: {{ formatNumber(column.hours, 1) }} hrs</ChartTooltip>
      </li>
    </ul>

    <template #footer>
      <ul
        class="flex flex-wrap items-center gap-x-space-md gap-y-1 font-label-code text-label-code text-on-surface-variant"
        aria-label="Legend"
      >
        <li v-for="item in legend" :key="item.kind" class="flex items-center gap-1.5">
          <span class="size-2.5 rounded-sm" :class="item.fill" aria-hidden="true" />
          {{ item.label }}
        </li>
      </ul>

      <dl
        class="mt-space-md grid grid-cols-3 gap-space-sm rounded-sm bg-surface-container-low p-space-sm text-center"
      >
        <div v-for="item in breakdown" :key="item.id">
          <dt class="font-label-code text-label-code text-on-surface-variant">{{ item.label }}</dt>
          <dd class="font-label-numeric text-label-numeric font-semibold text-on-surface">
            {{ formatNumber(item.hours, 1) }} hrs
          </dd>
        </div>
      </dl>
      <p class="mt-space-xs font-label-code text-label-code text-on-surface-variant">
        Impact: −{{ formatPeso(impact) }} auto-deducted
      </p>
    </template>

    <template #table>
      <table class="w-full text-left font-label-code text-label-code text-on-surface">
        <caption class="sr-only">
          Lost hours per pay period and by category
        </caption>
        <thead class="text-on-surface-variant">
          <tr>
            <th scope="col" class="py-1 pr-space-sm font-semibold">Period</th>
            <th scope="col" class="px-space-xs py-1 font-semibold">Kind</th>
            <th scope="col" class="py-1 pl-space-xs text-right font-semibold">Hours</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="column in columns" :key="column.id" class="border-t border-outline-variant/40">
            <th scope="row" class="py-1 pr-space-sm font-normal">{{ column.label }}</th>
            <td class="px-space-xs py-1">{{ column.kindLabel }}</td>
            <td class="py-1 pl-space-xs text-right">{{ formatNumber(column.hours, 1) }}</td>
          </tr>
          <tr v-for="item in breakdown" :key="item.id" class="border-t border-outline-variant/40">
            <th scope="row" class="py-1 pr-space-sm font-normal">{{ item.label }}</th>
            <td class="px-space-xs py-1">Current period</td>
            <td class="py-1 pl-space-xs text-right">{{ formatNumber(item.hours, 1) }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </ChartCard>
</template>

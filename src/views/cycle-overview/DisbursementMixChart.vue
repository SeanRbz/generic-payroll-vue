<script setup lang="ts">
import { computed } from 'vue'

import ChartCard from '@/views/components/ui/ChartCard.vue'
import ChartTooltip from '@/views/components/ui/ChartTooltip.vue'
import { percentOf } from '@/utils/chart'
import { formatNumber, formatPeso } from '@/utils/format'
import type { DisbursementSummary } from '@/models/cycle-overview/disbursement'
import type { FundAllocation } from '@/models/cycle-overview/types'

const { summary, funds } = defineProps<{
  /** Gross earnings split into net pay and deductions; its net is the sum of `funds`. */
  summary: DisbursementSummary
  funds: readonly FundAllocation[]
}>()

const segments = computed(() =>
  [
    {
      key: 'net',
      label: 'Net pay',
      amount: summary.net,
      share: summary.netShare,
      fill: 'bg-secondary',
    },
    {
      key: 'deductions',
      label: 'Deductions',
      amount: summary.deductions,
      share: summary.deductionShare,
      fill: 'bg-primary-container',
    },
  ].filter((segment) => segment.amount > 0),
)

const fundRows = computed(() =>
  funds.map((fund) => ({ ...fund, share: percentOf(fund.amount, summary.net) })),
)
</script>

<template>
  <ChartCard
    title="Disbursement Mix"
    subtitle="Gross inflow against deductions and the funds that pay the net"
  >
    <p class="flex items-baseline justify-between gap-space-sm">
      <span class="font-label-strong text-label-strong tracking-wider text-outline uppercase">
        Total Gross Inflow
      </span>
      <span class="font-label-numeric text-label-numeric font-semibold text-on-surface">
        {{ formatPeso(summary.gross) }} (100%)
      </span>
    </p>

    <div class="mt-space-xs flex gap-0.5">
      <div
        v-for="(segment, index) in segments"
        :key="segment.key"
        class="group/mark relative min-w-0 py-0.5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
        :style="{ flexGrow: segment.amount, flexBasis: 0 }"
        tabindex="0"
        role="img"
        :aria-label="`${segment.label}: ${formatPeso(segment.amount)} (${formatNumber(segment.share, 1)}% of gross)`"
      >
        <div
          class="h-6"
          :class="[segment.fill, index === segments.length - 1 ? 'rounded-r-lg' : '']"
        />
        <ChartTooltip>{{ segment.label }}: {{ formatPeso(segment.amount) }}</ChartTooltip>
      </div>
    </div>

    <ul
      class="mt-space-xs flex flex-wrap items-center gap-x-space-md gap-y-1 font-label-code text-label-code text-on-surface-variant"
      aria-label="Legend"
    >
      <li v-for="segment in segments" :key="segment.key" class="flex items-center gap-1.5">
        <span class="size-2.5 rounded-sm" :class="segment.fill" aria-hidden="true" />
        {{ segment.label }} · {{ formatNumber(segment.share, 1) }}%
      </li>
    </ul>

    <ul class="mt-space-lg flex flex-col gap-space-md" aria-label="Net payable by fund">
      <li v-for="fund in fundRows" :key="fund.id">
        <div class="flex items-baseline justify-between gap-space-sm">
          <span class="font-body-sm text-body-sm font-semibold text-on-surface">
            {{ fund.label }}
          </span>
          <span
            class="shrink-0 font-label-numeric text-label-numeric font-semibold text-on-surface"
          >
            {{ formatPeso(fund.amount) }}
          </span>
        </div>
        <div
          class="flex justify-between gap-space-sm font-label-code text-label-code text-on-surface-variant"
        >
          <span>{{ fund.description }}</span>
          <span class="shrink-0">{{ formatNumber(fund.share, 1) }}% of net</span>
        </div>
        <div class="mt-1 h-1.5 rounded-full bg-secondary-container" aria-hidden="true">
          <div class="h-full rounded-full bg-secondary" :style="{ width: `${fund.share}%` }" />
        </div>
      </li>
    </ul>

    <template #table>
      <table class="w-full text-left font-label-code text-label-code text-on-surface">
        <caption class="sr-only">
          Gross inflow split into deductions and net payable by fund
        </caption>
        <thead class="text-on-surface-variant">
          <tr>
            <th scope="col" class="py-1 pr-space-sm font-semibold">Component</th>
            <th scope="col" class="px-space-xs py-1 text-right font-semibold">Amount</th>
            <th scope="col" class="py-1 pl-space-xs text-right font-semibold">Share</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-t border-outline-variant/40">
            <th scope="row" class="py-1 pr-space-sm font-normal">Total gross inflow</th>
            <td class="px-space-xs py-1 text-right">{{ formatPeso(summary.gross) }}</td>
            <td class="py-1 pl-space-xs text-right">100% of gross</td>
          </tr>
          <tr
            v-for="segment in segments"
            :key="segment.key"
            class="border-t border-outline-variant/40"
          >
            <th scope="row" class="py-1 pr-space-sm font-normal">{{ segment.label }}</th>
            <td class="px-space-xs py-1 text-right">{{ formatPeso(segment.amount) }}</td>
            <td class="py-1 pl-space-xs text-right">
              {{ formatNumber(segment.share, 1) }}% of gross
            </td>
          </tr>
          <tr v-for="fund in fundRows" :key="fund.id" class="border-t border-outline-variant/40">
            <th scope="row" class="py-1 pr-space-sm font-normal">{{ fund.label }}</th>
            <td class="px-space-xs py-1 text-right">{{ formatPeso(fund.amount) }}</td>
            <td class="py-1 pl-space-xs text-right">{{ formatNumber(fund.share, 1) }}% of net</td>
          </tr>
        </tbody>
      </table>
    </template>
  </ChartCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import BaseCheckbox from '@/views/components/ui/BaseCheckbox.vue'
import TableEmptyRow from '@/views/components/ui/TableEmptyRow.vue'
import { formatNumber } from '@/utils/format'
import { getPageCount, getPageRange, type Pagination } from '@/utils/pagination'
import type { LedgerRow } from '@/models/batch-generator/types'
import LedgerPagination from './LedgerPagination.vue'
import PayrollLedgerRow from './PayrollLedgerRow.vue'

const { pagination } = defineProps<{
  rows: readonly LedgerRow[]
  pagination: Pagination
  selectedCount: number
}>()

const columns = [
  { key: 'employee', label: '1. Employee ID & Name', align: 'left' },
  { key: 'attendance', label: '2. Hours & Attendance', align: 'left' },
  { key: 'contact', label: '3. Gov Email & Security', align: 'left' },
  { key: 'statutory', label: '4. GSIS & PhilHealth', align: 'left' },
  { key: 'deductions', label: '5. Deductions (Tax & Loans)', align: 'right' },
  { key: 'net', label: '6. Net Payout (PHP)', align: 'right' },
  { key: 'actions', label: '7. Status & Dispatch', align: 'center' },
] as const

const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' } as const

const pageCount = computed(() => getPageCount(pagination.total, pagination.pageSize))
const range = computed(() => getPageRange(pagination.page, pagination.pageSize, pagination.total))
</script>

<template>
  <section
    aria-label="Payroll calculation ledger"
    class="flex flex-col overflow-hidden rounded-lg bg-surface-container-lowest shadow-sm"
  >
    <div
      class="flex flex-col justify-between gap-space-xs bg-surface-container-low px-space-md py-space-sm sm:flex-row sm:items-center"
    >
      <div class="flex items-center gap-space-sm">
        <label class="flex cursor-pointer items-center gap-2 select-none">
          <BaseCheckbox label="Select all rows" :checked="selectedCount > 0" />
          <span class="font-label-strong text-label-strong text-on-surface uppercase">
            Select All ({{ formatNumber(selectedCount) }} Rows Checked)
          </span>
        </label>
        <span class="text-body-sm text-outline" aria-hidden="true">•</span>
        <span
          class="font-label-code text-label-code font-semibold"
          :class="selectedCount > 0 ? 'text-secondary' : 'text-outline'"
        >
          {{ selectedCount > 0 ? 'Ready for Encrypted PDF Packaging' : 'Waiting for DTR data' }}
        </span>
      </div>
      <div
        class="flex items-center gap-space-sm font-label-code text-label-code text-on-surface-variant"
      >
        <span>
          Displaying {{ range.start }}-{{ range.end }} of
          {{ formatNumber(pagination.total) }} Employees
        </span>
        <span class="rounded-sm bg-surface-container px-1.5 py-0.5 font-semibold text-on-surface">
          Page {{ pagination.page }} of {{ pageCount }}
        </span>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[68rem] border-collapse text-left">
        <caption class="sr-only">
          Payroll calculation for the active disbursement cycle
        </caption>
        <thead>
          <tr
            class="bg-surface-container font-label-strong text-label-strong tracking-wider text-on-surface-variant uppercase"
          >
            <th scope="col" class="w-10 px-3 py-3 text-center">
              <span class="sr-only">Row select</span>
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="px-3 py-3"
              :class="alignClass[column.align]"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-container-high font-body-sm text-body-sm">
          <TableEmptyRow
            v-if="rows.length === 0"
            :colspan="8"
            icon="table_rows"
            title="No payroll records loaded"
            description="Select a DTR biometrics folder to calculate hours, deductions and net pay."
          />
          <PayrollLedgerRow v-for="row in rows" :key="row.id" :row="row" />
        </tbody>
      </table>
    </div>

    <LedgerPagination :pagination="pagination" />
  </section>
</template>

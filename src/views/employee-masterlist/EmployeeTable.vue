<script setup lang="ts">
import { computed } from 'vue'

import BaseButton from '@/views/components/ui/BaseButton.vue'
import BaseCheckbox from '@/views/components/ui/BaseCheckbox.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import PagerNav from '@/views/components/ui/PagerNav.vue'
import TableEmptyRow from '@/views/components/ui/TableEmptyRow.vue'
import { formatNumber } from '@/utils/format'
import { getPageCount, getPageRange, type Pagination } from '@/utils/pagination'
import type { EmployeeRecord } from '@/models/employee-masterlist/types'
import EmployeeRow from './EmployeeRow.vue'

const { pagination } = defineProps<{
  employees: readonly EmployeeRecord[]
  pagination: Pagination
}>()

const columns = [
  { key: 'employee', label: 'Employee / Plantilla Designation', align: 'left', width: '' },
  { key: 'gsis', label: 'GSIS Statutory Account', align: 'left', width: '' },
  { key: 'pagibig', label: 'Pag-IBIG Fund (HDMF)', align: 'left', width: '' },
  { key: 'philhealth', label: 'PhilHealth Insurance', align: 'left', width: '' },
  { key: 'compensation', label: 'Compensation Rate (SSL VI)', align: 'right', width: 'w-44' },
  { key: 'actions', label: 'Actions', align: 'center', width: 'w-28' },
] as const

const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' } as const

const pageCount = computed(() => getPageCount(pagination.total, pagination.pageSize))
const range = computed(() => getPageRange(pagination.page, pagination.pageSize, pagination.total))
</script>

<template>
  <section
    aria-label="Employee masterlist"
    class="flex flex-col overflow-hidden rounded-lg bg-surface-container-lowest shadow-sm"
  >
    <div class="overflow-x-auto">
      <table class="w-full min-w-[68rem] border-collapse text-left">
        <caption class="sr-only">
          Employee statutory identities and compensation rates
        </caption>
        <thead>
          <tr
            class="bg-surface-container font-label-strong text-label-strong tracking-wider text-on-surface-variant uppercase"
          >
            <th scope="col" class="w-10 px-3 py-3 text-center">
              <BaseCheckbox label="Select all employees" />
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              class="px-3 py-3"
              :class="[alignClass[column.align], column.width]"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-surface-container-high">
          <TableEmptyRow
            v-if="employees.length === 0"
            :colspan="7"
            icon="badge"
            title="No employees loaded"
            description="Use Import Master (.xlsx) to load the employee masterlist."
          />
          <EmployeeRow v-for="employee in employees" :key="employee.id" :employee="employee" />
        </tbody>
      </table>
    </div>

    <div
      class="flex flex-col gap-space-sm bg-surface-container-lowest px-space-md py-space-sm lg:flex-row lg:items-center lg:justify-between"
    >
      <div
        class="flex flex-wrap items-center gap-space-sm font-label-code text-label-code text-on-surface-variant"
      >
        <span>
          Showing {{ range.start }}-{{ range.end }} of
          {{ formatNumber(pagination.total) }} employees
        </span>
        <BaseButton size="sm">
          <MaterialIcon name="file_download" class="text-[18px] text-outline" />
          Export DBM Format
        </BaseButton>
        <BaseButton size="sm">
          <MaterialIcon name="tune" class="text-[18px] text-outline" />
          Batch Adjust Rates
        </BaseButton>
      </div>
      <PagerNav
        :page="pagination.page"
        :page-count="pageCount"
        label="Employee masterlist pagination"
      />
    </div>
  </section>
</template>

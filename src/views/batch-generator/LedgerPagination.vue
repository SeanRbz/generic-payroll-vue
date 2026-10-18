<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import PagerNav from '@/views/components/ui/PagerNav.vue'
import { formatNumber } from '@/utils/format'
import { getPageCount, getPageRange, type Pagination } from '@/utils/pagination'

const { pagination } = defineProps<{ pagination: Pagination }>()

const pageSize = shallowRef(String(pagination.pageSize))

const pageSizeOptions = computed(() => [
  { value: '8', label: '8 rows' },
  { value: '20', label: '20 rows' },
  { value: '50', label: '50 rows' },
  { value: 'all', label: `All ${formatNumber(pagination.total)}` },
])

const pageCount = computed(() => getPageCount(pagination.total, pagination.pageSize))
const range = computed(() => getPageRange(pagination.page, pagination.pageSize, pagination.total))
</script>

<template>
  <div
    class="flex flex-col items-center justify-between gap-space-md bg-surface-container-lowest px-space-md py-space-sm sm:flex-row"
  >
    <div
      class="flex items-center gap-space-sm font-label-code text-label-code text-on-surface-variant"
    >
      <label for="ledger-page-size">Rows per page:</label>
      <select
        id="ledger-page-size"
        v-model="pageSize"
        class="rounded-sm bg-surface-container-low px-2 py-1 text-on-surface focus:ring-1 focus:ring-primary-container focus:outline-none"
      >
        <option v-for="option in pageSizeOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <span aria-hidden="true">•</span>
      <span>
        Showing records {{ range.start }} - {{ range.end }} of
        {{ formatNumber(pagination.total) }} total
      </span>
    </div>

    <PagerNav :page="pagination.page" :page-count="pageCount" label="Ledger pagination" />
  </div>
</template>

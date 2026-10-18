<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import BaseButton from '@/views/components/ui/BaseButton.vue'
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'
import SearchField from '@/views/components/ui/SearchField.vue'
import SelectField from '@/views/components/ui/SelectField.vue'
import type { SelectOption } from '@/types/ui'
import type { StatusFilterId } from '@/models/batch-generator/types'

const { counts, bureauOptions, employmentTypeOptions } = defineProps<{
  counts: Record<StatusFilterId, number>
  /** Bureaus to filter by. The toolbar puts its own "All" choice in front. */
  bureauOptions: readonly SelectOption[]
  employmentTypeOptions: readonly SelectOption[]
}>()

const query = shallowRef('')
const bureau = shallowRef('all')
const employmentType = shallowRef('all')
const activeStatus: StatusFilterId = 'all'

const bureauChoices = computed<readonly SelectOption[]>(() => [
  { value: 'all', label: 'All Bureaus & Services (All)' },
  ...bureauOptions,
])

const statusFilters = computed(() => [
  { id: 'all', label: `All (${counts.all})`, inactiveClass: '' },
  {
    id: 'ready',
    label: `Ready (${counts.ready})`,
    inactiveClass: 'text-on-surface-variant hover:text-on-surface',
  },
  {
    id: 'flagged',
    label: `Flagged (${counts.flagged})`,
    inactiveClass: 'text-error hover:text-on-surface',
  },
])
</script>

<template>
  <div
    class="flex flex-col justify-between gap-space-md rounded-lg bg-surface-container-lowest p-space-md shadow-sm lg:flex-row lg:items-center"
  >
    <div class="flex flex-1 flex-wrap items-center gap-space-sm">
      <SearchField
        v-model="query"
        label="Filter employees"
        placeholder="Filter Employee Name, TIN, or ID..."
        clearable
        class="w-full sm:w-80"
      />
      <SelectField
        v-model="bureau"
        label="Filter by bureau or service"
        :options="bureauChoices"
        class="min-w-[210px]"
      />
      <SelectField
        v-model="employmentType"
        label="Filter by employment status"
        :options="employmentTypeOptions"
        icon="filter_alt"
        class="min-w-[170px]"
      />
      <div
        role="group"
        aria-label="Filter by readiness"
        class="flex items-center gap-1 rounded-sm bg-surface-container-low p-1"
      >
        <button
          v-for="filter in statusFilters"
          :key="filter.id"
          type="button"
          :aria-pressed="filter.id === activeStatus"
          class="rounded-sm px-2.5 py-1 font-label-code text-label-code"
          :class="
            filter.id === activeStatus
              ? 'bg-surface-container-lowest font-bold text-primary shadow-sm'
              : filter.inactiveClass
          "
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-space-xs self-end lg:self-auto">
      <BaseButton size="sm">
        <MaterialIcon name="file_download" class="text-[18px] text-outline" />
        Export DBM Form
      </BaseButton>
      <BaseButton size="sm">
        <MaterialIcon name="print" class="text-[18px] text-outline" />
        Print Summary
      </BaseButton>
      <BaseButton
        size="sm"
        aria-label="Refresh calculation formulas"
        title="Refresh calculation formulas"
      >
        <MaterialIcon name="refresh" class="text-[18px] text-outline" />
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import SearchField from '@/views/components/ui/SearchField.vue'
import SelectField from '@/views/components/ui/SelectField.vue'
import type { SelectOption } from '@/types/ui'

const { bureauOptions, classificationOptions, statutoryStatusOptions } = defineProps<{
  /** Bureaus to filter by. The toolbar puts its own "All" choice in front. */
  bureauOptions: readonly SelectOption[]
  classificationOptions: readonly SelectOption[]
  statutoryStatusOptions: readonly SelectOption[]
}>()

const query = shallowRef('')
const bureau = shallowRef('all')
const classification = shallowRef('all')
const statutoryStatus = shallowRef('all')

const bureauChoices = computed<readonly SelectOption[]>(() => [
  { value: 'all', label: 'All Bureaus & Services' },
  ...bureauOptions,
])
</script>

<template>
  <div
    class="flex flex-col gap-space-sm rounded-lg bg-surface-container-lowest p-space-md shadow-sm lg:flex-row lg:items-center"
  >
    <SearchField
      v-model="query"
      label="Search employees"
      placeholder="Search by Employee ID, Name, GSIS BP #, or PhilHealth PIN..."
      clearable
      class="min-w-0 flex-1"
    />
    <SelectField
      v-model="bureau"
      label="Filter by bureau or service"
      :options="bureauChoices"
      class="lg:w-56"
    />
    <SelectField
      v-model="classification"
      label="Filter by classification"
      :options="classificationOptions"
      class="lg:w-48"
    />
    <SelectField
      v-model="statutoryStatus"
      label="Filter by statutory status"
      :options="statutoryStatusOptions"
      icon="filter_alt"
      class="lg:w-52"
    />
  </div>
</template>

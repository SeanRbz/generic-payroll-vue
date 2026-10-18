<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import SearchField from '@/views/components/ui/SearchField.vue'
import SelectField from '@/views/components/ui/SelectField.vue'
import type { SelectOption } from '@/types/ui'

const { bureauOptions } = defineProps<{ bureauOptions: readonly SelectOption[] }>()

const query = shallowRef('')
const bureau = shallowRef('all')

const bureauChoices = computed<readonly SelectOption[]>(() => [
  { value: 'all', label: 'All Bureaus & Services' },
  ...bureauOptions,
])
</script>

<template>
  <div class="flex flex-col gap-space-sm sm:flex-row">
    <SearchField
      v-model="query"
      label="Search recipients"
      placeholder="Search by Employee Name, ID, or GovNet Email..."
      class="min-w-0 flex-1"
    />
    <SelectField
      v-model="bureau"
      label="Filter recipients by bureau or service"
      :options="bureauChoices"
      class="sm:w-56"
    />
  </div>
</template>

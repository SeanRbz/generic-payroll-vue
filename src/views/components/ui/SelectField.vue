<script setup lang="ts">
import { useId } from 'vue'

import MaterialIcon from './MaterialIcon.vue'
import type { SelectOption } from '@/types/ui'

const model = defineModel<string>({ required: true })
const id = useId()

const { icon = 'expand_more' } = defineProps<{
  label: string
  options: readonly SelectOption[]
  icon?: string
}>()
</script>

<template>
  <div class="relative">
    <select
      :id="id"
      v-model="model"
      :aria-label="label"
      class="h-10 w-full cursor-pointer appearance-none rounded-sm bg-surface-container-low pr-8 pl-3 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary-container focus:outline-none"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <MaterialIcon
      :name="icon"
      class="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-outline"
    />
  </div>
</template>

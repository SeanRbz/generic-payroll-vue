<script setup lang="ts">
import { useId } from 'vue'

import MaterialIcon from './MaterialIcon.vue'

const model = defineModel<string>({ default: '' })
const id = useId()

defineProps<{
  label: string
  placeholder?: string
  clearable?: boolean
}>()
</script>

<template>
  <div class="relative">
    <MaterialIcon
      name="search"
      class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-outline"
    />
    <input
      :id="id"
      v-model="model"
      type="text"
      :aria-label="label"
      :placeholder="placeholder"
      class="h-10 w-full rounded-sm bg-surface-container-low pr-8 pl-9 font-body-sm text-body-sm text-on-surface transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container focus:outline-none"
    />
    <button
      v-if="clearable"
      type="button"
      aria-label="Clear search"
      class="absolute top-1/2 right-2.5 -translate-y-1/2 text-outline hover:text-on-surface"
      @click="model = ''"
    >
      <MaterialIcon name="close" class="text-[16px]" />
    </button>
  </div>
</template>

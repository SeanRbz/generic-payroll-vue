<script setup lang="ts">
import MaterialIcon from './MaterialIcon.vue'

defineProps<{
  colspan: number
  icon: string
  title: string
  description?: string
}>()
</script>

<template>
  <tr>
    <td :colspan="colspan" class="px-3 py-12 text-center">
      <div class="flex flex-col items-center gap-space-xs">
        <span
          class="flex size-12 items-center justify-center rounded-full bg-surface-container text-outline"
        >
          <MaterialIcon :name="icon" class="text-[24px]" />
        </span>
        <p class="font-body-md text-body-md font-semibold text-on-surface">{{ title }}</p>
        <p v-if="description" class="max-w-sm font-body-sm text-body-sm text-on-surface-variant">
          {{ description }}
        </p>
      </div>
    </td>
  </tr>
</template>

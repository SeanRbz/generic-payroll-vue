<script setup lang="ts">
import MaterialIcon from '@/views/components/ui/MaterialIcon.vue'

defineProps<{ message: string }>()
</script>

<template>
  <aside
    class="flex gap-space-sm rounded-lg border-l-4 border-primary-container bg-surface-container-low p-space-md"
  >
    <MaterialIcon name="verified_user" class="mt-0.5 shrink-0 text-[20px] text-primary" />
    <div>
      <h3 class="font-body-md text-body-md font-bold text-on-surface">
        Security &amp; Regulatory Compliance Note
      </h3>
      <p class="mt-0.5 font-body-sm text-body-sm text-on-surface-variant">{{ message }}</p>
    </div>
  </aside>
</template>
